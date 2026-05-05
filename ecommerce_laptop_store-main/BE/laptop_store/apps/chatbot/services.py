import re
import os
import logging
import anthropic
from django.db.models import Q, Min
from apps.catalog.models import Product, Category

logger = logging.getLogger(__name__)


def extract_price_range(message):
    """Parse Vietnamese price mentions."""
    msg = message.lower().replace(',', '.').replace('_', '')
    min_price = None
    max_price = None

    range_pat = r'(?:từ|tầm|khoảng)?\s*(\d+(?:\.\d+)?)\s*(?:-|đến|tới)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)'
    m = re.search(range_pat, msg)
    if m:
        return float(m.group(1)) * 1_000_000, float(m.group(2)) * 1_000_000

    under_pat = r'(?:dưới|under|<)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)'
    m = re.search(under_pat, msg)
    if m:
        return None, float(m.group(1)) * 1_000_000

    over_pat = r'(?:trên|từ|>)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)'
    m = re.search(over_pat, msg)
    if m:
        return float(m.group(1)) * 1_000_000, None

    approx_pat = r'(?:tầm|khoảng|chừng|giá|tam)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)'
    m = re.search(approx_pat, msg)
    if m:
        val = float(m.group(1)) * 1_000_000
        return val * 0.8, val * 1.2

    simple_pat = r'(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)'
    m = re.search(simple_pat, msg)
    if m:
        val = float(m.group(1)) * 1_000_000
        return val * 0.8, val * 1.2

    return None, None


def extract_keywords(message):
    """Extract product/brand keywords from message."""
    msg = message.lower()
    brands = [
        'macbook', 'lenovo', 'asus', 'acer', 'dell', 'hp', 'msi',
        'apple', 'lg', 'razer', 'gigabyte', 'huawei', 'samsung',
    ]
    product_types = [
        'laptop', 'máy tính', 'may tinh', 'gaming', 'ultrabook',
        'workstation', 'văn phòng', 'van phong', 'đồ họa', 'do hoa',
    ]
    features = [
        'gaming', 'pin trâu', 'mỏng nhẹ', 'mong nhe', 'ram 16',
        'ram 32', 'ssd', 'rtx', 'gtx', 'i5', 'i7', 'i9', 'ryzen',
    ]
    found = []
    for kw in brands + product_types + features:
        if kw in msg:
            found.append(kw)
    return found


def search_products(message, limit=10):
    """Query products based on user message."""
    qs = Product.objects.filter(status=True).select_related('category')
    qs = qs.annotate(min_variation_price=Min('variations__price'))

    min_price, max_price = extract_price_range(message)
    if min_price is not None:
        qs = qs.filter(
            Q(base_price__gte=min_price) | Q(min_variation_price__gte=min_price)
        )
    if max_price is not None:
        qs = qs.filter(
            Q(base_price__lte=max_price) | Q(min_variation_price__lte=max_price)
        )

    keywords = extract_keywords(message)
    if keywords:
        keyword_q = Q()
        for kw in keywords:
            keyword_q |= Q(name__icontains=kw) | Q(category__name__icontains=kw)
        qs = qs.filter(keyword_q)

    return list(qs.order_by('-featured', '-created_at')[:limit])


def format_products_for_prompt(products):
    """Format product list into text for AI prompt."""
    if not products:
        return "Hiện không có sản phẩm nào phù hợp trong kho."

    lines = []
    for p in products:
        price_display = f"{int(p.base_price):,}đ".replace(',', '.')
        category_name = p.category.name if p.category else "N/A"
        lines.append(
            f"- [{p.id}] {p.name} | Danh mục: {category_name} | Giá: {price_display}"
        )
    return "\n".join(lines)


def get_ai_response(user_message, products, conversation_history=None):
    """Send message + product context to Claude and return response."""
    api_key = os.getenv('ANTHROPIC_API_KEY', '')
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY not set, using fallback response")
        return fallback_response(user_message, products)

    try:
        client = anthropic.Anthropic(api_key=api_key)

        product_context = format_products_for_prompt(products)

        system_prompt = f"""Bạn là trợ lý tư vấn mua laptop thông minh của cửa hàng LaptopQTK.

NHIỆM VỤ:
- Tư vấn khách hàng chọn laptop phù hợp với nhu cầu và ngân sách
- Giải thích các thông số kỹ thuật một cách dễ hiểu
- So sánh sản phẩm khi được hỏi
- Chỉ gợi ý sản phẩm từ danh sách bên dưới, KHÔNG bịa ra sản phẩm

QUY TẮC TRẢ LỜI:
- Luôn trả lời bằng tiếng Việt, thân thiện và ngắn gọn
- Tối đa 150 từ mỗi câu trả lời
- Khi gợi ý sản phẩm: nêu tên, giá và 1-2 điểm nổi bật
- Nếu không có sản phẩm phù hợp: thành thật nói và gợi ý khách xem thêm
- Nếu câu hỏi không liên quan mua hàng: lịch sự từ chối và hướng về tư vấn sản phẩm
- Hỏi thêm nhu cầu nếu khách chưa rõ (dùng cho gaming, văn phòng, hay đồ họa?)

KHO SẢN PHẨM HIỆN CÓ:
{product_context}
"""

        messages = [{"role": "user", "content": user_message}]

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=400,
            system=system_prompt,
            messages=messages,
        )

        return response.content[0].text

    except anthropic.AuthenticationError:
        logger.error("Claude API: Invalid API key")
        return fallback_response(user_message, products)
    except anthropic.RateLimitError:
        logger.error("Claude API: Rate limit exceeded")
        return "Xin lỗi, hệ thống đang bận. Bạn vui lòng thử lại sau ít phút nhé!"
    except Exception as e:
        logger.error(f"Claude API error: {e}")
        return fallback_response(user_message, products)


def fallback_response(user_message, products):
    """Simple fallback when AI API is unavailable."""
    if not products:
        return (
            "Xin lỗi, mình không tìm thấy sản phẩm phù hợp. "
            "Bạn có thể mô tả rõ hơn nhu cầu (gaming, văn phòng, ngân sách) được không?"
        )
    lines = ["Dựa trên yêu cầu, mình gợi ý:\n"]
    for p in products[:3]:
        price = f"{int(p.base_price):,}đ".replace(',', '.')
        lines.append(f"• {p.name} — {price}")
    lines.append("\nBạn muốn biết thêm về sản phẩm nào?")
    return "\n".join(lines)
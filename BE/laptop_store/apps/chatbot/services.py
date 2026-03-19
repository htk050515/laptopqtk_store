import re
import os
import logging
from google import genai
from django.db.models import Q, Min
from apps.catalog.models import Product, Category

logger = logging.getLogger(__name__)


def extract_price_range(message):
    """Parse Vietnamese price mentions.
    Supports: '10 triệu', 'tầm 5-10tr', 'dưới 15 triệu', 'trên 20tr', 'khoảng 10 củ'
    Returns (min_price, max_price) in VND or (None, None).
    """
    msg = message.lower().replace(',', '.').replace('_', '')

    min_price = None
    max_price = None

    # Pattern: range "5-10 triệu", "từ 5 đến 10 tr"
    range_pat = r'(?:từ|tầm|khoảng)?\s*(\d+(?:\.\d+)?)\s*(?:-|đến|tới)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)'
    m = re.search(range_pat, msg)
    if m:
        min_price = float(m.group(1)) * 1_000_000
        max_price = float(m.group(2)) * 1_000_000
        return min_price, max_price

    # Pattern: "dưới/under X triệu"
    under_pat = r'(?:dưới|under|<)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)'
    m = re.search(under_pat, msg)
    if m:
        max_price = float(m.group(1)) * 1_000_000
        return None, max_price

    # Pattern: "trên/trở lên X triệu"
    over_pat = r'(?:trên|từ|>)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)'
    m = re.search(over_pat, msg)
    if m:
        min_price = float(m.group(1)) * 1_000_000
        return min_price, None

    # Pattern: "tầm/khoảng X triệu" (± 20%)
    approx_pat = r'(?:tầm|khoảng|chừng|giá|tam)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)'
    m = re.search(approx_pat, msg)
    if m:
        val = float(m.group(1)) * 1_000_000
        min_price = val * 0.8
        max_price = val * 1.2
        return min_price, max_price

    # Pattern: standalone "X triệu" (± 20%)
    simple_pat = r'(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)'
    m = re.search(simple_pat, msg)
    if m:
        val = float(m.group(1)) * 1_000_000
        min_price = val * 0.8
        max_price = val * 1.2
        return min_price, max_price

    return None, None


def extract_keywords(message):
    """Extract product/brand keywords from message."""
    msg = message.lower()

    brands = [
        'iphone', 'samsung', 'xiaomi', 'oppo', 'vivo', 'realme', 'huawei',
        'nokia', 'macbook', 'lenovo', 'asus', 'acer', 'dell', 'hp', 'msi',
        'apple', 'google', 'pixel', 'redmi', 'poco', 'oneplus',
    ]

    product_types = [
        'điện thoại', 'dien thoai', 'laptop', 'máy tính', 'may tinh',
        'tablet', 'máy tính bảng', 'ipad',
    ]

    features = [
        'gaming', 'pin trâu', 'pin khỏe', 'camera', 'chụp ảnh',
        'mỏng nhẹ', 'chống nước', '5g', 'sạc nhanh',
    ]

    found = []
    for kw in brands + product_types + features:
        if kw in msg:
            found.append(kw)

    return found


def search_products(message, limit=10):
    """Query products based on user message."""
    qs = Product.objects.filter(status=True).select_related('category')

    min_price, max_price = extract_price_range(message)

    # Get minimum variation price for filtering
    qs = qs.annotate(min_variation_price=Min('variations__price'))

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
        return "Không có sản phẩm nào phù hợp trong cơ sở dữ liệu."

    lines = []
    for p in products:
        price_display = f"{int(p.base_price):,}đ".replace(',', '.')
        category_name = p.category.name if p.category else "N/A"
        lines.append(f"- {p.name} | Danh mục: {category_name} | Giá: {price_display} | ID: {p.id}")
    return "\n".join(lines)


def get_ai_response(user_message, products):
    """Send message + product context to Gemini and return response."""
    api_key = os.getenv('GEMINI_API_KEY', '')
    if not api_key:
        return fallback_response(user_message, products)

    try:
        client = genai.Client(api_key=api_key)

        product_context = format_products_for_prompt(products)

        prompt = (
            "Bạn là trợ lý tư vấn mua hàng của cửa hàng LaptopQTK - chuyên bán điện thoại và laptop.\n"
            "Quy tắc:\n"
            "- Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, dễ hiểu\n"
            "- Chỉ gợi ý sản phẩm từ danh sách bên dưới, KHÔNG bịa sản phẩm\n"
            "- Nếu không có sản phẩm phù hợp, hãy nói rõ và gợi ý khách xem thêm trên website\n"
            "- Nếu khách hỏi ngoài phạm vi (không liên quan mua hàng), hãy lịch sự từ chối và hướng dẫn khách hỏi về sản phẩm\n"
            "- Khi gợi ý, nêu tên sản phẩm và giá\n"
            "- Trả lời tối đa 150 từ\n\n"
            f"Sản phẩm hiện có:\n{product_context}\n\n"
            f"Khách hàng hỏi: {user_message}"
        )

        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
        )
        return response.text
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return fallback_response(user_message, products)


def fallback_response(user_message, products):
    """Simple fallback when AI API is unavailable."""
    if not products:
        return "Xin lỗi, mình không tìm thấy sản phẩm phù hợp. Bạn có thể mô tả rõ hơn nhu cầu được không?"

    lines = ["Dựa trên yêu cầu của bạn, mình gợi ý những sản phẩm sau:\n"]
    for p in products[:5]:
        price = f"{int(p.base_price):,}đ".replace(',', '.')
        lines.append(f"• {p.name} - {price}")
    lines.append("\nBạn muốn tìm hiểu thêm về sản phẩm nào?")
    return "\n".join(lines)

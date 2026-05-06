"""
apps/chatbot/services.py — LaptopQTK AI Chatbot (Claude API)
Nâng cấp: conversation history, context-aware, product cards
"""
import re
import os
import logging
import anthropic
from django.db.models import Q, Min
from apps.catalog.models import Product, Category

logger = logging.getLogger(__name__)

# ─── Price parser ─────────────────────────────────────────────────────────────
def extract_price_range(message):
    msg = message.lower().replace(',', '.').replace('_', '')
    m = re.search(r'(?:từ|tầm|khoảng)?\s*(\d+(?:\.\d+)?)\s*(?:-|đến|tới)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)', msg)
    if m:
        return float(m.group(1)) * 1e6, float(m.group(2)) * 1e6
    m = re.search(r'(?:dưới|under|<)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)', msg)
    if m:
        return None, float(m.group(1)) * 1e6
    m = re.search(r'(?:trên|từ|>)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)', msg)
    if m:
        return float(m.group(1)) * 1e6, None
    m = re.search(r'(?:tầm|khoảng|chừng|giá)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)', msg)
    if m:
        val = float(m.group(1)) * 1e6
        return val * 0.8, val * 1.2
    m = re.search(r'(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ)', msg)
    if m:
        val = float(m.group(1)) * 1e6
        return val * 0.8, val * 1.2
    return None, None


# ─── Keyword extractor ────────────────────────────────────────────────────────
def extract_keywords(message):
    msg = message.lower()
    BRANDS = ['macbook', 'lenovo', 'asus', 'acer', 'dell', 'hp', 'msi', 'apple', 'lg',
              'razer', 'gigabyte', 'samsung', 'huawei']
    NEEDS  = ['gaming', 'văn phòng', 'van phong', 'đồ họa', 'do hoa', 'mỏng nhẹ',
              'mong nhe', 'sinh viên', 'sinh vien', 'workstation', 'ultrabook']
    SPECS  = ['ram 8', 'ram 16', 'ram 32', 'ssd', 'rtx', 'gtx', 'i5', 'i7', 'i9',
              'ryzen 5', 'ryzen 7', 'ryzen 9', 'pin trâu', 'm2', 'm3']
    found = []
    for kw in BRANDS + NEEDS + SPECS:
        if kw in msg:
            found.append(kw)
    return found


# ─── Product search ───────────────────────────────────────────────────────────
def search_products(message, limit=8):
    qs = Product.objects.filter(status=True).select_related('category').prefetch_related(
        'variations', 'images'
    ).annotate(min_price=Min('variations__price'))

    min_p, max_p = extract_price_range(message)
    if min_p:
        qs = qs.filter(Q(base_price__gte=min_p) | Q(min_price__gte=min_p))
    if max_p:
        qs = qs.filter(Q(base_price__lte=max_p) | Q(min_price__lte=max_p))

    kws = extract_keywords(message)
    if kws:
        kq = Q()
        for kw in kws:
            kq |= Q(name__icontains=kw) | Q(category__name__icontains=kw) | Q(description__icontains=kw)
        qs = qs.filter(kq)

    return list(qs.order_by('-featured', '-created_at')[:limit])


def format_products_for_prompt(products):
    if not products:
        return "Hiện không có sản phẩm phù hợp trong kho."
    lines = []
    for p in products:
        v = p.variations.filter(is_default=True).first() or p.variations.first()
        price = v.discount_price or v.price if v else p.base_price
        lines.append(
            f"- [ID:{p.id}] {p.name} | {p.category.name if p.category else 'N/A'} | "
            f"Giá: {int(price):,}đ".replace(',', '.') +
            (f" (giảm từ {int(v.price):,}đ)".replace(',', '.') if v and v.discount_price else "")
        )
    return "\n".join(lines)


def format_products_for_response(products):
    """Return list of dicts for frontend product cards."""
    result = []
    for p in products[:4]:
        v = p.variations.filter(is_default=True).first() or p.variations.first()
        price = float(v.discount_price or v.price) if v else float(p.base_price)
        img   = None
        if p.images.exists():
            img = p.images.first().image_path
        result.append({
            'id':    p.id,
            'name':  p.name,
            'price': price,
            'img':   img,
            'slug':  p.slug,
        })
    return result


# ─── Claude API call ──────────────────────────────────────────────────────────
def get_ai_response(user_message, products, conversation_history=None):
    api_key = os.getenv('ANTHROPIC_API_KEY', '')
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY not set — fallback mode")
        return fallback_response(user_message, products), format_products_for_response(products)

    try:
        client = anthropic.Anthropic(api_key=api_key)
        product_context = format_products_for_prompt(products)

        system_prompt = f"""Bạn là trợ lý tư vấn mua laptop và linh kiện máy tính của cửa hàng **LaptopQTK**.

NHIỆM VỤ:
- Tư vấn chọn laptop/linh kiện phù hợp nhu cầu và ngân sách khách hàng
- Giải thích thông số kỹ thuật dễ hiểu (không dùng thuật ngữ quá chuyên sâu)
- So sánh sản phẩm khi được hỏi
- Chỉ gợi ý sản phẩm từ danh sách KHO HÀNG bên dưới — KHÔNG bịa đặt

QUY TẮC TRẢ LỜI:
- Trả lời tiếng Việt, thân thiện, ngắn gọn (tối đa 120 từ)
- Khi gợi ý: nêu tên sản phẩm, giá và 1-2 điểm nổi bật phù hợp nhu cầu
- Nếu không có sản phẩm phù hợp: thành thật nói và hỏi thêm thông tin
- Nếu câu hỏi không liên quan: lịch sự hướng về tư vấn sản phẩm
- Hỏi thêm khi cần: "Bạn dùng để gaming, văn phòng, hay đồ họa?"
- Không cần chào hỏi dài dòng, đi thẳng vào vấn đề

KHO HÀNG HIỆN CÓ:
{product_context}
"""

        # Build conversation messages
        messages = []
        if conversation_history:
            for msg in conversation_history[-6:]:  # giữ 6 turn gần nhất
                if msg.get('role') in ('user', 'assistant') and msg.get('content'):
                    messages.append({'role': msg['role'], 'content': str(msg['content'])})

        messages.append({'role': 'user', 'content': user_message})

        response = client.messages.create(
            model='claude-sonnet-4-20250514',
            max_tokens=350,
            system=system_prompt,
            messages=messages,
        )
        text = response.content[0].text
        return text, format_products_for_response(products)

    except anthropic.AuthenticationError:
        logger.error("Claude API: Invalid API key")
        return fallback_response(user_message, products), format_products_for_response(products)
    except anthropic.RateLimitError:
        return "Hệ thống đang bận, vui lòng thử lại sau ít phút!", []
    except Exception as e:
        logger.error(f"Claude API error: {e}")
        return fallback_response(user_message, products), format_products_for_response(products)


def fallback_response(user_message, products):
    if not products:
        return (
            "Xin lỗi, mình chưa tìm thấy sản phẩm phù hợp. "
            "Bạn cho mình biết thêm nhu cầu (gaming, văn phòng, ngân sách) được không?"
        )
    lines = ["Dựa trên yêu cầu, mình gợi ý:\n"]
    for p in products[:3]:
        v = p.variations.filter(is_default=True).first() or p.variations.first()
        price = v.discount_price or v.price if v else p.base_price
        lines.append(f"• {p.name} — {int(price):,}đ".replace(',', '.'))
    lines.append("\nBạn muốn biết thêm về sản phẩm nào?")
    return "\n".join(lines)
import hashlib
import hmac
import urllib.parse
from datetime import datetime

from django.conf import settings


def build_vnpay_url(invoice):
    """Generate VNPay payment URL for an invoice."""
    vnp_tmn_code = settings.VNP_TMN_CODE
    vnp_hash_secret = settings.VNP_HASH_SECRET
    vnp_url = settings.VNP_URL
    vnp_return_url = settings.VNP_RETURN_URL

    input_data = {
        'vnp_Version': '2.1.0',
        'vnp_TmnCode': vnp_tmn_code,
        'vnp_Amount': int(invoice.amount * 100),
        'vnp_Command': 'pay',
        'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S'),
        'vnp_CurrCode': 'VND',
        'vnp_IpAddr': '127.0.0.1',
        'vnp_Locale': 'vn',
        'vnp_OrderInfo': f'Thanh toán hóa đơn {invoice.invoice_number}',
        'vnp_OrderType': 'billpayment',
        'vnp_ReturnUrl': vnp_return_url,
        'vnp_TxnRef': str(invoice.invoice_number),
    }

    # Sort by key
    sorted_data = sorted(input_data.items())

    # Build hash data and query string
    hash_data = '&'.join(
        f'{urllib.parse.quote_plus(str(k))}={urllib.parse.quote_plus(str(v))}'
        for k, v in sorted_data
    )
    query_string = '&'.join(
        f'{urllib.parse.quote_plus(str(k))}={urllib.parse.quote_plus(str(v))}'
        for k, v in sorted_data
    )

    # Generate HMAC SHA512
    secure_hash = hmac.new(
        vnp_hash_secret.encode('utf-8'),
        hash_data.encode('utf-8'),
        hashlib.sha512,
    ).hexdigest()

    return f'{vnp_url}?{query_string}&vnp_SecureHash={secure_hash}'

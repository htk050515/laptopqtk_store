
// ProductFeatures.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const ProductFeatures = () => {
    const features = [
        'Giao hàng nội thành Hà Nội trong 2 giờ',
        'Bảo hành chính hãng 24 tháng',
        'Hỗ trợ cài đặt phần mềm miễn phí',
        'Đổi trả trong 7 ngày nếu lỗi',
        'Tư vấn kỹ thuật 24/7',
        'Thanh toán linh hoạt: COD, trả góp 0%'
    ];

    return (
        <div className='mt-3 grid grid-cols-1 md:grid-cols-2 gap-2'>
            {features.map((feature, i) => (
                <div key={i} className='flex gap-1'>
                    <FontAwesomeIcon icon={faCheck} className="text-[#2563eb] text-lg flex-shrink-0" />
                    <span className='text-base'>{feature}</span>
                </div>
            ))}
        </div>
    );
};

export default ProductFeatures;

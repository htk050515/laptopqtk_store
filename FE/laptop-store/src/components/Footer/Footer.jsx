import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhoneVolume, faEnvelope } from '@fortawesome/free-solid-svg-icons';

function Footer() {
    return (
        <footer className="bg-gradient-to-b from-[#1e3a5f] via-[#1e40af] to-[#172554] text-white mt-4">
            <div className="border-b border-[#2563eb]/50 py-3 w-full" />
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="text-lg font-bold uppercase tracking-wide">
                            LaptopQTK
                        </div>
                        <p className="mt-3 text-sm text-white/90">
                            Hệ thống bán lẻ laptop, linh kiện & phụ kiện công nghệ chính hãng. Cam kết giá tốt, bảo hành uy tín.
                        </p>
                    </div>

                    <div>
                        <div className="text-lg font-semibold uppercase tracking-wide">
                            Liên hệ
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-white/90">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white/80" />
                                <span>Thái Nguyên, Việt Nam</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faPhoneVolume} className="text-white/80" />
                                <a className="hover:text-white transition" href="tel:0123456789">
                                    0363 425 438
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faEnvelope} className="text-white/80" />
                                <a className="hover:text-white transition" href="mailto:contact@laptopqtk.vn">
                                    contact@laptopqtk.vn
                                </a>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="text-lg font-semibold uppercase tracking-wide">
                            Hỗ trợ
                        </div>
                        <ul className="mt-3 space-y-2 text-sm text-white/90">
                            <li><a href="/support/warranty" className="hover:text-white transition">Chính sách bảo hành</a></li>
                            <li><a href="/support/delivery" className="hover:text-white transition">Chính sách giao hàng</a></li>
                            <li><a href="/support/installment" className="hover:text-white transition">Chính sách trả góp</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="border-t border-[#2563eb]/40" />
            <div className="text-white text-center py-4 text-xs sm:text-sm tracking-wide">
                © 2025 LaptopQTK.vn
            </div>
        </footer>
    );
}

export default Footer;

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShieldHalved, faHandshake, faCircleCheck, faTruckFast } from "@fortawesome/free-solid-svg-icons"

function ServiceShop() {
    const items = [
        { icon: faShieldHalved, label: "Sản phẩm an toàn" },
        { icon: faHandshake, label: "Chất lượng cam kết" },
        { icon: faCircleCheck, label: "Dịch vụ vượt trội" },
        { icon: faTruckFast, label: "Giao hàng miễn phí" }
    ]

    return (
        <>
            <div className="container mx-auto mt-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                                <FontAwesomeIcon icon={item.icon} className="text-2xl text-green-500" />
                            </div>
                            <div className="text-gray-700 font-medium">{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default ServiceShop;
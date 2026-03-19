import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faTimes } from "@fortawesome/free-solid-svg-icons";

const ImageUpload = ({ onImageChange }) => {
    const [image, setImage] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                onImageChange(file); // Truyền file lên component cha
            };
            reader.readAsDataURL(file);
        } else {
            alert("Vui lòng chọn một tệp hình ảnh hợp lệ (.jpg, .png, .jpeg)!");
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        onImageChange(null);
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Hộp tải ảnh */}
            <label className="w-full h-full bg-[#2563eb] text-white py-4 flex items-center justify-center rounded-lg cursor-pointer hover:bg-[#1d4ed8] transition shadow-md hover:shadow-lg">
                {image ? (
                    <img src={image} alt="Preview" className="w-auto h-40 object-cover rounded-lg" />
                ) : (
                    <div className="text-center">
                        <FontAwesomeIcon icon={faUpload} className="text-2xl mb-1" />
                        <p className="text-sm">Chọn ảnh</p>
                    </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>

            {/* Nút xóa ảnh */}
            {image && (
                <button
                    onClick={handleRemoveImage}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition flex items-center gap-1"
                >
                    {/* <FontAwesomeIcon icon={faTimes} /> */}
                    Xóa ảnh
                </button>
            )}
        </div>
    );
};

export default ImageUpload;

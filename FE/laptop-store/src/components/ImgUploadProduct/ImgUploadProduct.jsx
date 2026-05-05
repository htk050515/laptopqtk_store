import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faTimes } from "@fortawesome/free-solid-svg-icons";

const ImageUploadProduct = ({ onImageChange }) => {
    const [images, setImages] = useState([]);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);

        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setImages([...images, ...newImages]);
        onImageChange(files);
    };

    const handleRemoveImage = (index) => {
        const updatedImages = [...images];
        updatedImages.splice(index, 1);
        setImages(updatedImages);
        onImageChange(updatedImages.map(img => img.file));
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <label className="w-full h-full bg-red-600 text-white py-2 flex items-center justify-center rounded-lg cursor-pointer hover:bg-[#d8576d] transition">
                <FontAwesomeIcon icon={faUpload} className="text-xl mb-1" />
                <p className="text-sm">Chọn ảnh</p>
                <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>

            <div className="flex flex-wrap gap-2">
                {images.map((img, index) => (
                    <div key={index} className="relative">
                        <img src={img.preview} alt="Preview" className="w-28 h-28 object-cover rounded-md border" />
                        <button
                            className="absolute top-0 right-0 bg-blue-500 text-white px-1 rounded-full text-xs"
                            onClick={() => handleRemoveImage(index)}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageUploadProduct;

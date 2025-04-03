import React, { useRef } from "react";
import { XCircle, Upload } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imagePreview, onImageChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onImageChange(file);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p className="text-gray-700 font-medium mb-2">Product Image</p>

      {imagePreview ? (
        <div className="relative w-full h-48 mb-3">
          <Image
            src={imagePreview}
            alt="Product preview"
            fill
            className="object-contain"
          />
          <button
            type="button"
            className="absolute top-0 right-0 bg-black bg-opacity-20 hover:bg-opacity-50 text-white p-1 rounded-full"
            onClick={handleRemoveImage}
          >
            <XCircle size={20} />
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-100 mb-3"
          onClick={triggerFileInput}
        >
          <Upload className="h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Click to upload product image
          </p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageChange}
      />

      <button
        type="button"
        className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
          imagePreview
            ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-300"
            : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300"
        }`}
        onClick={imagePreview ? handleRemoveImage : triggerFileInput}
      >
        <span className="flex items-center justify-center">
          {imagePreview ? (
            <>
              <XCircle className="h-4 w-4 mr-2" /> Remove Image
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" /> Upload Image
            </>
          )}
        </span>
      </button>
    </div>
  );
};

export default ImageUploader;
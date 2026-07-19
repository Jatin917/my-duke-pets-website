import { useRef } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import { resolveImageUrl } from '../../services/api';

/**
 * Multi-image uploader with preview.
 * existingImages: array of URL strings already saved on the server
 * newFiles: array of File objects staged for upload
 */
const ImageUploader = ({ existingImages = [], newFiles = [], onRemoveExisting, onAddFiles, onRemoveNew }) => {
  const inputRef = useRef(null);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    onAddFiles(files);
    e.target.value = '';
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
        {existingImages.map((img) => (
          <div key={img} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
            <img src={resolveImageUrl(img)} alt="pet" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemoveExisting(img)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <FiX size={12} />
            </button>
          </div>
        ))}

        {newFiles.map((file, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-primary-300 group">
            <img src={URL.createObjectURL(file)} alt="new" className="w-full h-full object-cover" />
            <span className="absolute bottom-1 left-1 text-[10px] bg-primary-500 text-white px-1.5 py-0.5 rounded">
              New
            </span>
            <button
              type="button"
              onClick={() => onRemoveNew(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <FiX size={12} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition"
        >
          <FiUpload size={20} />
          <span className="text-xs mt-1">Add</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      <p className="text-xs text-gray-400">JPEG, PNG, WEBP up to 5MB each. Up to 10 images.</p>
    </div>
  );
};

export default ImageUploader;

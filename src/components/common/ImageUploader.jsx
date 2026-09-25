import { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import './ImageUploader.css';

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function ImageUploader({
  image,
  onImageSelect,
  onImageRemove,
  label = 'Add Screenshot or Image (Optional)'
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setUploadError('');
    if (!file) return;

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setUploadError('Unsupported file type. Please upload a PNG, JPG, JPEG, or WEBP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError('Image size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onImageSelect({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        previewUrl: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove();
  };

  return (
    <div className="image-uploader">
      <div className="image-uploader__header">
        <label className="image-uploader__label">
          <ImageIcon size={16} />
          <span>{label}</span>
        </label>
        <span className="image-uploader__formats">PNG, JPG, WEBP (Max 5MB)</span>
      </div>

      {image ? (
        <div className="image-uploader__preview-card">
          <div className="image-uploader__thumb-wrapper">
            <img
              src={image.previewUrl}
              alt="Screenshot preview"
              className="image-uploader__thumb"
            />
          </div>
          <div className="image-uploader__file-info">
            <span className="image-uploader__file-name" title={image.name}>{image.name}</span>
            <span className="image-uploader__file-size">{image.size}</span>
          </div>
          <button
            type="button"
            className="image-uploader__remove-btn"
            onClick={handleRemove}
            title="Remove image"
            aria-label="Remove image"
          >
            <X size={18} />
            <span>Remove</span>
          </button>
        </div>
      ) : (
        <div
          className={`image-uploader__dropzone ${isDragging ? 'image-uploader__dropzone--active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.click();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (fileInputRef.current) fileInputRef.current.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="image-uploader__hidden-input"
            onChange={handleInputChange}
          />
          <div className="image-uploader__dropzone-content">
            <div className="image-uploader__icon-circle">
              <UploadCloud size={24} />
            </div>
            <p className="image-uploader__prompt">
              <strong>Click to upload</strong> or drag and drop screenshot here
            </p>
            <p className="image-uploader__subtext">
              Upload a screenshot of the message, email, post, or webpage
            </p>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="image-uploader__error">
          <AlertCircle size={14} />
          <span>{uploadError}</span>
        </div>
      )}

      <p className="image-uploader__privacy-note">
        🛡️ Do not upload screenshots containing passwords, OTPs, UPI PINs, bank details, card details or other sensitive personal information.
      </p>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

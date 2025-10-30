import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  onClearFile?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled, onClearFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = React.useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClearFile?.();
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <div className="upload-button-container">
        <button
          onClick={handleClick}
          disabled={disabled}
          className="upload-button"
        >
          <Upload size={20} />
          <span>{selectedFileName || 'Import Property List'}</span>
        </button>
        {selectedFileName && !disabled && (
          <button
            onClick={handleClearFile}
            className="clear-file-button"
            title="Clear file selection"
          >
            <X size={20} />
          </button>
        )}
      </div>
      {selectedFileName && (
        <div className="file-info">
          Selected: {selectedFileName}
        </div>
      )}
    </div>
  );
};

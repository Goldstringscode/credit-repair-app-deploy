'use client';

import React, { useState, useRef } from 'react';
import { Paperclip, X, File, Image, FileText, Download, Eye } from 'lucide-react';

interface FileAttachmentProps {
  file: {
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
    thumbnail?: string;
  };
  onRemove?: (fileId: string) => void;
  onPreview?: (file: any) => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

export default function FileAttachment({
  file,
  onRemove,
  onPreview,
  isUploading = false,
  uploadProgress = 0
}: FileAttachmentProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    } else if (type.includes('pdf') || type.includes('document')) {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else {
      return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number | string | undefined) => {
    console.log('FileAttachment - file object:', file);
    console.log('FileAttachment - bytes value:', bytes, 'type:', typeof bytes);
    
    // Handle different input types
    let numBytes: number;
    if (typeof bytes === 'string') {
      numBytes = parseFloat(bytes);
    } else if (typeof bytes === 'number') {
      numBytes = bytes;
    } else {
      numBytes = 0;
    }
    
    console.log('FileAttachment - converted bytes:', numBytes);
    
    if (!numBytes || numBytes === 0 || isNaN(numBytes)) {
      console.log('FileAttachment - returning unknown size');
      return 'Unknown size';
    }
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    const result = parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    console.log('FileAttachment - formatted size:', result);
    return result;
  };

  const isImage = file.type.startsWith('image/');
  const isPreviewable = isImage || file.type.includes('pdf');

  return (
    <div
      className={`relative group bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 ${
        isPreviewable ? 'cursor-pointer hover:border-blue-300 hover:bg-blue-50' : 'cursor-default'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => isPreviewable && onPreview && onPreview(file)}
    >
      {/* Remove button */}
      {onRemove && (
        <button
          onClick={() => onRemove(file.id)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* File content */}
      <div className="flex items-start space-x-3">
        {/* File icon or thumbnail */}
        <div className="flex-shrink-0">
          {isImage && file.thumbnail ? (
            <img
              src={file.thumbnail}
              alt={file.name}
              className="w-10 h-10 object-cover rounded"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
              {getFileIcon(file.type)}
            </div>
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
          
          {/* Upload progress */}
          {isUploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-1">
          {isPreviewable && onPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(file);
              }}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200 bg-blue-50 hover:bg-blue-100 rounded"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          
          {file.url && file.url !== '#' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('FileAttachment - opening file:', file.url);
                // Open file in new tab
                window.open(file.url, '_blank');
              }}
              className="p-1 text-gray-400 hover:text-green-500 transition-colors duration-200 bg-green-50 hover:bg-green-100 rounded"
              title="Open file"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          
          {(!file.url || file.url === '#') && (
            <div className="p-1 text-gray-300" title="File not available">
              <Download className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  maxFiles = 5,
  maxSize = 10, // 10MB
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  disabled = false
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files
    fileArray.forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return;
      }

      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        errors.push(`${file.name} is not a supported file type.`);
        return;
      }

      validFiles.push(file);
    });

    // Check max files
    if (validFiles.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed.`);
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200 ${
        isDragOver
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
      
      <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-600 mb-1">
        {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
      </p>
      <p className="text-xs text-gray-500">
        Max {maxFiles} files, {maxSize}MB each
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Images, PDFs, Documents, Text files
      </p>
    </div>
  );
}

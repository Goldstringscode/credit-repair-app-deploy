'use client';

import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface FilePreviewModalProps {
  file: {
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
    thumbnail?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function FilePreviewModal({
  file,
  isOpen,
  onClose
}: FilePreviewModalProps) {
  if (!isOpen) return null;

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type.includes('pdf');
  const isText = file.type.startsWith('text/');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderContent = () => {
    if (isImage && file.url) {
      return (
        <div className="max-h-96 overflow-hidden rounded-lg">
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-auto object-contain"
          />
        </div>
      );
    }

    if (isPDF && file.url) {
      return (
        <div className="w-full h-96">
          <iframe
            src={file.url}
            className="w-full h-full border-0 rounded-lg"
            title={file.name}
          />
        </div>
      );
    }

    if (isText && file.url) {
      return (
        <div className="w-full h-96 bg-gray-50 rounded-lg p-4 overflow-auto">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">
            Loading text content...
          </pre>
        </div>
      );
    }

    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">Preview not available</p>
          <p className="text-sm text-gray-500">
            This file type cannot be previewed
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {file.name}
              </h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)} • {file.type}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {file.url && (
                <a
                  href={file.url}
                  download={file.name}
                  className="p-2 text-gray-400 hover:text-green-500 transition-colors duration-200"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </a>
              )}
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  ExternalLink, 
  File, 
  Image, 
  Video, 
  Music, 
  FileText, 
  Archive,
  X,
  Maximize2,
  Minimize2,
  RotateCw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface FilePreviewProps {
  file: {
    name: string;
    type: string;
    size: number;
    url: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (file: any) => void;
}

const FILE_TYPE_ICONS = {
  'image': Image,
  'video': Video,
  'audio': Music,
  'text': FileText,
  'application': Archive,
  'default': File
};

const FILE_TYPE_COLORS = {
  'image': 'text-green-500',
  'video': 'text-purple-500',
  'audio': 'text-pink-500',
  'text': 'text-blue-500',
  'application': 'text-orange-500',
  'default': 'text-gray-500'
};

export default function FilePreview({
  file,
  isOpen,
  onClose,
  onDownload
}: FilePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileType = file.type.split('/')[0] as keyof typeof FILE_TYPE_ICONS;
  const IconComponent = FILE_TYPE_ICONS[fileType] || FILE_TYPE_ICONS.default;
  const colorClass = FILE_TYPE_COLORS[fileType] || FILE_TYPE_COLORS.default;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file);
    } else {
      // Fallback: create download link
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      resetView();
    }
  }, [isOpen, file.url]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError('Failed to load image');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'F11':
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
        break;
      case '+':
      case '=':
        e.preventDefault();
        handleZoomIn();
        break;
      case '-':
        e.preventDefault();
        handleZoomOut();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        handleRotate();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <IconComponent className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium">Failed to load file</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <div className="relative h-full flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={file.url}
              alt={file.name}
              className={`max-w-full max-h-full object-contain transition-all duration-200 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                cursor: zoom > 1 ? 'grab' : 'default'
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        );

      case 'video':
        return (
          <video
            src={file.url}
            controls
            className="max-w-full max-h-full"
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError('Failed to load video');
            }}
          >
            Your browser does not support the video tag.
          </video>
        );

      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <IconComponent className="w-16 h-16 mb-4 text-pink-500" />
            <audio
              src={file.url}
              controls
              className="w-full max-w-md"
              onLoadedData={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setError('Failed to load audio');
              }}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case 'text':
        return (
          <div className="h-full">
            <iframe
              src={file.url}
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setError('Failed to load document');
              }}
            />
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <IconComponent className={`w-16 h-16 mb-4 ${colorClass}`} />
            <p className="text-lg font-medium mb-2">Preview not available</p>
            <p className="text-sm text-center">
              This file type cannot be previewed in the browser.
            </p>
            <button
              onClick={handleDownload}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Download to view
            </button>
          </div>
        );
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 ${
      isFullscreen ? 'p-0' : 'p-4'
    }`}>
      <div className={`bg-white rounded-lg shadow-xl flex flex-col ${
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl h-full max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <IconComponent className={`w-6 h-6 ${colorClass} flex-shrink-0`} />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {file.name}
              </h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)} • {file.type}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Image Controls */}
            {fileType === 'image' && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500 min-w-0">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={resetView}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Reset View"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

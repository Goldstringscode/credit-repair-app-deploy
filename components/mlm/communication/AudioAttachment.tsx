'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';

interface AudioAttachmentProps {
  audio: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    duration: number;
  };
}

const AudioAttachment: React.FC<AudioAttachmentProps> = ({ audio }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  // Use the passed duration directly and never change it
  const duration = audio.duration || 0;
  const [displayDuration, setDisplayDuration] = useState(audio.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  console.log('🎵 AudioAttachment rendered with audio:', {
    id: audio.id,
    name: audio.name,
    url: audio.url,
    type: audio.type,
    size: audio.size,
    duration: audio.duration,
    hasValidUrl: audio.url && audio.url !== '#',
    urlType: audio.url?.startsWith('blob:') ? 'blob' : audio.url?.startsWith('http') ? 'http' : 'other',
    isDataUrl: audio.url?.startsWith('data:'),
    isBlobUrl: audio.url?.startsWith('blob:'),
    urlPrefix: audio.url?.substring(0, 50) + '...'
  });
  
  // Add console error to show what URL is being used
  if (audio.url?.startsWith('blob:')) {
    console.error('🚨 CRITICAL: AudioAttachment is receiving a BLOB URL!', audio.url);
  }
  
  console.log('🎵 AudioAttachment state:', {
    duration: duration,
    displayDuration: displayDuration,
    currentTime: currentTime,
    isFiniteDuration: isFinite(duration),
    isNaNDuration: isNaN(duration)
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time helper
  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time) || time < 0) {
      const fallbackTime = displayDuration || 0;
      const minutes = Math.floor(fallbackTime / 60);
      const seconds = Math.floor(fallbackTime % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Set initial duration from passed audio data
  useEffect(() => {
    if (audio.duration && audio.duration > 0) {
      console.log('🎵 Setting initial duration from passed data:', audio.duration);
      setDisplayDuration(audio.duration);
    }
  }, [audio.duration]);


  // Load audio metadata
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      console.log('🎵 Setting up audio element with URL:', audio.url);
      console.log('🎵 Audio element src:', audio.src);
      console.log('🎵 Audio element type:', audio.type);
      
      const handleLoadedMetadata = () => {
        // Don't update duration - use the passed duration only
        console.log('🎵 Audio metadata loaded - using passed duration:', audio.duration);
        setIsLoading(false);
      };
      
      const handleError = (e: any) => {
        console.error('🎵 Audio load error:', e);
        console.error('🎵 Audio URL:', audio.url);
        console.error('🎵 Audio type:', audio.type);
        console.error('🎵 Audio src:', audio.src);
        console.error('🎵 Error code:', e.target?.error?.code);
        console.error('🎵 Error message:', e.target?.error?.message);
        console.error('🎵 Network state:', audio.networkState);
        console.error('🎵 Ready state:', audio.readyState);
        console.error('🎵 Audio element:', audio);
        console.error('🎵 Audio canPlayType:', audio.canPlayType(audio.type));
        
        // Use passed duration as fallback when audio fails to load
        console.log('🎵 Using passed duration as fallback:', audio.duration);
        setDisplayDuration(audio.duration);
        setError(`Failed to load audio: ${e.target?.error?.message || 'Unknown error'}`);
        setIsLoading(false);
      };
      
      const handleLoadStart = () => {
        console.log('🎵 Audio load started');
        setIsLoading(true);
      };
      
      const handleCanPlay = () => {
        console.log('🎵 Audio can play');
        setIsLoading(false);
      };
      
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('error', handleError);
      
      return () => {
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
      };
    }
  }, []);

  // Update progress
  useEffect(() => {
    if (isPlaying && !isPaused) {
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          const currentTimeValue = audioRef.current.currentTime;
          // Only update if the value is valid
          if (isFinite(currentTimeValue) && !isNaN(currentTimeValue)) {
            setCurrentTime(currentTimeValue);
          }
        }
      }, 100);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, isPaused]);

  // Handle play/pause
  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying && !isPaused) {
        audioRef.current.pause();
        setIsPaused(true);
      } else {
        if (isPaused) {
          await audioRef.current.play();
          setIsPaused(false);
        } else {
          setIsLoading(true);
          await audioRef.current.play();
          setIsPlaying(true);
          setIsPaused(false);
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setError('Playback failed');
      setIsLoading(false);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    // Only update if the new time is valid
    if (isFinite(newTime) && !isNaN(newTime) && newTime >= 0) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle audio end
  const handleEnded = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
    setIsLoading(false);
  };

  // Download audio
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audio.url;
    link.download = audio.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <VolumeX className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900">Audio Error</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={audio.url}
        onEnded={handleEnded}
        preload="metadata"
      />
      
      {/* Play/Pause button */}
      <button
        onClick={togglePlayPause}
        disabled={isLoading}
        className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full transition-colors"
        title={isPlaying && !isPaused ? "Pause" : "Play"}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying && !isPaused ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>

      {/* Audio info and controls */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-900 truncate">
            {audio.name}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            {formatTime(isFinite(currentTime) && !isNaN(currentTime) ? currentTime : 0)} / {formatTime(duration)}
          </span>
        </div>
        
        {/* Progress bar */}
        <div 
          className="w-full bg-gray-200 rounded-full h-1 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="bg-blue-500 h-1 rounded-full transition-all duration-100"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        
        {/* Duration and size info */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {(audio.size / 1024).toFixed(1)} KB
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleMute}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-3 h-3" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-12 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            
            <button
              onClick={handleDownload}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title="Download audio"
            >
              <Download className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioAttachment;

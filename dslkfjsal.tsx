import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipForward,
  SkipBack,
  Subtitles,
} from "lucide-react";

interface TextTrackInfo {
  index: number;
  label: string;
  language: string;
}

interface VideoControlsProps {
  isPlaying?: boolean;
  duration?: number;
  currentTime?: number;
  volume?: number;
  isMuted?: boolean;
  onPlayPause?: () => void;
  onVolumeChange?: (value: number) => void;
  onMuteToggle?: () => void;
  onSeek?: (time: number) => void;
  onFullscreenToggle?: () => void;
  onForward?: () => void;
  onBackward?: () => void;
  textTracks?: TextTrackInfo[];
  currentTextTrackIndex?: number | null;
  onTextTrackChange?: (index: number | null) => void;
}

const VideoControls = ({
  isPlaying = false,
  duration = 100,
  currentTime = 0,
  volume = 1,
  isMuted = false,
  onPlayPause = () => {},
  onVolumeChange = () => {},
  onMuteToggle = () => {},
  onSeek = () => {},
  onFullscreenToggle = () => {},
  onForward = () => {},
  onBackward = () => {},
  textTracks = [],
  currentTextTrackIndex = null,
  onTextTrackChange = () => {},
}: VideoControlsProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);

  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Hide controls after a period of inactivity
  useEffect(() => {
    if (isHovering) {
      setShowControls(true);
      const timer = setTimeout(() => {
        if (!isHovering) setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isHovering]);

  // Close subtitles menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSubtitlesMenu(false);
    };

    if (showSubtitlesMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showSubtitlesMenu]);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 transition-opacity duration-300 w-full"
      style={{ opacity: showControls ? 1 : 0 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Progress bar */}
      <div className="w-full px-2 mb-2">
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={(values) => onSeek(values[0])}
          className="cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          {/* Play/Pause button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onPlayPause}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>

          {/* Skip backward */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackward}
            className="text-white hover:bg-white/20"
          >
            <SkipBack size={20} />
          </Button>

          {/* Skip forward */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onForward}
            className="text-white hover:bg-white/20"
          >
            <SkipForward size={20} />
          </Button>

          {/* Volume control */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMuteToggle}
              className="text-white hover:bg-white/20"
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </Button>
            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={(values) => onVolumeChange(values[0] / 100)}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Time display */}
          <div className="text-white text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Subtitles dropdown - always visible */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setShowSubtitlesMenu(!showSubtitlesMenu);
              }}
              className={`text-white hover:bg-white/20 ${currentTextTrackIndex !== null ? "bg-white/20" : ""}`}
            >
              <Subtitles size={20} />
            </Button>
            {showSubtitlesMenu && (
              <div
                className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-md p-1 min-w-32 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={`text-white text-xs py-1 px-2 hover:bg-white/20 rounded cursor-pointer ${currentTextTrackIndex === null ? "bg-white/20" : ""}`}
                  onClick={() => {
                    onTextTrackChange(null);
                    setShowSubtitlesMenu(false);
                  }}
                >
                  Off
                </div>
                {textTracks.length > 0 ? (
                  textTracks.map((track) => (
                    <div
                      key={track.index}
                      className={`text-white text-xs py-1 px-2 hover:bg-white/20 rounded cursor-pointer ${currentTextTrackIndex === track.index ? "bg-white/20" : ""}`}
                      onClick={() => {
                        onTextTrackChange(track.index);
                        setShowSubtitlesMenu(false);
                      }}
                    >
                      {track.label}{" "}
                      {track.language !== "unknown"
                        ? `(${track.language})`
                        : ""}
                    </div>
                  ))
                ) : (
                  <div className="text-white text-xs py-1 px-2 italic">
                    No subtitles detected
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fullscreen button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onFullscreenToggle}
            className="text-white hover:bg-white/20"
          >
            <Maximize size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;

import React, { useRef, useState, useEffect } from 'react';

const VideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Volume control
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
  };

  // Fullscreen toggle
  const handleFullScreen = () => {
    if (!isFullscreen) {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      } else if (playerContainerRef.current.webkitRequestFullscreen) {
        playerContainerRef.current.webkitRequestFullscreen();
      } else if (playerContainerRef.current.mozRequestFullScreen) {
        playerContainerRef.current.mozRequestFullScreen();
      } else if (playerContainerRef.current.msRequestFullscreen) {
        playerContainerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Exit fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === playerContainerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={playerContainerRef}
      className={`relative flex flex-col items-center bg-black ${
        isFullscreen ? 'w-screen h-screen' : 'w-full max-h-[500px]'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className={`w-full ${isFullscreen ? 'h-full' : 'max-h-[500px]'}`}
        controls={false} // Custom controls only
      ></video>

      {/* Custom Controls */}
      <div className="absolute bottom-0 flex justify-between items-center w-full p-4 bg-opacity-75 bg-gray-900 text-white">
        {/* Play/Pause Button */}
        <button onClick={handlePlayPause} className="text-lg">
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        {/* Volume Control */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24"
        />

        {/* Fullscreen Button */}
        <button onClick={handleFullScreen} className="text-lg">
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;

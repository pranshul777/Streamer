import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js"; // Import HLS.js
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaCog,
} from "react-icons/fa";

const VideoPlayer = ({videoUrl}) => {
  // const videoUrl = "https://res.cloudinary.com/dht0ihyfu/raw/upload/v1732043664/a04c0bbe-89bb-427b-9def-ff3db24de8ee/jcghn4w607jpphgyvffj.m3u8";
  const videoRef = useRef(null);
  const hlsInstance = useRef(null); // To store HLS.js instance
  const timelineRef = useRef(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volumeLevel, setVolumeLevel] = useState("high");
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState("HD");

  useEffect(() => {
    const video = videoRef.current;

    // HLS.js Setup
    if (Hls.isSupported() && videoUrl.endsWith(".m3u8")) {
      hlsInstance.current = new Hls();
      hlsInstance.current.loadSource(videoUrl);
      hlsInstance.current.attachMedia(video);

      hlsInstance.current.on(Hls.Events.MANIFEST_PARSED, () => {
        setTotalTime(video.duration);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS support
      video.src = videoUrl;
    } else {
      // Fallback for MP4 or other formats
      video.src = videoUrl;
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const percent = (video.currentTime / video.duration) * 100;
      timelineRef.current.style.setProperty("--progress-position", `${percent}%`);
    };

    const handleVolumeChange = () => {
      const volume = video.volume;
      const muted = video.muted;
      setVolumeLevel(muted || volume === 0 ? "muted" : volume >= 0.5 ? "high" : "low");
      setVolume(volume);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("volumechange", handleVolumeChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("volumechange", handleVolumeChange);

      // Destroy HLS instance
      if (hlsInstance.current) {
        hlsInstance.current.destroy();
      }
    };
  }, [videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    video.paused ? video.play() : video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
  };

  const changePlaybackSpeed = () => {
    const video = videoRef.current;
    let newRate = playbackRate + 0.25;
    if (newRate > 2) newRate = 0.25;
    setPlaybackRate(newRate);
    video.playbackRate = newRate;
  };

  const handleTimelineClick = (e) => {
    const video = videoRef.current;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    video.currentTime = clickPosition * video.duration;
  };

  const formatDuration = (time) => {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    const leadingZeroFormatter = new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 });

    return hours > 0
      ? `${hours}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(seconds)}`
      : `${minutes}:${leadingZeroFormatter.format(seconds)}`;
  };

  const toggleFullscreen = () => {
    const videoContainer = videoRef.current.closest(".video-container");
    if (!isFullscreen) {
      videoContainer.requestFullscreen?.() ||
        videoContainer.mozRequestFullScreen?.() ||
        videoContainer.webkitRequestFullscreen?.() ||
        videoContainer.msRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() ||
        document.mozCancelFullScreen?.() ||
        document.webkitExitFullscreen?.() ||
        document.msExitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const changeQuality = (newQuality) => setQuality(newQuality);

  return (
    <div className="video-container relative w-11/12 max-w-5xl mx-auto bg-black">
      <video ref={videoRef} className="w-full" />
      <div className="absolute bottom-0 left-0 right-0 text-white z-10 opacity-0 transition-opacity duration-150 ease-in-out hover:opacity-100 focus-within:opacity-100">
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/75 to-transparent pointer-events-none aspect-[6/1]"></div>
        <div className="flex gap-2 p-1 items-center">
          <button onClick={togglePlay}>
            {videoRef.current?.paused ? <FaPlay /> : <FaPause />}
          </button>
          <button onClick={toggleMute}>
            {volumeLevel === "muted" ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
              videoRef.current.volume = newVolume;
            }}
          />
          <button onClick={changePlaybackSpeed}>{playbackRate}x</button>
          <div
            ref={timelineRef}
            onClick={handleTimelineClick}
            className="flex items-center cursor-pointer h-2 w-full mx-2"
          >
            <div className="relative bg-gray-500/50 h-1 w-full">
              <div
                className="absolute top-0 bottom-0 left-0 bg-red-500"
                style={{ width: `${(currentTime / totalTime) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>{formatDuration(currentTime)} / {formatDuration(totalTime)}</div>
          <button onClick={toggleFullscreen}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

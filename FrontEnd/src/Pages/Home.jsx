import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import VideoCard from '../Components/VideoCard';

const Home = () => {
  const [videos, setVideos] = useState([]); // Initialize with empty array
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [query, setQuery] = useState(" ");
  const limit = 20; // Limit for API pagination
  const observer = useRef();
  const location = useLocation();

  async function fetchVideo1(Query) {
    setLoading(true);

    console.log("Fetching videos with query:", Query);
    const api = `http://localhost:8000/api/v1/video?search=${Query}&limit=${limit}&skip=${0}`;
    console.log(api);
    try {
      const response = await fetch(api);
      const json = await response.json();
      console.log(json);
      if (!response.ok) return;
      if (json?.message === "novideos") return;

      if (json?.status === "success") {
        if (json.data.length < limit) setHasMore(false); // No more videos to fetch
        setVideos((prevVideos) => [...json.data]);
        setSkip((prevSkip) =>limit);
      }
    } catch (error) {
      console.error("Error fetching videos:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch videos from API
  async function fetchVideo(Query) {
    console.log(loading);
    console.log(hasMore);
    console.log(loading || !hasMore);
    if (loading || !hasMore) return; // Prevent fetching if already loading or no more videos
    setLoading(true);

    console.log("Fetching videos with query:", Query);
    const api = `http://localhost:8000/api/v1/video?search=${Query}&limit=${limit}&skip=${skip}`;
    console.log(api);
    try {
      const response = await fetch(api);
      const json = await response.json();
      console.log(json);
      if (!response.ok) return;
      if (json?.message === "novideos") return;

      if (json?.status === "success") {
        if (json.data.length < limit) setHasMore(false); // No more videos to fetch
        setVideos((prevVideos) => [...prevVideos, ...json.data]);
        setSkip((prevSkip) => prevSkip + limit);
      }
    } catch (error) {
      console.error("Error fetching videos:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // Intersection Observer callback
  const lastVideoRef = useCallback(
    (node) => {
      if (loading) return; // Don't trigger observer if loading
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchVideo(query); // Fetch more videos when the last one is visible
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Fetch videos when search query changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get("search") || ""; // Default to empty string if no query
    setSkip(0); // Reset skip for new query
    setHasMore(true); // Reset 'hasMore' to true for the new search
    setLoading(false);
    setVideos([]); // Reset videos list
    setQuery(searchQuery);
    console.log("useEffect");
    fetchVideo1(searchQuery); // Fetch new videos based on the query
  }, [location.search]); // Dependency on location.search (URL change)

  // Render the component
  return videos.length === 0 ? (
    <div>Loading videos...</div> // Show loading message if there are no videos
  ) : (
    <div className="flex1-1 w-full min-h-screen bg-gray-100 p-4">
      {/* Main content - Video grid */}
      <div className="grid grid-cols-3 gap-6">
        {videos.map((video, ind) => {
          // If it's the last video, assign the ref to it
          if (ind === videos.length - 1) {
            return (
              <VideoCard ref={lastVideoRef} key={video._id} video={video} />
            );
          }
          return <VideoCard key={video._id} video={video} />;
        })}
      </div>
    </div>
  );
};

export default Home;

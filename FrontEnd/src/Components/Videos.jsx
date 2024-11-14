import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import VideoCard from './VideoCard2';
import { useSelector } from 'react-redux';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [channelId, setChannelId] = useState("");

  
  const Channel = useSelector((store)=> store.channel);

  // Fetch videos for the channel when component mounts
  useEffect(() => {
    const fetchVideos = async () => {
      if(Object.keys(Channel).length === 0) return;
      try {
        const response = await fetch(`http://localhost:8000/api/v1/video/channel/${Channel}`);
        const data = await response.json();

        if (data.status === 'success') {
          setVideos(data.data);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, [Channel]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
      {videos.length > 0 ? (
        videos.map((video) => (
          <VideoCard key={video._id} video = {video}/>
        ))
      ) : (
        <p className="text-gray-500">No videos found for this channel.</p>
      )}
    </div>
  );
};

export default Videos;

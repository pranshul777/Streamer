import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import VideoCardAdmin from '../Components/VideoCardAdmin';

const VideoAdminPage = () => {
    const [videos, setVideos] = useState([]);
  
    
    const User = useSelector((store)=> store.user);
  
    // Fetch videos for the channel when component mounts
    useEffect(() => {
      const fetchVideos = async () => {
        if(Object.keys(User).length === 0) return;
        try {
          const response = await fetch(`http://localhost:8000/api/v1/video/channel/${User._id}`);
          const data = await response.json();
          if (data.status === 'success') {
            setVideos(data.data);
          }
        } catch (error) {
          console.error('Error fetching videos:', error);
        }
      };
      fetchVideos();
    }, []);
  
    return (
      <div className="p-5 gap-5 min-h-screen">
        {videos.length > 0 ? (
          videos.map(video => <VideoCardAdmin key={video._id} video = {video}/>)
        ) : (
          <p className="text-gray-500">Upload Videos</p>
        )}
      </div>
    );
}

export default VideoAdminPage
import React, { useEffect, useState } from 'react';
import VideoCard from '../Components/VideoCard';

const Home = () => {
  const array = new Array();
    const [videos, setVideos] = useState(array);

    async function fetchVideo(){
        const response = await fetch("http://localhost:8000/api/v1/video/");
        const json = await response.json();
        if(json?.message==="novideos") return;
        setVideos(json?.data);
    }

    useEffect(()=>{
        fetchVideo();
    },[]);
  return videos.length===0? <></> : (
    <div className="flex1-1 w-full min-h-screen bg-gray-100 p-4">
      {/* Main content - Video grid */}
      <div className="grid grid-cols-3 gap-6">
          {
            videos.map((video) =>{
              return <VideoCard key={video.id} video={video}/>
            })
          }
        </div>
    </div>
  );
};

export default Home;

import React from 'react'
import { Link } from 'react-router-dom'

const VideoCard = ({video}) => {
  return (
    <Link to={`/watch/${video._id}`}><div key={video._id} className="bg-white shadow-md rounded-lg overflow-hidden">
        
            <img
            src={video.thumbnail.url}
            alt={video.title}
            className="w-full h-40 object-cover"
            />
        <div className="p-4">
            <h2 className="text-lg font-bold mb-2">{video.title}</h2>
            <div className="flex items-center space-x-2 mb-2">
            </div>
            <p className="text-sm text-gray-600">
            </p>
        </div>
    </div></Link>
  )
}

export default VideoCard
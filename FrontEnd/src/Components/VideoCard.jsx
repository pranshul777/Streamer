import React from 'react';

const VideoCard = ({ video }) => {
    const { thumbnail, title, views, uploadDate, channelName, channelLogo } = video;

    return (
        <div className="w-72 p-3 bg-white shadow-lg rounded-lg">
            {/* Video Thumbnail */}
            <img
                src={thumbnail.url}
                alt={title}
                className="w-full h-40 object-cover overflow-hidden rounded-lg"
            />

            {/* Video Details */}
            <div className="mt-3 flex">
                {/* Channel Logo */}
                <img
                    src={channelLogo}
                    alt={channelName}
                    className="w-10 h-10 rounded-full mr-3"
                />
                
                {/* Video Info */}
                <div>
                    <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
                    <p className="text-gray-600 text-xs">{channelName}</p>
                    <p className="text-gray-500 text-xs">{views} views • {uploadDate}</p>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;

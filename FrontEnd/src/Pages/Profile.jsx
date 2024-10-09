import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate,Link } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  
  // If the user is not logged in, redirect to the login page
  // if (Object.keys(user).length === 0) {
  //   alert("you've to be logged");
  //   navigate("/login");
  // }
  
  useEffect(()=>{
    if (Object.keys(user).length === 0) {
      alert("you've to be logged");
      navigate("/login");
    }
  },[user]);

  const {
    username,
    email,
    firstname,
    lastname,
    watchHistory,
    playlists,
    subscribedTo,
    subscriberCount,
    videos,
    posts,
    createdAt,
    avatar,
    coverImage,
  } = user;

  function onSwitchAccount(){
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      {/* Cover Image */}
      <div className="w-full h-48 bg-cover bg-center" style={{ backgroundImage: `url(${coverImage?.url})` }}>
      </div>

      {/* Profile Info Section */}
      <div className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 relative -mt-16">
        {/* Avatar */}
        <div className="absolute -top-12 left-8">
          <img
            className="w-24 h-24 rounded-full border-4 border-white"
            src={avatar?.url}
            alt={`${username}'s Avatar`}
          />
        </div>

        {/* User Info */}
        <div className="ml-32 mt-4">
          <h2 className="text-3xl font-bold">{firstname} {lastname}</h2>
          <p className="text-sm text-gray-500">@{username}</p>
          <p className="text-sm text-gray-500">{email}</p>
          <p className="text-sm text-gray-500">Joined on: {new Date(createdAt).toLocaleDateString()}</p>
        </div>

        {/* User Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-lg font-bold">Subscribers</h3>
            <p>{subscriberCount}</p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Subscribed To</h3>
            <p>{subscribedTo?.length}</p>
          </div>
        </div>

        {/* Links to Other Pages */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <Link
            to="/profile"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md text-center"
          >
            Watch History
          </Link>
          <Link
            to="/profile"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md text-center"
          >
            Playlists
          </Link>
          <Link
            to="/profile"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md text-center"
          >
            Your Videos
          </Link>
          <Link
            to="/profile"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md text-center"
          >
            Your Posts
          </Link>
        </div>

        {/* Switch Account Button */}
        <div className="mt-8">
          <button
            onClick={onSwitchAccount}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-md"
          >
            Switch Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

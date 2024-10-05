import React from 'react';
import Search from './Search';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className='w-full h-14 bg-white flex justify-between items-center px-4 py-1 shadow-lg'>

      {/* Logo Section */}
      <div className='w-[10%] flex justify-start items-center'>
        <img className='w-14 rounded-xl' src="src\assets\streamer logo.jpg" alt="logo" />
        <span className='font-bold text-xl ml-2'>Streamer</span>
      </div>

      {/* Search Bar */}
      <div className='w-[60%]'>
        <Search />
      </div>

      {/* Right Section (Upload, Notifications, Profile) */}
      <div className='w-[15%] flex justify-between items-center'>
        
        {/* Add New (for Uploading) */}
        <div className='cursor-pointer p-2 hover:bg-gray-200 rounded-full'>
          <img className='w-6 h-6' src="https://img.icons8.com/ios-filled/50/000000/plus-math.png" alt="Add New" />
        </div>

        {/* Notifications */}
        <div className='relative cursor-pointer p-2 hover:bg-gray-200 rounded-full'>
          <img className='w-6 h-6' src="https://img.icons8.com/ios-filled/50/000000/appointment-reminders.png" alt="Notifications" />
          <span className='absolute top-0 right-0 w-3 h-3 bg-red-600 text-white text-xs rounded-full flex items-center justify-center'>3</span>
        </div>

        {/* User Profile */}
        <Link to={"profile"}><div className='cursor-pointer p-2 hover:bg-gray-200 rounded-full'>
          <img className='w-8 h-8 rounded-full' src="https://img.icons8.com/ios-filled/50/000000/user-male-circle.png" alt="Profile" />
        </div></Link>
      </div>

    </div>
  );
}

export default Header;

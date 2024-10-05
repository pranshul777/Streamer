import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Mock user details
  const userDetails = {
    name: "John Doe",
    email: "johndoe@gmail.com",
    content: [
      { id: 1, title: "My First Video", views: "1.2K views", uploadedAt: "1 day ago" },
      { id: 2, title: "My Second Video", views: "500 views", uploadedAt: "2 days ago" },
      // Add more content as needed
    ],
  };

  // If the user is not logged in, redirect to the login page
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="p-6">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4">Profile Details</h2>
        
        {/* User Information */}
        <div className="mb-4">
          <p><strong>Name:</strong> {userDetails.name}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
        </div>

        {/* User's Uploaded Content */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Your Content</h3>
          <div className="space-y-3">
            {userDetails.content.map((item) => (
              <div key={item.id} className="bg-gray-100 p-3 rounded-lg shadow-sm">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-600">{item.views} • {item.uploadedAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

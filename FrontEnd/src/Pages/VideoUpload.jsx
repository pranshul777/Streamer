import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const VideoUpload = () => {
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);

  // If the user is not logged in, redirect to the login page
  if (Object.keys(user).length === 0) {
    alert("You've to be logged in");
    navigate("/login");
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video: null,
    thumbnail: null,
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    // For file inputs (video, thumbnail)
    if (files) {
      setFormData({
        ...formData,
        [name]: files[0], // Store the selected file
      });
    } else {
      // For text inputs (title, description)
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.title || !formData.description || !formData.video || !formData.thumbnail) {
      alert('All fields are required!');
      return;
    }

    // Prepare FormData for file upload
    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('video', formData.video);
    uploadData.append('thumbnail', formData.thumbnail);

    try {
      const response = await fetch('http://localhost:8000/api/v1/video/uploadvideo', {
        method: 'POST',
        body: uploadData, // FormData handles files automatically
        headers: {
          'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDU0ZmNkZWQyYWJlMjUyYjhmMzA2OSIsInVzZXJuYW1lIjoiQmV0YTQ1NjciLCJlbWFpbCI6ImphbmVfbWFuMjRAbWFpbC5jbyIsImlhdCI6MTcyODQxODE0MCwiZXhwIjoxNzI4NDIxNzQwfQ.oh9lAt0usIpbq0ZfpFrVdtgOJHk52qKGkBUVa2lL2vY", // Ensure token is valid
        },
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json(); // Parse JSON response
        console.log(data);

        if (data.status === 'success') {
          alert('Video uploaded successfully!');
        } else {
          alert('Video upload failed');
        }
      } else {
        // Handle non-JSON response (like an error page or HTML)
        const errorText = await response.text();
        console.error('Unexpected response:', errorText);
        alert('An unexpected error occurred.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen overflow-hidden bg-gray-100">
      <form
        className="flex flex-col mt-2 bg-white p-6 rounded shadow-md w-full max-w-md"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Upload Video</h2>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter video title"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter video description"
          />
        </div>

        {/* Video */}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2" htmlFor="video">
            Video File
          </label>
          <input
            type="file"
            id="video"
            name="video"
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept="video/*"
          />
        </div>

        {/* Thumbnail */}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2" htmlFor="thumbnail">
            Thumbnail Image
          </label>
          <input
            type="file"
            id="thumbnail"
            name="thumbnail"
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept="image/*"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const VideoEditPage = ({ initialData }) => {
    const videoId = useParams().id;
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [thumbnail, setThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const User = useSelector((store)=>store.user);

  useEffect(()=>{
    console.log("Video Editing : ",videoId);
    fetchData();
  },[])

  async function fetchData(){
    try{
        const res = await fetch(`http://localhost:8000/api/v1/video/getvideo/${videoId}`)
        const data = await res.json();
        if(res.ok && data.status == "success"){
            setTitle(data.data.title);
            setDescription(data.data.description);
            // setThumbnail(null);
            return ;
        }
        console.error(err.message);
    }
    catch(err){
        console.error(err.message);
    }
  }

//   const handleThumbnailChange = (e) => {
//     setThumbnail(e.target.files[0]);
//   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    const payload = {
        title,
        description
    }
  
    try {
      const response = await fetch(`http://localhost:8000/api/v1/video/edit/${videoId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${User.token}`,
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
      console.log(result);
  
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update video details');
      }
  
      alert('Video details updated successfully!');
    } catch (error) {
      console.error('Error:', error.message);
      alert('Failed to submit data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">Edit Video Details</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Video Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>

        {/* Thumbnail Upload */}
        {/* <div>
          <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
            Thumbnail
          </label>
          <input
            type="file"
            id="thumbnail"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div> */}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoEditPage;

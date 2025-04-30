import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const VideoUpload = () => {
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const [submit, setSubmit] = useState(false);
  const [tag, setTag] = useState('');

  useEffect(() => {
    if (Object.keys(user).length === 0) {
      alert("you've to be logged in");
      navigate("/login");
    }
  }, [user]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video: null,
    thumbnail: null,
    tag : []
  });

  function tagAdd(e){
    e.preventDefault();
    if(tag.trim()=='') return;
    if(formData.tag.includes(tag.toLowerCase().trim())){
      alert("tag alredy present");
      return;
    }
    setTag("");
    if(formData.tag.length>=5){
      alert("Tags should be limited");
      return;
    }
    formData.tag.push(tag.toLowerCase().trim());
  }

  function removeTag(e){
    formData.tag.splice(formData.tag.indexOf(e.currentTarget.getAttribute("value")),1);
    const temp = formData.tag;
    setFormData({
      ...formData,
      [tag]: temp,
    });
  }

  const handleInputChange = (e) => {
    const { name, value, files} = e.target;

    if (files) {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmit(true);

    // Form validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.video || !formData.thumbnail) {
      alert('All fields are required!');
      setSubmit(false);
      return;
    }

    // Prepare FormData for file upload
    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('video', formData.video);
    uploadData.append('thumbnail', formData.thumbnail);
    uploadData.append('tag', formData.tag);
    try {
      const response = await fetch('http://localhost:8000/api/v1/video/uploadvideo', {
        method: 'POST',
        body: uploadData,
        headers: {
          'Authorization': "Bearer " + user.token,
        },
      });

      setSubmit(false);

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(data);

        if (data.status === 'success') {
          alert('Video uploaded successfully!');
        } else {
          alert(`Video upload failed: ${data.message || 'Unknown error'}`);
        }
      } else {
        const errorText = await response.text();
        console.error('Unexpected response:', errorText);
        alert('An unexpected error occurred.');
      }
    } catch (error) {
      setSubmit(false);
      console.error('Error:', error);
      alert(`An error occurred: ${error.message || 'Unknown error'}`);
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

        {/* {Tags} */}
        <div className='mb-4'>
          <label className="block text-sm font-bold mb-2" htmlFor="tag">
            Add Tags
          </label>
          <div>
              <input
              type='text'
              id='tag'
              value={tag}
              name="tag"
              onChange={(e)=>setTag(e.target.value)}
              className='w-4/5 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <button
              onClick={tagAdd}
              className='ml-5 p-1 rounded-sm px-2 bg-blue-500 hover:bg-blue-600 text-white'
              >Add
              </button>
          </div>
          <div className='flex gap-2 flex-wrap w-full px-5 mt-2 '>
            {
              formData.tag.map((tag, ind)=>(
                <div 
                className='bg-gray-400 rounded-sm hover:cursor-pointer font-semibold text-sm text-slate-900 hover:bg-gray-300'
                >
                  <div
                  className='w-full p-1'
                  value = {tag}
                  onClick={removeTag}
                  >{`${tag}  x`}
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className={`w-full py-2 rounded-md transition-colors ${submit ? 'bg-blue-400' : 'bg-blue-500'} text-white ${submit && 'cursor-not-allowed'}`}
          disabled={submit}
        >
          {submit ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;

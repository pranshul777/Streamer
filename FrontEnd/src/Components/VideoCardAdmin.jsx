import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const VideoCardAdmin = ({ video }) => {
  const navigate = useNavigate();
  const User = useSelector((store) => store.user);
  const [thumbnail, setThumbnail] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    console.log("user videos");
  }, []);

  async function deleteVideo() {
    console.log("deleting the video :", video.title);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/video/daletevideo/${video._id}`, {
        method: "DELETE",
        headers: {
          'Authorization': "Bearer " + User.token,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        if (data.status === "success") {
          alert("Video Deleted Successfully");
          navigate("/videoadmin");
        } else {
          alert("Video could not be Deleted");
        }
      }
    } catch (error) {
      alert("Video could not be Deleted");
      navigate("/videoadmin");
    }
  }

  // Handle file selection
  async function onThumbnailChange(e) {
    console.log("Thumbnail change triggered");
    if (e.target.files[0]) {
      const file = e.target.files[0];
      console.log("File selected:", file);
      setThumbnail(file); // Update thumbnail with the selected file

      // Trigger the thumbnail upload after selection
      updateThumbnail(file);
    }
  }

  // Trigger file input and handle thumbnail selection
  async function onThubnailUpdate() {
    console.log("updating thumbnail");
    // Open the file input dialog
    inputRef.current.click();
  }

  async function updateThumbnail(file) {
    if (!file) {
      alert("No file selected for thumbnail update.");
      return;
    }

    console.log("New Thumbnail will be: ", file);

    const formData = new FormData();
    formData.append("thumbnail", file); // Append the file
    console.log("FormData prepared for upload");

    try {
      const res = await fetch(`http://localhost:8000/api/v1/video/changethumbnail/${video._id}`, {
        method: "PATCH",
        headers: {
          'Authorization': "Bearer " + User.token,
          // Do not set Content-Type, fetch handles it for FormData
        },
        body: formData, // Send FormData as the body
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        alert("Thumbnail Updated Successfully");
        return;
      }

      alert("Thumbnail could not be Updated");
      navigate("/videoadmin");
    } catch (error) {
      console.error("Error updating thumbnail:", error);
      alert("Thumbnail could not be Updated");
      navigate("/videoadmin");
    }
  }

  return (
    <div key={video._id} className="my-5 bg-white shadow-md rounded-lg overflow-hidden flex">
      <Link className="w-1/4 h-40 object-cover" to={`/watch/${video._id}`}>
        <img
          src={video.thumbnail.url}
          alt={video.title}
          className="w-full h-full"
        />
      </Link>
      <div className="p-4 w-3/4 flex">
        <div className="w-4/5">
          <h2 className="text-lg font-bold mb-2">{video.title}</h2>
          <p className="text-lg font-light mb-2">created at : {video.createdAt}</p>
          <p className="text-lg font-light mb-2">updated at : {video.updatedAt}</p>
          <p className="text-gray-500 text-xs">{video.views.length} views </p>
        </div>
        <div className="h-full w-1/5 flex flex-col justify-evenly">
          <Link className="w-2/4" to={`/videoedit/${video._id}`}>
            <div className="w-full h-full text-center hover:bg-blue-600 bg-blue-500 rounded-sm text-white hover:cursor-pointer border">
              Edit
            </div>
          </Link>
          <div
            className="w-2/4 text-center bg-red-500 text-white hover:cursor-pointer hover:bg-red-600 border rounded-sm"
            onClick={deleteVideo}
          >
            Delete
          </div>
          <div
            className="w-2/4 text-center bg-red-500 text-white hover:cursor-pointer hover:bg-red-600 border rounded-sm"
            onClick={onThubnailUpdate}
          >
            Update Thumbnail
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        name="thumbnail"
        onChange={onThumbnailChange}
      />
    </div>
  );
};

export default VideoCardAdmin;

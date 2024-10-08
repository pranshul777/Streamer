import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Video = () => {
  const videoId = useParams().id;
  const [videoData, setVideoData] = useState(null);  // To hold video data from backend
  const [likeCount, setLikeCount] = useState(0);     // To manage like count
  const [comments, setComments] = useState([]);      // To hold the comments
  const [newComment, setNewComment] = useState('');  // To manage the input of new comment
  const [commentCount, setCommentCount] = useState(0);
    const [views,setViews] = useState(0);

  // Fetch video details and comments when the component mounts
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const videoResponse = await fetch(`http://localhost:8000/api/v1/video/watchvideo/${videoId}`);
        const videoJson = await videoResponse.json();
        setVideoData(videoJson.data);
        setLikeCount(videoJson.Likes); // Assuming likes are part of the video data
        setCommentCount(videoJson.Comments);
        setViews(videoJson.Views);

        const commentResponse = await fetch(`http://localhost:8000/api/v1/video/getComments/${videoId}`);
        const commentsJson = await commentResponse.json();
        setComments(commentsJson.data);
      } catch (error) {
        console.error('Error fetching video data:', error);
      }
    };

    fetchVideoData();
  }, [videoId]);

  // Handle like button click
  const handleLike = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/video/like/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDU0ZDBjMDM1ZDY0MzBmMWU3NmE5OSIsInVzZXJuYW1lIjoiQWxwaGExMjMiLCJlbWFpbCI6ImFsYXguY29vbDEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTcyODQxNTU5MSwiZXhwIjoxNzI4NDE5MTkxfQ.ytC0cHy37AJqivhMsrjqisgjWTNGl53c2Vjyq1UDG9Q", // Add the Bearer token
          'Content-Type': 'application/json'  // Specify the content type if needed
        }
      });

      const jsonData = await response.json();

      if (jsonData.status=="success") {
        alert(jsonData.message);
        setLikeCount((prevCount) => prevCount + 1);
      } else {
        alert(jsonData.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/video/comment/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDU0ZDBjMDM1ZDY0MzBmMWU3NmE5OSIsInVzZXJuYW1lIjoiQWxwaGExMjMiLCJlbWFpbCI6ImFsYXguY29vbDEyM0BleGFtcGxlLmNvbSIsImlhdCI6MTcyODQxNTU5MSwiZXhwIjoxNzI4NDE5MTkxfQ.ytC0cHy37AJqivhMsrjqisgjWTNGl53c2Vjyq1UDG9Q", // Add the Bearer token
          'Content-Type': 'application/json'  // Specify the content type if needed
        },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await response.json();
      if (data.status=="success") {
        alert(data.message);
        setComments([...comments, newComment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded shadow-lg p-6">
        {/* Video Player */}
        {videoData && (
          <>
            <div className="mb-6">
              <video className="w-full h-auto rounded-md" controls>
                <source src={videoData.videoFile.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Details */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold">{videoData.title}</h1>
            </div>

            {/* Owner Information */}
            <div className="flex items-center mb-4">
              <img
                src={videoData.ownerLogo}
                alt="Owner Avatar"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <a
                  href={`/profile/${videoData.ownerId}`}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {videoData.ownerName}
                </a>
              </div>
            </div>

            {/* Likes Section */}
            <div className="flex items-center mb-6">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md mr-3 hover:bg-blue-600"
                onClick={handleLike}
              >
                Like
              </button>
              <span className="text-gray-600">{likeCount} Likes</span>
            </div>

            {/* Comment Section */}
            <div>
              <h2 className="text-lg font-semibold mb-4">{commentCount} Comments</h2>

              {/* Existing Comments */}
              <div className="mb-4">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div key={comment._id} className='bg-gray-200 p-3 mb-2 rounded-md shadow'>
                      <div className=" text-sm text-slate-700">
                        {comment.ownername}
                      </div>
                      <div className=" text-lg">
                        {comment?.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet.</p>
                )}
              </div>

              {/* Add a Comment */}
              <form onSubmit={handleCommentSubmit} className="flex flex-col space-y-2">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                ></textarea>
                <button
                  type="submit"
                  className="self-end bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Post Comment
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Video;
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import VideoPlayer from '../Components/VideoPlayer';

const Video = () => {
  const user = useSelector((store) => store.user);

  const videoId = useParams().id;
  const [videoData, setVideoData] = useState(null);  // To hold video data from backend
  const [likeCount, setLikeCount] = useState(0);     // To manage like count
  const [comments, setComments] = useState([]);      // To hold the comments
  const [newComment, setNewComment] = useState('');  // To manage the input of new comment
  const [commentCount, setCommentCount] = useState(0);
  const [views, setViews] = useState(0);             // To manage view count
  const [liked, setLiked] = useState(false);

  // Fetch video details and comments when the component mounts
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        let api ;
        if (Object.keys(user).length === 0) api = `http://localhost:8000/api/v1/video/watchvideo/${videoId}`;
        else api = `http://localhost:8000/api/v1/video/watchvideo/${videoId}?user=${user?._id}`;
        const videoResponse = await fetch(api);
        const videoJson = await videoResponse.json();
        setVideoData(videoJson.data);
        setLikeCount(videoJson.Likes);      // Assuming likes are part of the video data
        setCommentCount(videoJson.Comments);
        setViews(videoJson.Views);          // View count from video data
        
        const flag = videoJson?.data?.likedBy.includes(user?._id);
        setLiked(flag);

        const commentResponse = await fetch(`http://localhost:8000/api/v1/video/getComments/${videoId}`);
        const commentsJson = await commentResponse.json();
        setComments(commentsJson.data);
      } catch (error) {
        console.error('Error fetching video data:', error);
      }
    };

    fetchVideoData();
  }, [videoId,user]);

  // Handle like button click
  const handleLike = async () => {
    if (Object.keys(user).length === 0) {
      alert("You need to be logged in to like a video.");
      navigate("/login");
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/api/v1/video/like/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': "Bearer " + user.token, // Add the Bearer token
          'Content-Type': 'application/json'  // Specify the content type if needed
        }
      });

      const jsonData = await response.json();

      if (jsonData.status === "success") {
        alert(jsonData.message);
        setLikeCount(likeCount + 1);
        setLiked(true);
      } else {
        alert(jsonData.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // handle dislike of video
  const handleUnlike = async () => {
    if (Object.keys(user).length === 0) {
      alert("You need to be logged in to unlike a video.");
      navigate("/login");
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/api/v1/video/unlike/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': "Bearer " + user.token, // Add the Bearer token
          'Content-Type': 'application/json'  // Specify the content type if needed
        }
      });

      const jsonData = await response.json();

      if (jsonData.status === "success") {
        alert(jsonData.message);
        setLikeCount(likeCount - 1);
        setLiked(false);
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
    if (Object.keys(user).length === 0) {
      alert("You need to be logged in to comment.");
      navigate("/login");
      return;
    }
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/video/comment/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': "Bearer " + user.token, // Add the Bearer token
          'Content-Type': 'application/json'  // Specify the content type if needed
        },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await response.json();
      if (data.status === "success") {
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
              {/* <VideoPlayer videoUrl={videoData.videoFile.url}/> */}
            </div>

            {/* Video Details */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold">{videoData.title}</h1>
              <p className="bg-gray-200 rounded-lg mt-2 p-5">{videoData.description}</p> {/* Added description */}
            </div>

            {/* Owner Information */}
            <Link to={"/channel/"+videoData.owner+"/videos"}><div className="flex items-center mb-4">
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
            </div></Link>

            {/* Likes and Views Section */}
            <div className="flex items-center mb-6 space-x-4">
              {liked?
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                onClick={handleUnlike}
              >
                Dislike
              </button> :
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                onClick={handleLike}
              >
                Like
              </button>}

              <span className="text-gray-600">{likeCount} Likes</span>
              <span className="text-gray-600">{views} Views</span> {/* Added view count */}
            </div>

            {/* Comment Section */}
            <div>
              <h2 className="text-lg font-semibold mb-4">{commentCount} Comments</h2>

              {/* Add a Comment */}
              <form onSubmit={handleCommentSubmit} className="flex flex-col space-y-2 mb-5">
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

              {/* Existing Comments */}
              <div className="mb-4">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div key={comment._id} className='bg-gray-200 p-3 mb-2 rounded-md shadow'>
                      <div className="text-sm text-slate-700">
                        {comment.ownername}
                      </div>
                      <div className="text-lg">
                        {comment?.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet.</p>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Video;

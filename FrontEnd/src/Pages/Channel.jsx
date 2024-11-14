import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Subscribe, unSubscribe } from '../Store/Slices/userSlice'; // Correct import for actions
import { SetChannel, removeChannel } from '../Store/Slices/channelSlice';
const ChannelPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('videos');
  const [channel, setChannel] = useState({});
  const user = useSelector((store) => store.user);
  const Channel = useSelector((store)=> store.channel);
  const [isSubscribe, setSubscribe] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/user/${id}`);
        const data = await response.json();
        if (data.status === "success") {
          setChannel(data.data);
          dispatch(SetChannel(data.data));
          if (Object.keys(user).length === 0) return;

          const userSub = user.subscribedTo.includes(id);
          setSubscribe(userSub);
        }
      } catch (error) {
        console.error(error.message);
      }
    }
    fetchUser();
    return ()=>{
      // not removing channel.. so that we can have channel detail in message box
      // dispatch(removeChannel());
    }
  }, [id, user]);

  async function subscribe() {
    if (Object.keys(user).length === 0) {
      alert("You need to be logged in to subscribe.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v1/user/subscribe/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': "Bearer " + user?.token,
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        if (data.message === "already subscribed") {
          alert("Already Subscribed");
        } else if (data.message === "subscribed successfully") {
          alert("Subscribed Successfully");
          setSubscribe(true);
          dispatch(Subscribe(id)); // to change the redux slice to change the UI, will update the user(redux)
        } else if (data.message === "same account") {
          alert("You cannot subscribe to your own account.");
        }
      }
    } catch (error) {
      if (error.message === "not logged") {
        alert("You are not logged in");
        navigate("/login");
      } else {
        console.error(error.message);
      }
    }
  }

  async function unsubscribe() {
    if (Object.keys(user).length === 0) {
      alert("You need to be logged in to unsubscribe.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v1/user/unsubscribe/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': "Bearer " + user?.token,
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        if (data.message === "already not subscribed") {
          alert("You are not subscribed to this channel.");
        } else if (data.message === "unsubscribed successfully") {
          alert("Unsubscribed Successfully");
          dispatch(unSubscribe(id));
          setSubscribe(false); // to change the redux slice to change the UI, will update the user(redux)
        } else if (data.message === "same account") {
          alert("You cannot unsubscribe from your own account.");
        }
      }
    } catch (error) {
      if (error.message === "not logged") {
        alert("You are not logged in");
        navigate("/login");
      } else {
        console.error(error.message);
      }
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-100">
      {/* User Banner */}
      <div className="relative w-full h-60">
        <img
          src={channel?.coverImage?.url}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex bg-white items-center p-4">
        {/* User Avatar */}
        <img
          src={channel?.avatar?.url}
          alt="User Avatar"
          className="w-24 h-24 rounded-full border-4 border-white object-cover"
        />
        <div className="ml-4">
          <h1 className="text-3xl font-bold text-black">{channel?.username}</h1>
          <p className="text-lg text-gray-500">{channel?.Subscribers} Subscribers</p>
          {!isSubscribe ? (
            <button
              className="rounded-md px-2 p-1 text-white text-xl bg-red-600"
              onClick={subscribe}
            >
              Subscribe
            </button>
          ) : (
            <button
              className="rounded-md px-2 p-1 text-white text-xl bg-gray-500"
              onClick={unsubscribe}
            >
              Unsubscribe
            </button>
          )}
          <Link to={`./message`}><button 
          className="ml-5 rounded-md px-2 p-1 text-white text-xl bg-red-600"
          >
            Message
          </button></Link>
        </div>
      </div>

      {/* About Section */}
      <div className="p-4 bg-white">
        <p className="text-gray-700">{channel?.about}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center space-x-6 p-4 bg-gray-200">
        <Link to={`videos`}>
          <button
            className={`py-2 px-4 font-semibold ${
              activeTab === 'videos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
        </Link>
        <Link to={`posts`}>
          <button
            className={`py-2 px-4 font-semibold ${
              activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
        </Link>
        <Link to={`playlists`}>
          <button
            className={`py-2 px-4 font-semibold ${
              activeTab === 'playlists' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('playlists')}
          >
            Playlists
          </button>
        </Link>
      </div>

      <div className="p-4">
        <Outlet/>
      </div>
    </div>
  );
};

export default ChannelPage;

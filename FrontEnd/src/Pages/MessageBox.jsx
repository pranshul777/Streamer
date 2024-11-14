import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const MessageBox = () => {
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const channel = useSelector((store) => store.channel);
  const dispatch = useDispatch();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (Object.keys(user).length === 0) {
      alert("You need to be logged in");
      navigate("/login");
      return;
    }
    if(user._id === channel._id){
      alert("can't message youself");
      navigate(`/`);
      return;
    }

    const newSocket = io('http://localhost:8000', {
      auth: { token: `Bearer ${user.token}` }
    });

    setSocket(newSocket);

    newSocket.on('getAllMessages', (newMessages) => {
      setMessages(newMessages);
    });

    newSocket.emit('sendAllMessage', channel._id);

    return () => {
      newSocket.disconnect(); // Clean up connection on unmount
    };
  }, [user]);

  const sendMessage = () => {
    if (message.trim() === '') return;

    const data = { channelId: channel._id, text: message, sender: 'User' };
    socket.emit('sendMessage', data);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Channel Info at Top */}
      <div className="flex items-center bg-white p-4 shadow-md">
        <img
          src={channel?.avatar?.url || ''} 
          alt="Channel Logo"
          className="w-12 h-12 rounded-full"
        />
        <h1 className="ml-4 text-xl font-semibold">{channel?.username || 'Channel Name'}</h1>
      </div>

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sentBy === 'User' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`${
                msg.sentBy === 'User' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
              } rounded-lg p-2 max-w-xs`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="flex p-4 bg-white border-t">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 border rounded-full px-4 py-2 mr-2 focus:outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-full"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageBox;

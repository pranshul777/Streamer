import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';

const ChannelMessageBox = () => {
  const {id} = useParams();
  console.log(id);
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const [viewer, SetViewer] = useState({});
  const dispatch = useDispatch();

  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  async function fetchViewer(){
    try {
      const response = await fetch(`http://localhost:8000/api/v1/user/${id}`);
      const data = await response.json();
      console.log(data);
      if(data.status = "success"){
        SetViewer(data.data);
      }
    } catch (error) {
      alert(error.message);
      return
    }
  }

  useEffect(() => {
    fetchViewer();
    const newSocket = io('http://localhost:8000', {
      auth: { token: `Bearer ${user.token}` }
    });

    setSocket(newSocket);

    newSocket.on('getAllMessages', (newMessages) => {
      setMessages(newMessages);
    });

    newSocket.emit('sendAllMessage', viewer._id);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const sendReply = () => {
    if (reply.trim() === '') return;

    const data = { viewer: viewer._id, text: reply, sender: 'Channel' };
    socket.emit('sendMessage', data);
    setReply('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Channel Info at Top */}
      <div className="flex items-center bg-white p-4 shadow-md">
        <img
          src={viewer?.avatar?.url || ''}
          alt="Channel Logo"
          className="w-12 h-12 rounded-full"
        />
        <h1 className="ml-4 text-xl font-semibold">{viewer?.username || 'Channel Name'}</h1>
      </div>

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sentBy === 'Channel' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`${
                msg.sentBy === 'Channel' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
              } rounded-lg p-2 max-w-xs`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Input Box */}
      <div className="flex p-4 bg-white border-t">
        <input
          type="text"
          placeholder="Type a reply"
          className="flex-1 border rounded-full px-4 py-2 mr-2 focus:outline-none"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendReply()}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-full"
          onClick={sendReply}
        >
          Send Reply
        </button>
      </div>
    </div>
  );
};

export default ChannelMessageBox;
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Error = () => {
  const navigate = useNavigate();

  // Function to navigate to the home page
  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Oops!</h1>
      <p className="text-lg text-gray-700 mb-6">The page you're looking for doesn't exist.</p>
      <button
        onClick={goToHome}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Go to Home
      </button>
    </div>
  );
};

export default Error;

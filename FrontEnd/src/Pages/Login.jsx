import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { setUser } from '../Store/Slices/userSlice';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const {name,value} = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => { // important : understand it
    e.preventDefault();
    // Form validation (optional)
    if (!form.email || !form.password ) {
      alert("All fields are required!");
      return;
    }

    // Submit form data (to be connected with backend API)
    try {
      const response = await fetch('http://localhost:8000/api/v1/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data?.status=="success") { //improvised
        alert('User logged in successfully!');
        dispatch(setUser({...data.data,token : data.token}));
        navigate("/");
      } else {
        alert('log in failed');
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="relative flex flex-col w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <span className='absolute top-5 right-8 text-sm text-blue-500 hover:text-blue-600 hover:cursor-pointer'><Link to={"/"}>Home</Link></span>
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="block font-semibold mb-1">Email</div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <div className="block font-semibold mb-1">Password</div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        <div className='text-slate-500 text-sm self-center' >don't have an account? <Link to="/register"><span className='text-blue-600'>register</span></Link></div>
      </div>
    </div>
  );
};

export default Login;

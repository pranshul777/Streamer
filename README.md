# Streamer Web App

A full-featured video streaming platform where users can upload, stream, and interact with video content in real time. Built using the MERN stack (MongoDB, Express.js, React, Node.js), the application supports on-demand streaming, user subscriptions, likes, comments, and more.

## 🚀 Features

- User authentication and profile management
- Video Pages or Channel
- Video upload with cloud storage integration
- Real-time video streaming (on-demand)
- Like, comment, and subscribe functionalities
- Channel-based community post sharing
- Playlist Creation
- Backend API built with Express and MongoDB
- Video processing with FFmpeg and file handling with Multer

## 🛠 Tech Stack

**Frontend**  
- React  
- Tailwind CSS  

**Backend**  
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- Cloudinary (video storage)  
- FFmpeg (video processing)  
- Multer (file uploads)  

**Other Tools**  
- JWT (for authentication)  
## Prerequisites

- Node.js and npm
- MongoDB Atlas account
- Cloudinary account
- FFmpeg installed and added to system path

## Clone the repository
git clone https://github.com/pranshul777/Streamer.git

## Install server dependencies
cd Streamer/BackEnd    
npm install

## Install client dependencies
cd ../FrontEnd    
npm install    



## Create .env in BackEnd : 
### you'll get these URL and Keys from your MongoDB and Cloudinary Account
PORT = 8000    

#MongoDB    
MONGO_URI = your_mongo_URI    

#JWT    
ACCESSKEY = random1    
ACCESSEXPIRY = 1h    
REFRESHKEY = random2    
REFRESHEXPIRY = 1d    

#Cloudinary    
Cloud_Name	= your_cloud_name    
API_key = yout_API_key    
API_Secret = your_API_secret    
CLOUDINARY_URL = yout_cloudinary_URL    



# Run the Application :
## To Run Locally
### Start backend
cd ../BackEnd   
npm run dev
### Start frontend
cd ../FrontEnd   
npm start    
### At Last go to your Browser, search for localhost:8000

# OR

## To Run Complete Project
### create a build for frontend
(in FrontEnd)   
npm run build

### start server
cd ../BackEnd   
num run dev    

### At Last go to your Browser, search for localhost:8000

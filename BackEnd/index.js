// downloaded or built in modules
const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors')
const cookieParser  = require('cookie-parser');

const { createServer } = require('http');
// const messageServer = require('./ws/messageServer.js');

// saved modules
const connectDB = require('./config/connectDB.js');
const errorHandler = require('./utils/ErrorHandler.js');
const { notFound } = require('./utils/errors/error.js');
const userRoute = require('./routes/user.route.js');
const videoRoute = require('./routes/video.route.js');
const postRoute = require('./routes/post.route.js');

const app = express();

//downloaded or built in middlwares
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser ());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use(express.static(path.resolve(__dirname,'./public')));
// temporary
// app.get("/video",(req,res)=>{
//     res.status(200).sendFile(path.resolve(__dirname,"./public/index2.html"));
// })

//temp : full-stack
// app.use(express.static(path.resolve(__dirname, '../FrontEnd/dist')));
// app.use(express.static(path.resolve(__dirname, '../FrontEnd/dist/assets')));
// app.get('/', (req, res) => {
//     res.status(200).sendFile(path.resolve(__dirname, '../FrontEnd/dist/index.html'));
// });

//routes
app.use('/api/v1/user',userRoute);
app.use('/api/v1/video',videoRoute);
app.use('/api/v1/post',postRoute);

//to handle all irrelevant urls
app.all('*',(req,res,next)=>{
    next(notFound());
});

// error handler
app.use(errorHandler);

// server initialization : because of websocket
// const httpServer = createServer(app);
// messageServer(httpServer);

// connection to database
(async ()=>{
    try {
        await connectDB();
        app.listen(process.env.PORT,()=>{
            console.log("Serving at port : ",process.env.PORT);
        })
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
})();
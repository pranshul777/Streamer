// downloaded or built in modules
const express = require('express');
require('dotenv').config();
const path = require('path');
const cookieParser  = require('cookie-parser');

// saved modules
const connectDB = require('./config/connectDB.js');
const errorHandler = require('./utils/ErrorHandler.js');
const { notFound } = require('./utils/errors/error.js');
const userRoute = require('./routes/user.route.js');
const videoRoute = require('./routes/video.route.js');
const postRoute = require('./routes/post.route.js');

const app = express();

//downloaded or built in middlwares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser ());
// app.use(express.static(path.resolve(__dirname,'./public')));
// temporary
// app.get("/video",(req,res)=>{
//     res.status(200).sendFile(path.resolve(__dirname,"./public/index2.html"));
// })

//temp : full-stack
app.use(express.static(path.resolve(__dirname, '../FrontEnd/dist')));

app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, '../FrontEnd/dist/index.html'));
});

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
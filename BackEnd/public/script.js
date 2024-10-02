const main = document.getElementById("main");

async function fetchVideos(){
    const response = await fetch("http://localhost:8000/api/v1/video");
    const Data = await response.json();
    const videos = Data.data;
    console.log(videos);
    videos.map((video,ind)=>{
        const imgTag = document.createElement("img");
        imgTag.setAttribute("src",video?.thumbnail?.url);
        imgTag.setAttribute("class","Video");
        // imgTag.setAttribute("value",video?._id);
        main.appendChild(imgTag);
    })
}

fetchVideos();
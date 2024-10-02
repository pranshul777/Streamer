const main = document.getElementById("main");

async function fetchVideo(id){
    const response = await fetch("http://localhost:8000/api/v1/video/watchvideo/"+"66ec66fdd27a6d0c36c0d5cd");
    const Data = await response.json();
    const video = Data.data;
    console.log(video);
    const vidTag = `<video width="320" height="240" controls><source src=${video?.videoFile?.url} type="video/mp4">Your browser does not support the video tag.</video>`
    main.innerHTML=vidTag;
}
fetchVideo();
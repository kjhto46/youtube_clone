const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volume = document.getElementById("volume");

const handlePlayClick = (e) => {
   //비디오가 시작중이라면 멈추고
   if(video.paused) {
      video.play();
   } else {
      playBtn.innerText = "Play";
      video.pause();
   }
   //아니면 재생해라
}

const handleMute = (e) => {

}

const handlePause = () => {playBtn.innerText = "Play";}
const handlePlay = () => {playBtn.innerText = "Paused";}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
video.addEventListener("pause", handlePause);
video.addEventListener("play", handlePlay);
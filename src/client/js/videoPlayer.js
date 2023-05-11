const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");

const handlePlayClick = (e) => {
   //비디오가 시작중이라면 멈추고
   if(video.paused) {
      video.play();
   } else {
      playBtn.innerText = "Play";
      video.pause();
   }
   playBtn.innerText = video.paused ? "Play" : "Pause";
   //아니면 재생해라
}

const handleMute = (e) => {
   if(video.muted) {
      video.muted = false;
      // muteBtn.innerText = "mute"
   }else{
      video.muted = true;
      // muteBtn.innerText = "Unmute"
   }
   muteBtn.innerText = video.muted ? "Unmute" : "Mute";
   volumeRange.value = video.muted ? 0 : 0.5;
}

const handlePause = () => {playBtn.innerText = "Play";}
const handlePlay = () => {playBtn.innerText = "Paused";}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
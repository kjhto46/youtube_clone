const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");

let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (e) => {
   //비디오가 시작중이라면 멈추고
   if(video.paused) {
      video.play();
   } else {
      playBtn.innerText = "Play";
      video.pause();
   }
   playBtn.innerText = video.paused ? "Play" : "Pause";
}

const handleMute = (e) => {
   if(video.muted || video.volume === 0) {
      video.muted = false;
      video.volume = volumeValue;
   }else{
      video.muted = true;
      // muteBtn.innerText = "Unmute"
   }
   muteBtn.innerText = video.muted ? "Unmute" : "Mute";
   volumeRange.value = video.muted ? 0 : volumeValue;
}

const handleVolumeChange = (event) => {
   const {target : {value}} = event;
   volumeValue = value;
   video.volume = volumeValue;
   if (video.volume === 0) {
   video.muted = true;
   muteBtn.innerText = "Unmute";
   } else {
   video.muted = false;
   muteBtn.innerText = "Mute";
   }
}

const handelLoadedMetadata = () => {
   totalTime.innerText = Math.floor(video.duration);
}

const handleTimeUpdate = () => {
   currenTime.innerText = Math.floor(video.currentTime);
}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("timeupdate", handleTimeUpdate);



video.readyState
? handelLoadedMetadata()
: video.addEventListener("loadedmetadata", handelLoadedMetadata);




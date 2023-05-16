const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const formatTime = (seconds) => {
   const date = new Date(null);
   date.setSeconds(seconds);
   const hours = date.getUTCHours();
   const minutes = date.getUTCMinutes();
   const sec = date.getUTCSeconds();
   
   let formattedTime = '';
   if (hours > 0) {
     formattedTime += hours + ':';
   }
   if (hours > 0 && minutes < 10) {
     formattedTime += '0';
   } else if (hours === 0 && minutes < 10) {
     formattedTime += '0';
   }
   formattedTime += minutes + ':';
   if (sec < 10) {
     formattedTime += '0';
   }
   formattedTime += sec;
 
   return formattedTime;
};
const handlePlayClick = (e) => {
   //비디오가 시작중이라면 멈추고
   if(video.paused) {
      video.play();
   } else {
      playBtnIcon.classList = "fas fa-play";
      video.pause();
   }
   playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
}

const handleMuteClick = (e) => {
   if (video.muted) {
     video.muted = false;
   } else {
     video.muted = true;
   }
   muteBtnIcon.classList = video.muted
     ? "fas fa-volume-mute"
     : "fas fa-volume-up";
   volumeRange.value = video.muted ? 0 : volumeValue;
 };
const handleVolumeChange = (event) => {
   const {target : {value}} = event;
   volumeValue = value;
   video.volume = volumeValue;
   if (video.volume === 0) {
   video.muted = true;
   muteBtnIcon.classList = "fas fa-volume-mute";
   } else {
   video.muted = false;
   muteBtnIcon.classList = "fas fa-volume-up";
   }
}

const handelLoadedMetadata = () => { //전체 시간 설정
   totalTime.innerText = formatTime(Math.floor(video.duration)); // 안에 텍스트를 시간과 동일하게 설정
   timeline.max = Math.floor(video.duration);

}

const handleTimeUpdate = () => { // 헨들 시간 설정
   currenTime.innerText = formatTime(Math.floor(video.currentTime)); // 안에 텍스트를 시간과 동일하게 설정
   timeline.value = Math.floor(video.currentTime);

   if(Math.floor(video.currentTime) === Math.floor(video.duration)){ //currentTime과 duration은 모두 초 단위이므로, Math.floor() 함수를 이용해서 정수로 변환한 뒤에 비교해주어야 한다.
      playBtn.innerText = "다시실행";
   }
}

const handleTimelineChange = (event) => {
   const {
      target : {value},
   } = event;
   video.currentTime = value;
}

const handleFullscreen = () => {
   const fullscreen = document.fullscreenElement;
   if (fullscreen) {
     document.exitFullscreen();
     fullScreenIcon.classList = "fas fa-expand";
   } else {
     videoContainer.requestFullscreen();
     fullScreenIcon.classList = "fas fa-compress";
   }
 };

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
   if(controlsTimeout) {
      clearTimeout(controlsTimeout);
      controlsTimeout = null;
   }
   if(controlsMovementTimeout) {
      clearTimeout(controlsMovementTimeout);
      controlsMovementTimeout = null;
   }

   videoControls.classList.add("showing");
   controlsMovementTimeout = setTimeout(hideControls, 5000);
}

const handleMouseLeave = () => {
   controlsTimeout = setTimeout(hideControls, 5000);
}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);

video.readyState
? handelLoadedMetadata()
: video.addEventListener("loadedmetadata", handelLoadedMetadata);

video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimelineChange);


window.addEventListener("keydown", function (event) {
   if (event.code == "Space") {
      handlePlayClick();
   }
   if (event.code == "KeyM" || event.code == "Keym") {
      handleMuteClick();
   }
   if (event.code == "KeyF" || event.code == "Keyf") {
      const fullScreen = document.fullscreenElement;
      if(fullScreen) {
         document.exitFullscreen();
      } else {
         videoContainer.requestFullscreen();
      }
   }
});

fullScreenBtn.addEventListener("click", handleFullscreen);
video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("click", handlePlayClick);
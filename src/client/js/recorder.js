const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;

const handleDownload = () => {};

const handleStop = () => {  
  startBtn.innerText = "영상 다운로드";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleDownload);
  recorder.stop();
}

const handleStart =() => {
  startBtn.innerText = "녹화종료";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    const videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
     audio: false,
     video: true,
   });
   video.srcObject = stream;
   video.play();
 };

 init();

startBtn.addEventListener("click", handleStart);
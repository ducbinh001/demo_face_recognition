feather.replace();

const controls = document.querySelector('.controls');
const cameraOptions = document.querySelector('.video-options>select');
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
const screenshotImage = document.querySelector('img');
const buttons = [...controls.querySelectorAll('button')];
var interval = null;
let streamStarted = false;

(async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
})();

const [play, pause, screenshot] = buttons;

const constraints = {
  video: {
    width: {
      min: 1280,
      ideal: 1920,
      max: 2560,
    },
    height: {
      min: 720,
      ideal: 1080,
      max: 1440
    },
  }
};

cameraOptions.onchange = () => {
  const updatedConstraints = {
    ...constraints,
    deviceId: {
      exact: cameraOptions.value
    }
  };

  startStream(updatedConstraints);
};

play.onclick = () => {
  if (streamStarted) {
    video.play();
    play.classList.add('d-none');
    pause.classList.remove('d-none');
    return;
  }
  if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
    const updatedConstraints = {
      ...constraints,
      deviceId: {
        exact: cameraOptions.value
      }
    };
    startStream(updatedConstraints);
  }
  detectFaceOnCamera()
  // setTimeout(detectFace(), 3000);
};

const pauseStream = () => {
  video.pause();
  play.classList.remove('d-none');
  pause.classList.add('d-none');
  clearInterval(interval)
};

const detectFaceOnCamera = () => {
  video.classList.add('d-none');
  canvas.classList.remove('d-none');
  interval = setInterval(async () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    // screenshotImage.src = canvas.toDataURL('image/webp');
    // screenshotImage.classList.remove('d-none');

    console.log("11111111")
    const result = await faceapi.detectAllFaces(video);
    result.forEach(ele => {
      console.log(ele)
      ctx.beginPath();
      ctx.lineWidth = "1";
      ctx.strokeStyle = "red";
      ctx.rect(ele.box.x, ele.box.y, ele.box.width, ele.box.height);
      ctx.stroke();
    })
  }, 20)
};

const cropFace = async () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const result = await faceapi.detectAllFaces(video);
  let ele = result[0]

  var tempCanvas = document.createElement("canvas");
  var tCtx = tempCanvas.getContext("2d");

  screenshotImage.setAttribute("width", ele.box.width);
  screenshotImage.setAttribute("height", ele.box.height);

  tempCanvas.width = ele.box.width;
  tempCanvas.height = ele.box.height;

  tCtx.drawImage(canvas, ele.box.x, ele.box.y, ele.box.width, ele.box.height, 0, 0, ele.box.width, ele.box.height);

  screenshotImage.src = tempCanvas.toDataURL('image/webp');
}

pause.onclick = pauseStream;
screenshot.onclick = cropFace;

const startStream = async (constraints) => {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  handleStream(stream);
};

const handleStream = (stream) => {
  video.srcObject = stream;
  play.classList.add('d-none');
  pause.classList.remove('d-none');
  screenshot.classList.remove('d-none');
};


const getCameraSelection = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  const options = videoDevices.map(videoDevice => {
    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
  });
  cameraOptions.innerHTML = options.join('');
};

var detectFace = () => {
  interval = setInterval(async () => {
    const result = await faceapi.detectAllFaces(video);
    console.log(result)
    if (result.length > 0) {
      pauseStream()
    }
  }, 20)
}

getCameraSelection();
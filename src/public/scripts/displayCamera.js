feather.replace();

const controls = document.querySelector('.controls');
const cameraOptions = document.getElementById('video-options');
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
// const screenshotImage = document.querySelector('img');
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
  canvas.classList.add("canvas-position");
  interval = setInterval(async () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    // screenshotImage.src = canvas.toDataURL('image/png');
    // screenshotImage.classList.remove('d-none');

    const result = await faceapi.detectAllFaces(video);
    result.forEach(ele => {
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
  let listFace = []
  result.forEach((ele, index) => {
    var tempCanvas = document.createElement("canvas");
    var tCtx = tempCanvas.getContext("2d");

    // screenshotImage.setAttribute("width", ele.box.width);
    // screenshotImage.setAttribute("height", ele.box.height);

    tempCanvas.width = ele.box.width;
    tempCanvas.height = ele.box.height;

    tCtx.drawImage(canvas, ele.box.x, ele.box.y, ele.box.width, ele.box.height, 0, 0, ele.box.width, ele.box.height);
    // if (index === 0) screenshotImage.src = tempCanvas.toDataURL('image/png');
    listFace.push({ data: tempCanvas.toDataURL('image/png') });
  })
  callApi({ data: listFace })


  // Test crop image
  // let ele = result[0]

  // var tempCanvas = document.createElement("canvas");
  // var tCtx = tempCanvas.getContext("2d");

  // screenshotImage.setAttribute("width", ele.box.width);
  // screenshotImage.setAttribute("height", ele.box.height);

  // tempCanvas.width = ele.box.width;
  // tempCanvas.height = ele.box.height;

  // tCtx.drawImage(canvas, ele.box.x, ele.box.y, ele.box.width, ele.box.height, 0, 0, ele.box.width, ele.box.height);

  // screenshotImage.src = tempCanvas.toDataURL('image/png');
}

const callApi = (data) => {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", "http://ai.nccsoft.vn:8888/face", true);
  xmlhttp.setRequestHeader("Content-Type", "application/json");
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.status == 200) {
      let showName = document.getElementById("show-name");
      showName.innerHTML = ""
      let p = document.createElement("p");
      let data = JSON.parse(xmlhttp.responseText);
      data.forEach(ele => {
        let text = document.createTextNode(ele.cls);
        p.appendChild(text)
        let br = document.createElement("br");
        p.appendChild(br);
      })
      showName.appendChild(p)
    }
  }
  xmlhttp.send(JSON.stringify(data));
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
    if (result.length > 0) {
      pauseStream()
    }
  }, 20)
}

getCameraSelection();
const WIDTH = window.innerWidth * 0.8, HEIGHT = window.innerHeight * 0.8;

const canvas = document.getElementById("canvas");

canvas.width = WIDTH;
canvas.height = HEIGHT;
canvas.style.width = WIDTH + "px";
canvas.style.height = HEIGHT + "px";

const canvasContext = canvas.getContext("2d");

const audioContext = new AudioContext();

// 創建節點
const analyser = audioContext.createAnalyser();
// 連接節點
// source.connect(analyser);
// analyser.connect(audioContext.destination);

let drawId = 0;

let mediaStream = null;
let chunks = [];
let mediaRecorder = null;

function clearCanvas() {
    // canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
    canvasContext.beginPath();
    canvasContext.rect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = 'rgba(0, 0, 0, 1)';
    canvasContext.fill();
}

analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
// analyser.fftSize = 256;
// const bufferLength = analyser.fftSize;
// 确定图形高度的基础
const dataArray = new Uint8Array(bufferLength);

function draw() {
    clearCanvas();

    // 矩形图、频域图；x 轴是频率即音高，单位是赫兹（Hz）； y 轴是振幅即音量，单位是分贝（dB）
    analyser.getByteFrequencyData(dataArray);
    canvasContext.fillStyle = '#84fab0';
    canvasContext.strokeStyle = '#84fab0';
    let x = 0;
    let y = HEIGHT * 0.5;
    // 每个矩形的宽度
    let barWidth = WIDTH / bufferLength * 5;
    let gap = WIDTH / bufferLength;
    // 每个矩形宽度放大了5，间隔1，所以每隔6个数据画一个矩形
    for (let i = 0; i < bufferLength; i=i+6) {
        // dataArray 每项值的范围是 0 - 255 ，最大 255 , dataArray[i] / 255 得到比值，乘以最大高度 HEIGHT * 0.2 ，得到对应高度
        const barHeight = dataArray[i] / 255 * HEIGHT * 0.2;
        canvasContext.fillRect(x, y, barWidth, -barHeight);
        canvasContext.strokeRect(x, y, barWidth, barHeight);
        x += barWidth+gap;
    }
    console.log(x,'  ',WIDTH,'   ',barWidth,'   ',gap);


    // 波形图、时域图；；x 轴是时间即音长，单位是秒； y 轴是振幅即声压，单位是 Pa
    // analyser.getByteTimeDomainData(dataArray);
    // canvasContext.lineWidth = 2;
    // canvasContext.strokeStyle = '#84fab0';
    //
    // canvasContext.beginPath();
    //
    // const sliceWidth = canvas.width * 1.0 / bufferLength;
    // let x = 0;
    //
    // for (let i = 0; i < bufferLength; i++) {
    //
    //     let v = dataArray[i] / 128.0;
    //     let y = v * canvas.height / 2;
    //
    //     if (i === 0) {
    //         canvasContext.moveTo(x, y);
    //     } else {
    //         canvasContext.lineTo(x, y);
    //     }
    //
    //     x += sliceWidth;
    // }
    //
    // canvasContext.lineTo(canvas.width, canvas.height / 2);
    // canvasContext.stroke();
}

function animationLoopStop() {
    clearCanvas();
    drawId && cancelAnimationFrame(drawId);
    drawId = 0;
}

function animationLoop() {
    try {
        drawId = requestAnimationFrame(animationLoop);
        draw();
    } catch (e) {
        console.log(e)
    }
}

let start = document.querySelector("#start");
let stop = document.querySelector("#stop");

// start.setAttribute('disabled', 'disabled');
stop.setAttribute('disabled', 'disabled');

start.addEventListener("click", async function () {
    start.setAttribute('disabled', 'disabled');
    stop.removeAttribute('disabled');
    if (!mediaStream) {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 16000,
                sampleSize: 16,
                channelCount: 1,
            },
        });
        // The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page.
        await audioContext.resume();
        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        // chunks = [];
        // mediaRecorder = new MediaRecorder(mediaStream);
        // mediaRecorder.ondataavailable = function (e) {
        //     chunks.push(e.data);
        // };
    }
    // mediaRecorder.start();
    animationLoop();
}, false);

stop.addEventListener("click", function () {
    start.removeAttribute('disabled');
    stop.setAttribute('disabled', 'disabled');
    // mediaRecorder.onstop = async function () {
    //     if (isRecording) {
    //         const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
    //         const audioURL = window.URL.createObjectURL(blob);
    //         mediaRecorder = null;
    //     }
    // };
    // mediaRecorder.stop();
    animationLoopStop();
}, false);

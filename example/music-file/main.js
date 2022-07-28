const WIDTH = window.innerWidth*0.8, HEIGHT = window.innerHeight*0.8;

const canvas = document.getElementById("canvas");

canvas.width = WIDTH;
canvas.height = HEIGHT;
canvas.style.width = WIDTH + "px";
canvas.style.height = HEIGHT + "px";

const canvasContext = canvas.getContext("2d");

const audioContext = new AudioContext();

// 創建節點
const audio = document.querySelector("#music");
const source = audioContext.createMediaElementSource(audio);
const analyser = audioContext.createAnalyser();
// 連接節點
source.connect(analyser);
analyser.connect(audioContext.destination);

let drawId = 0;

function destroy() {
    drawId && cancelAnimationFrame(drawId);
    drawId = 0;
}

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

function animationLoop() {
    try {
        drawId = requestAnimationFrame(animationLoop);
        draw();
    } catch (e) {
        destroy()
        console.log(e)
    }
}

animationLoop()

const play = document.querySelector("#play");
const pause = document.querySelector("#pause");
// play.setAttribute('disabled', 'disabled');
pause.setAttribute('disabled', 'disabled');
play.addEventListener("click", function () {
    play.setAttribute('disabled', 'disabled');
    pause.removeAttribute('disabled');
    // The audioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page.
    audioContext.resume();
    audio.play();
}, false);
pause.addEventListener("click", function () {
    play.removeAttribute('disabled');
    pause.setAttribute('disabled', 'disabled');
    audio.pause();
}, false);

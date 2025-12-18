const socket = io();

const last = document.getElementById("last");
const list = document.getElementById("list");

const rouletteSound = document.getElementById("sound-roulette");
const decisionSound = document.getElementById("sound-decision");

let isSpinning = false;
let spinInterval;
let min;
let max;

// 抽選ボタン
document.getElementById("spin").onclick = () => {
  if (isSpinning) return;
  isSpinning = true;

  rouletteSound.currentTime = 0;
  rouletteSound.play();

  spinInterval = setInterval(() => {
    last.textContent =
      Math.floor(Math.random() * (max - min + 1)) + min;
  }, 25);

  setTimeout(() => {
    clearInterval(spinInterval);
    // 🔴 ここでルーレット音を止める
    rouletteSound.pause();
    rouletteSound.currentTime = 0;
    socket.emit("spin");
    isSpinning = false;
  }, 2000);
};

// リセット
document.getElementById("reset").onclick = () => {
  socket.emit("reset");
};

// 範囲設定
document.getElementById("setRange").onclick = () => {
  min = Number(document.getElementById("min").value);
  max = Number(document.getElementById("max").value);

  socket.emit("set-range", { min, max });
};

// サーバーから結果
socket.on("new-number", (num) => {
  last.textContent = num;
  decisionSound.currentTime = 0;
  decisionSound.play();
});

socket.on("update-list", (arr) => {
  list.innerHTML = arr.map(num => `<span class="number">${num}</span>`).join("");
});


socket.on("reset-all", () => {
  last.textContent = "";
  list.textContent = "";
});

socket.on("range-updated", (range) => {
  min = range.min;
  max = range.max;
  document.getElementById("min").value = min;
  document.getElementById("max").value = max;
});

// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// ===== サーバ側の状態 =====
let drawnNumbers = [];
let minNumber;
let maxNumber;

io.on("connection", (socket) => {
  console.log("ユーザー接続:", socket.id);

  // 現在の状態を送信
  socket.emit("update-list", drawnNumbers);
  socket.emit("range-updated", {
    min: minNumber,
    max: maxNumber
  });

  // ===== 抽選 =====
  socket.on("spin", () => {
    // min〜max の範囲から、未使用の数字を作る
    const remaining = [];
    for (let i = minNumber; i <= maxNumber; i++) {
      if (!drawnNumbers.includes(i)) {
        remaining.push(i);
      }
    }

    if (remaining.length === 0) {
      console.log("これ以上抽選できません");
      return;
    }

    const number =
      remaining[Math.floor(Math.random() * remaining.length)];

    drawnNumbers.push(number);

    console.log("抽選番号:", number);

    io.emit("new-number", number);
    io.emit("update-list", drawnNumbers);
  });

  // ===== 範囲設定 =====
  socket.on("set-range", ({ min, max }) => {
    minNumber = Number(min);
    maxNumber = Number(max);
    drawnNumbers = []; // 範囲変更時はリセット

    console.log(`範囲変更: ${minNumber}〜${maxNumber}`);

    io.emit("range-updated", {
      min: minNumber,
      max: maxNumber
    });
    io.emit("reset-all");
  });

  // ===== リセット =====
  socket.on("reset", () => {
    drawnNumbers = [];
    io.emit("reset-all");
    console.log("リセットしました");
  });
});

server.listen(3000, () => {
  console.log("http://localhost:3000 でサーバ起動");
});

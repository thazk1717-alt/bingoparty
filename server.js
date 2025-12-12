// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// --- 抽選済み番号を保存 ---
let drawnNumbers = [];

io.on("connection", (socket) => {
  console.log("ユーザー接続:", socket.id);

  // 接続した参加者へ現在の番号一覧を送る
  socket.emit("update-list", drawnNumbers);

  // 管理者から抽選要求
  socket.on("spin", () => {
    // 出ていない番号をフィルタ
    const remaining = [...Array(60).keys()].map(n => n + 1)
      .filter(num => !drawnNumbers.includes(num));

    if (remaining.length === 0) return;

    // ランダムに1つ取り出す
    const number = remaining[Math.floor(Math.random() * remaining.length)];

    drawnNumbers.push(number);

    console.log("抽選番号:", number);

    // 全員に 番号+一覧 を送信
    io.emit("new-number", number);
    io.emit("update-list", drawnNumbers);
  });

  // リセット処理
  socket.on("reset", () => {
    drawnNumbers = [];
    io.emit("reset-all");
    console.log("リセットしました");
  });
});

server.listen(3000, () => {
  console.log("http://localhost:3000 でサーバ起動");
});

// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ---- 重要：Render で動かすための CORS 設定 ----
const io = new Server(server, {
  cors: {
    origin: "*",     // 必要に応じて URL を絞る
    methods: ["GET", "POST"]
  }
});

// ---- public フォルダを配信 ----
app.use(express.static("public"));

// --- 抽選済み番号を保存 ---
let drawnNumbers = [];

io.on("connection", (socket) => {
  console.log("ユーザー接続:", socket.id);

  // 接続した参加者へ現在の番号一覧を送る
  socket.emit("update-list", drawnNumbers);

  // 管理者から抽選要求
  socket.on("spin", () => {
    const remaining = [...Array(60).keys()]
      .map(n => n + 1)
      .filter(num => !drawnNumbers.includes(num));

    if (remaining.length === 0) return;

    const number = remaining[Math.floor(Math.random() * remaining.length)];

    drawnNumbers.push(number);

    console.log("抽選番号:", number);

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

// ---- Render が割り当てる PORT を使用 ----
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});

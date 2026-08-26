const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = 8080;

// Serve static files
app.use(express.static(path.join(__dirname)));

// In-memory message store per chatId
const chatStore = {};

// Load chats from backup file if exists
const DATA_FILE = path.join(__dirname, "chat_data.json");
try {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw);
  Object.assign(chatStore, parsed);
} catch (e) { /* first run */ }

function saveData() {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(chatStore)); } catch (e) {}
}

// Socket.IO
io.on("connection", (socket) => {
  // Join a chat room
  socket.on("chat:join", (chatId) => {
    socket.join(chatId);
    const msgs = chatStore[chatId] || [];
    socket.emit("chat:history", { chatId, messages: msgs });
  });

  // New chat started by a customer
  socket.on("chat:new", (data) => {
    const { chatId, name } = data;
    if (!chatId) return;
    if (!chatStore[chatId]) chatStore[chatId] = [];
    socket.join(chatId);
    // Notify all admins about new chat
    socket.broadcast.emit("chat:new", { chatId, name: name || "زبون" });
  });

  // User or admin sends a message
  socket.on("chat:message", (data) => {
    const { chatId, message } = data;
    if (!chatId || !message || !message.text) return;
    if (!chatStore[chatId]) chatStore[chatId] = [];
    chatStore[chatId].push(message);
    saveData();
    // Broadcast to everyone in the room except sender
    socket.to(chatId).emit("chat:message", { chatId, message });
  });

  // Admin deletes a chat
  socket.on("chat:delete", (chatId) => {
    delete chatStore[chatId];
    saveData();
    io.emit("chat:deleted", chatId);
  });

  // Leave room
  socket.on("chat:leave", (chatId) => {
    socket.leave(chatId);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on http://0.0.0.0:" + PORT);
});
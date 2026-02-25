require("dotenv").config();
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const axios = require("axios");
const mongoose = require("mongoose");
const Chat = require("./models/Chat");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ===============================
// CHECK GROQ KEY
// ===============================
if (!process.env.GROQ_API_KEY) {
  console.log("❌ GROQ API KEY NOT FOUND");
  process.exit(1);
}

// ===============================
// CONNECT MONGODB
// ===============================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.log("❌ MongoDB Error:", err.message);
  });

// ===============================
// START SERVER
// ===============================
const server = app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});

const wss = new WebSocket.Server({ server });

// ===============================
// WEBSOCKET CONNECTION
// ===============================
wss.on("connection", (ws) => {
  console.log("🔌 Client connected");

  const sessionId = Date.now().toString();

  let chatHistory = [
    {
      role: "system",
      content: "You are IRIS, a smart AI assistant."
    }
  ];

  ws.on("message", async (message) => {
    try {
      const userMessage = message.toString().trim();
      if (!userMessage) return;

      console.log("👤 User:", userMessage);

      // SAVE USER MESSAGE
      await Chat.create({
        sessionId,
        role: "user",
        message: userMessage
      });

      chatHistory.push({ role: "user", content: userMessage });

      const aiReply = await callGroq(chatHistory);

      chatHistory.push({ role: "assistant", content: aiReply });

      console.log("🤖 AI:", aiReply);

      // SAVE AI MESSAGE
      await Chat.create({
        sessionId,
        role: "assistant",
        message: aiReply
      });

      ws.send(JSON.stringify({ reply: aiReply }));

    } catch (error) {
      console.error("❌ ERROR:", error.response?.data || error.message);

      ws.send(JSON.stringify({
        reply: "AI service error."
      }));
    }
  });
});

// ===============================
// GROQ FUNCTION
// ===============================
async function callGroq(messages) {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.choices[0].message.content;
}
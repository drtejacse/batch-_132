const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Chat", chatSchema);
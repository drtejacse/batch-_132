import { useState, useRef, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import Controls from "./components/Controls";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const socketRef = useRef(null);
  const recognitionRef = useRef(null);

  // Connect WebSocket
  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:5000");

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply }
      ]);

      speak(data.reply);
    };
  }, []);

  // Text to Speech
  function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  }

  // Start Microphone
  function startRecording() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.resultIndex][0].transcript;

      setMessages((prev) => [
        ...prev,
        { role: "user", text: transcript }
      ]);

      socketRef.current.send(transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  }

  function stopRecording() {
    recognitionRef.current.stop();
    setRecording(false);
  }

  return (
    <div className="container">
      <h2>🤖 IRIS AI Voice Agent</h2>

      <ChatWindow messages={messages} />

      <Controls
        recording={recording}
        start={startRecording}
        stop={stopRecording}
      />
    </div>
  );
}
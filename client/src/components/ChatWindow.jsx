export default function ChatWindow({ messages }) {
  return (
    <div className="chat-box">
      {messages.map((msg, index) => (
        <p key={index} className={msg.role}>
          <b>{msg.role}:</b> {msg.text}
        </p>
      ))}
    </div>
  );
}
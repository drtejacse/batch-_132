export default function Controls({ recording, start, stop }) {
  return (
    <div>
      {!recording ? (
        <button onClick={start}>🎙 Start Talking</button>
      ) : (
        <button onClick={stop}>⛔ Stop</button>
      )}
    </div>
  );
}
import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>🔥 Bulk Tracker App</h1>
      <p>This is running correctly on Vercel setup.</p>

      <button onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </div>
  );
}

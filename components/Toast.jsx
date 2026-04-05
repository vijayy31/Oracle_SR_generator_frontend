import { C } from '../theme';

export default function Toast({ show, message }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%",
      transform: show ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(16px)",
      opacity: show ? 1 : 0,
      background: C.onSurface, color: "#fff",
      padding: "10px 20px", borderRadius: 8,
      fontSize: 13, fontWeight: 500,
      transition: "all 0.3s ease", pointerEvents: "none", zIndex: 9999,
    }}>
      {message}
    </div>
  );
}

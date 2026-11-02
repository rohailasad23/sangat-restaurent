import { ImageResponse } from "next/og";

export const alt = "Sangat Restaurant Multan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "radial-gradient(circle at 50% 60%, #3a2a1c 0%, #0e0f0d 65%)", color: "#f3ebdd",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 14, color: "#c2a46c", textTransform: "uppercase" }}>Multan · Pakistan</div>
        <div style={{ fontSize: 180, letterSpacing: 30, marginTop: 20, fontFamily: "serif" }}>SANGAT</div>
        <div style={{ fontSize: 40, marginTop: 10, fontStyle: "italic", fontFamily: "serif" }}>Where Tradition Meets Togetherness</div>
      </div>
    ),
    size,
  );
}

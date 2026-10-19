import { ImageResponse } from "next/og";

export const alt = "RN Planner | Personal Operating System";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#090d16",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              backgroundColor: "#0b0f1a",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "26px",
                fontWeight: "bold",
                color: "#06b6d4",
              }}
            >
              RN
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "#f8fafc" }}>
              RN Planner
            </span>
            <span style={{ fontSize: "14px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2px" }}>
              Personal Operating System
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
          <h1
            style={{
              fontSize: "50px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Quadro de Execução, Hábitos & Metas
          </h1>
          <p style={{ fontSize: "22px", color: "#94a3b8", margin: 0 }}>
            Interface minimalista Dark Obsidian com semântica Neon, filtros em tempo real e foco na produtividade.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "24px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ backgroundColor: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.3)", borderRadius: "8px", padding: "6px 14px", color: "#06b6d4", fontSize: "14px", fontWeight: 600 }}>
              Kanban Board
            </div>
            <div style={{ backgroundColor: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: "8px", padding: "6px 14px", color: "#f43f5e", fontSize: "14px", fontWeight: 600 }}>
              Prioridades Críticas
            </div>
            <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", padding: "6px 14px", color: "#10b981", fontSize: "14px", fontWeight: 600 }}>
              Drag & Drop
            </div>
          </div>

          <span style={{ color: "#64748b", fontSize: "15px", fontFamily: "monospace" }}>
            github.com/Renanbritto/rn-planner
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
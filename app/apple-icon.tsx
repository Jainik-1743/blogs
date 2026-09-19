import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon: the same mark as app/icon.svg, rendered to PNG at build time. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#38bdf8",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 32 32" fill="none">
          <g stroke="#0b1120" strokeWidth="2.75" strokeLinecap="round">
            <path d="M9 10.5h14" />
            <path d="M9 16h14" />
            <path d="M9 21.5h7" />
          </g>
          <rect x="19.5" y="19.5" width="4" height="4" rx="1" fill="#0b1120" />
        </svg>
      </div>
    ),
    size,
  );
}

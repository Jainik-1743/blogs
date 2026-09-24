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
          background: "linear-gradient(135deg, #7dd3fc, #38bdf8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 32 32" fill="none">
          <rect x="6.5" y="6.5" width="3.6" height="19" rx="1.8" fill="#0b1120" />
          <circle cx="14.7" cy="19.2" r="5.4" stroke="#0b1120" strokeWidth="3.6" />
          <rect x="23.4" y="12.8" width="2.8" height="13.4" rx="1.4" fill="#0b1120" />
        </svg>
      </div>
    ),
    size,
  );
}

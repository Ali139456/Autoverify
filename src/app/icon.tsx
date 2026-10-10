import { ImageResponse } from "next/og";
import { autoVerifiMarkDataUrl } from "@/lib/brand-icon-mark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img width={26} height={26} src={autoVerifiMarkDataUrl()} alt="" />
      </div>
    ),
    { ...size },
  );
}

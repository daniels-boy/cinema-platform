"use client";

import { useState } from "react";

interface UserAvatarProps {
  src: string | null | undefined;
  alt: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  vipStatus?: string;
}

export default function UserAvatar({ src, alt, size = 40, style, className, vipStatus }: UserAvatarProps) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder-avatar.jpg");

  const isSommelier = vipStatus === "SOMMELIER";
  const isAcionista = vipStatus === "ACIONISTA";

  let containerStyle: React.CSSProperties = {
    position: "relative",
    width: size,
    height: size,
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  };

  let imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
    display: "block",
    ...style,
  };

  if (isSommelier) {
    containerStyle = {
      ...containerStyle,
      padding: 2,
      background: "linear-gradient(135deg, #e8b44b, #f5d07a)",
      boxShadow: "0 0 8px rgba(232, 180, 75, 0.4)",
    };
    imgStyle = {
      ...imgStyle,
      border: "2px solid #0a0a0f",
    };
  } else if (isAcionista) {
    containerStyle = {
      ...containerStyle,
      padding: 3,
      background: "linear-gradient(90deg, #dfac40, #ffd875, #dfac40, #ffd875)",
      backgroundSize: "300% 300%",
      boxShadow: "0 0 15px rgba(223, 172, 64, 0.7), inset 0 0 5px rgba(255, 255, 255, 0.5)",
      animation: "avatar-gold-glow 3s infinite linear",
    };
    imgStyle = {
      ...imgStyle,
      border: "2px solid #0a0a0f",
    };
  }

  return (
    <div style={containerStyle} className="vip-avatar-container">
      <img
        src={imgSrc}
        alt={alt}
        style={imgStyle}
        onError={() => {
          if (imgSrc !== "/placeholder-avatar.jpg") {
            setImgSrc("/placeholder-avatar.jpg");
          }
        }}
        className={className}
      />
      {isAcionista && (
        <span 
          style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            background: "linear-gradient(95deg, #dfac40, #ffd875)",
            borderRadius: "50%",
            width: 14,
            height: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
            fontSize: "8px",
            border: "1px solid #0a0a0f",
          }}
          title="Acionista de Hollywood"
        >
          🎬
        </span>
      )}
      {(isSommelier || isAcionista) && (
        <style precedence="default" href="avatar-vip-styles">{`
          @keyframes avatar-gold-glow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      )}
    </div>
  );
}

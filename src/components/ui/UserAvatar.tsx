"use client";

import { useState } from "react";

interface UserAvatarProps {
  src: string | null | undefined;
  alt: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function UserAvatar({ src, alt, size = 40, style, className }: UserAvatarProps) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder-avatar.jpg");

  return (
    <img
      src={imgSrc}
      alt={alt}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style,
      }}
      onError={() => {
        if (imgSrc !== "/placeholder-avatar.jpg") {
          setImgSrc("/placeholder-avatar.jpg");
        }
      }}
      className={className}
    />
  );
}

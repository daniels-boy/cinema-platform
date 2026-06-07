"use client";

import { useState, useEffect } from "react";
import type { BadgeResult } from "@/lib/badges";

interface BadgeUnlockToastProps {
  badges: BadgeResult[];
  onDismiss?: () => void;
}

export default function BadgeUnlockToast({ badges, onDismiss }: BadgeUnlockToastProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (badges.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < badges.length - 1) {
        // Animar saída e mostrar próxima badge
        setExiting(true);
        setTimeout(() => {
          setCurrentIndex((i) => i + 1);
          setExiting(false);
        }, 400);
      } else {
        // Última badge: fechar tudo
        setExiting(true);
        setTimeout(() => {
          setVisible(false);
          onDismiss?.();
        }, 400);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentIndex, badges.length, onDismiss]);

  if (!visible || badges.length === 0) return null;

  const current = badges[currentIndex];

  return (
    <>
      <style precedence="default" href="badgeunlocktoast-styles-1">{`
        @keyframes badge-slide-in {
          from { transform: translateX(120%) scale(0.9); opacity: 0; }
          to   { transform: translateX(0) scale(1);     opacity: 1; }
        }
        @keyframes badge-slide-out {
          from { transform: translateX(0) scale(1);     opacity: 1; }
          to   { transform: translateX(120%) scale(0.9); opacity: 0; }
        }
        @keyframes badge-glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(232,180,75,0.4), 0 8px 32px rgba(0,0,0,0.6); }
          50%       { box-shadow: 0 0 40px rgba(232,180,75,0.8), 0 8px 32px rgba(0,0,0,0.6); }
        }
        @keyframes badge-emoji-bounce {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25%       { transform: scale(1.2) rotate(-8deg); }
          75%       { transform: scale(1.2) rotate(8deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .badge-toast-container {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          animation: ${exiting ? "badge-slide-out" : "badge-slide-in"} 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .badge-toast {
          background: linear-gradient(135deg, #1a1426 0%, #0f1520 100%);
          border: 1px solid rgba(232,180,75,0.5);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 300px;
          max-width: 380px;
          animation: badge-glow-pulse 2s ease-in-out infinite;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .badge-toast::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 20%,
            rgba(232,180,75,0.07) 50%,
            transparent 80%
          );
          background-size: 200% 100%;
          animation: shimmer 2.5s linear infinite;
        }
        .badge-toast-emoji {
          font-size: 2.5rem;
          line-height: 1;
          animation: badge-emoji-bounce 0.6s ease-in-out 0.3s;
          flex-shrink: 0;
        }
        .badge-toast-label {
          font-size: 0.6875rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #e8b44b, #f5d07a, #e8b44b);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s linear infinite;
          margin-bottom: 2px;
        }
        .badge-toast-title {
          font-size: 1rem;
          font-weight: 900;
          color: #fff;
          margin-bottom: 4px;
          line-height: 1.2;
        }
        .badge-toast-desc {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.6);
          line-height: 1.4;
        }
        .badge-toast-counter {
          position: absolute;
          top: 10px;
          right: 14px;
          font-size: 0.65rem;
          color: rgba(232,180,75,0.6);
          font-weight: 700;
        }
        .badge-toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: linear-gradient(90deg, #e8b44b, #f5d07a);
          animation: progress-drain 4s linear forwards;
          width: 100%;
          transform-origin: left;
        }
        @keyframes progress-drain {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      <div
        className="badge-toast-container"
        onClick={() => {
          setExiting(true);
          setTimeout(() => {
            setVisible(false);
            onDismiss?.();
          }, 400);
        }}
      >
        <div className="badge-toast">
          {badges.length > 1 && (
            <span className="badge-toast-counter">
              {currentIndex + 1}/{badges.length}
            </span>
          )}

          <span className="badge-toast-emoji">{current.badge.emoji}</span>

          <div style={{ minWidth: 0 }}>
            <div className="badge-toast-label">🏅 Conquista Desbloqueada!</div>
            <div className="badge-toast-title">{current.badge.label}</div>
            <div className="badge-toast-desc">{current.badge.description}</div>
          </div>

          <div className="badge-toast-progress" key={currentIndex} />
        </div>
      </div>
    </>
  );
}

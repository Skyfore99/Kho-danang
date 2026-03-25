"use client";
import { Plus } from "lucide-react";

export default function FAB({ onClick }: { onClick: () => void }) {
  return (
    <button className="fab" onClick={onClick}>
      <Plus size={32} color="white" />
      <style jsx>{`
        .fab {
          position: fixed;
          bottom: calc(var(--nav-height) + 16px);
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 20px;
          background: var(--accent-orange);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 24px rgba(242, 92, 5, 0.4);
          z-index: 900;
          transition: transform 0.2s;
        }
        .fab:active {
          transform: scale(0.9);
        }
      `}</style>
    </button>
  );
}

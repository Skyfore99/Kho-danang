import { Map, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: "/", label: "STOCK", icon: Map },
    { id: "/settings", label: "SETTINGS", icon: Settings },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-item ${isActive ? "active" : ""}`}
            onClick={() => router.push(tab.id)}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span>{tab.label}</span>
          </button>
        );
      })}

      <style jsx>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 90px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-evenly;
          border-top: 1px solid rgba(0,0,0,0.03);
          z-index: 1000;
          padding-bottom: env(safe-area-inset-bottom);
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          gap: 6px;
          padding: 12px 28px;
          border-radius: 24px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .nav-item:active {
          transform: scale(0.92);
        }
        .nav-item span {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
        }
        .nav-item.active {
          background: var(--primary-blue);
          color: white;
          box-shadow: 0 8px 24px rgba(35, 45, 125, 0.25);
        }
      `}</style>
    </nav>
  );
}

"use client";
import { RefreshCw, CheckCircle2, Clock, Cloud } from "lucide-react";

interface HeaderProps {
  status: "loading" | "success" | "saving" | "queued" | "done" | "idle";
  onSync?: () => void;
}

export default function Header({ status, onSync }: HeaderProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "loading": return { text: "Đang tải dữ liệu lần đầu...", icon: RefreshCw, spin: true };
      case "success": return { text: "Đồng bộ thành công", icon: CheckCircle2, spin: false };
      case "saving": return { text: "Đã lưu, đợi đồng bộ", icon: Clock, spin: false };
      case "queued": return { text: "Đang ở hàng chờ đợi đồng bộ", icon: RefreshCw, spin: true };
      case "done": return { text: "Đã ghi vào Google Sheet", icon: Cloud, spin: false };
      default: return { text: "Đã đồng bộ", icon: CheckCircle2, spin: false };
    }
  };


  const config = getStatusConfig();
  const isLoading = status === "loading" || status === "saving" || status === "queued";

  return (
    <header className="header">
      <div className="header-content">
        <div className="title-section">
          <h1 className="title">Kho Thành Phẩm</h1>
          {config && (
            <div className="status-pill">
              <config.icon size={11} className={config.spin ? "spin" : ""} />
              <span>{config.text}</span>
            </div>
          )}
        </div>
        
        {onSync && (
          <button 
            className={`sync-btn ${isLoading ? 'disabled' : ''}`} 
            onClick={() => !isLoading && onSync()}
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? "spin" : ""} />
          </button>
        )}
      </div>

      <style jsx>{`
        .header {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(16px);
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid rgba(0,0,0,0.02);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .title-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .title {
          font-size: 19px;
          font-weight: 950;
          color: var(--primary-blue);
          margin: 0;
          letter-spacing: -0.6px;
        }
        .status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #1e293b;
          color: #f1f5f9;
          padding: 5px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          animation: fadeIn 0.3s ease-out;
          white-space: nowrap;
        }
        .sync-btn {
          background: var(--bg-input);
          border: none;
          color: var(--primary-blue);
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sync-btn:active {
          transform: scale(0.9);
          background: #e2e8f0;
        }
        .sync-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }


        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 2s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}


"use client";
import React, { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { Plus, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [settingsData, setSettingsData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [addingType, setAddingType] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");

  const groups = [
    { key: "mã", label: "MÃ (SKU)" },
    { key: "màu", label: "MÀU SẮC" },
    { key: "đơn", label: "ĐƠN HÀNG" },
    { key: "nhóm_cỡ", label: "NHÓM CỠ" },
    { key: "vị_trí", label: "VỊ TRÍ" }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      if (!data.error) {
        setSettingsData(data.settings || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (typeKey: string, typeLabel: string) => {
    if (!newValue.trim()) {
      setAddingType(null);
      return;
    }
    
    // Temporarily add to UI
    const currentList = settingsData[typeKey] || [];
    setSettingsData({ ...settingsData, [typeKey]: [...currentList, newValue] });
    
    const val = newValue;
    setNewValue("");
    setAddingType(null);

    // Send to backend
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addSetting", type: typeLabel.split(" ")[0], value: val }), // Simple mapping: "Mã (SKU)" -> "Mã"
      });
      fetchData(); // Sync up
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (typeKey: string, typeLabel: string, value: string) => {
    // Temporarily remove from UI
    const currentList = settingsData[typeKey] || [];
    setSettingsData({ ...settingsData, [typeKey]: currentList.filter((v: string) => v !== value) });

    // Send delete to backend
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteSetting", type: typeLabel.split(" ")[0], value }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="mobile-wrapper">
      <header className="header">
        <h1 className="title">Cài Đặt Dữ Liệu Gốc</h1>
      </header>
      
      <main className="content">
        {loading && <div className="loader">Đang đồng bộ...</div>}
        
        {!loading && groups.map((g) => (
          <div key={g.key} className="setting-group">
            <div className="group-header">
              <h2>{g.label}</h2>
              <button className="add-btn" onClick={() => setAddingType(g.key)}>
                <Plus size={16} /> Thêm
              </button>
            </div>
            
            <div className="items-list">
              {(settingsData[g.key] || []).map((val: string, i: number) => (
                <div key={i} className="setting-item">
                  <span>{val}</span>
                  <button className="del-btn" onClick={() => handleDelete(g.key, g.label, val)}><Trash2 size={16} /></button>
                </div>
              ))}
              
              {addingType === g.key && (
                <div className="add-input-row">
                  <input 
                    autoFocus
                    placeholder="Nhập giá trị..."
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd(g.key, g.label)}
                  />
                  <button className="save-btn" onClick={() => handleAdd(g.key, g.label)}>Lưu</button>
                </div>
              )}
              {(!settingsData[g.key] || settingsData[g.key].length === 0) && addingType !== g.key && (
                <div className="empty-state">Chưa có dữ liệu</div>
              )}
            </div>
          </div>
        ))}

        <div className="spacer"></div>
      </main>

      <BottomNav />
      <style jsx>{`
        .mobile-wrapper {
          width: 100%;
          min-height: 100vh;
          background-color: var(--bg-light);
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .header {
          padding: 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(0,0,0,0.03);
          box-shadow: var(--shadow-sm);
        }
        .title {
          font-size: 20px;
          font-weight: 900;
          color: var(--primary-blue);
          margin: 0;
          text-align: center;
        }
        .content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .loader {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .setting-group {
          background: var(--card-bg);
          border-radius: 20px;
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }
        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .group-header h2 {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }
        .add-btn {
          background: var(--bg-input);
          border: none;
          color: var(--primary-blue);
          padding: 8px 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--bg-input);
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-blue);
        }
        .del-btn {
          background: transparent;
          border: none;
          color: #ef4444;
          cursor: pointer;
          opacity: 0.7;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .add-input-row {
          display: flex;
          gap: 8px;
          background: var(--bg-input);
          border-radius: 12px;
          padding: 4px;
        }
        .add-input-row input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-blue);
          outline: none;
        }
        .save-btn {
          background: var(--primary-blue);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0 16px;
          font-weight: 700;
          font-size: 12px;
        }
        .empty-state {
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
          padding: 16px;
        }
        .spacer {
          height: 120px;
        }
      `}</style>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { Plus, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [settingsData, setSettingsData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"loading" | "success" | "saving" | "queued" | "done" | "idle">("loading");
  const [addingType, setAddingType] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const groups = [
    { key: "mã", label: "MÃ (SKU)" },
    { key: "màu", label: "MÀU SẮC" },
    { key: "đơn", label: "ĐƠN HÀNG" },
    { key: "nhóm_cỡ", label: "NHÓM CỠ" },
    { key: "vị_trí", label: "VỊ TRÍ" }
  ];

  useEffect(() => {
    const cachedSettings = localStorage.getItem("settings_data");
    setIsAdmin(localStorage.getItem("admin_mode") === "true");
    if (cachedSettings) {
      try {
        setSettingsData(JSON.parse(cachedSettings));
        setLoading(false);
        setSyncStatus("idle");
      } catch (e) {
        console.error(e);
        fetchData();
      }
    } else {
      fetchData();
    }
  }, []);

  const handleToggleAdmin = () => {
    if (isAdmin) {
      localStorage.setItem("admin_mode", "false");
      setIsAdmin(false);
      window.dispatchEvent(new Event("adminModeChanged"));
    } else {
      const pwd = prompt("Nhập mật khẩu Admin:");
      if (pwd === "admin") {
        localStorage.setItem("admin_mode", "true");
        setIsAdmin(true);
        window.dispatchEvent(new Event("adminModeChanged"));
      } else if (pwd !== null) {
        alert("Sai mật khẩu!");
      }
    }
  };

  const fetchData = async (silent = false) => {
    if (!silent) setSyncStatus("loading");
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      if (!data.error) {
        const settings = data.settings || {};
        setSettingsData(settings);
        localStorage.setItem("settings_data", JSON.stringify(settings));
        localStorage.setItem("last_sync_time", Date.now().toString());

        if (!silent) {
          setSyncStatus("success");
        } else {
          setSyncStatus("idle");
        }

      }
    } catch (e) {
      console.error(e);
      setSyncStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  const syncToCloud = async (actionData: any) => {
    setSyncStatus("saving"); // "Đã lưu, đợi đồng bộ"
    
    setTimeout(async () => {
      setSyncStatus("queued"); // "Đang ở hàng chờ đợi đồng bộ"
      
      try {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(actionData),
        });
        if (res.ok) {
          setSyncStatus("done"); // "Đã ghi vào Google Sheet"
          fetchData(true); // Silent refresh
        } else {

          setSyncStatus("idle");
        }
      } catch (e) {
        console.error(e);
        setSyncStatus("idle");
      }
    }, 1200);
  };

  const handleAdd = async (typeKey: string, typeLabel: string) => {
    if (!newValue.trim()) {
      setAddingType(null);
      return;
    }
    
    const val = newValue;
    // OPTIMISTIC
    const currentList = settingsData[typeKey] || [];
    const newSettings = { ...settingsData, [typeKey]: [...currentList, val] };
    setSettingsData(newSettings);
    localStorage.setItem("settings_data", JSON.stringify(newSettings));
    
    setNewValue("");
    setAddingType(null);

    // Map the key back to a clean label for Google Sheets
    const typeMap: { [key: string]: string } = {
      "mã": "Mã",
      "màu": "Màu",
      "đơn": "Đơn",
      "nhóm_cỡ": "Nhóm Cỡ",
      "vị_trí": "Vị Trí"
    };

    syncToCloud({ action: "addSetting", type: typeMap[typeKey] || typeLabel, value: val });
  };

  const handleDelete = async (typeKey: string, typeLabel: string, val: string) => {
    if (!confirm(`Xóa "${val}" khỏi ${typeLabel}?`)) return;

    // OPTIMISTIC
    const currentList = settingsData[typeKey] || [];
    const newSettings = { ...settingsData, [typeKey]: currentList.filter((v: string) => v !== val) };
    setSettingsData(newSettings);
    localStorage.setItem("settings_data", JSON.stringify(newSettings));

    const typeMap: { [key: string]: string } = {
      "mã": "Mã",
      "màu": "Màu",
      "đơn": "Đơn",
      "nhóm_cỡ": "Nhóm Cỡ",
      "vị_trí": "Vị Trí"
    };

    syncToCloud({ action: "deleteSetting", type: typeMap[typeKey] || typeLabel, value: val });
  };


  return (
    <div className="mobile-wrapper">
      <Header status={syncStatus} onSync={fetchData} />
      
      <main className="content">
        {loading && <div className="loader">Đang đồng bộ...</div>}
        
        {!loading && groups.map((g) => (
          <div key={g.key} className="setting-group">
            <div className="group-header">
              <h2>{g.label}</h2>
              <button 
                className="add-btn" 
                onClick={() => {
                  setAddingType(g.key);
                  setNewValue("");
                }}
              >
                <Plus size={16} /> Thêm
              </button>
            </div>
            
            <div className="items-list">
              {(settingsData[g.key] || []).map((val: string, i: number) => (
                <div key={i} className="setting-item">
                  <span>{val}</span>
                </div>
              ))}

              
              {(!settingsData[g.key] || settingsData[g.key].length === 0) && addingType !== g.key && (
                <div className="empty-state">Chưa có dữ liệu</div>
              )}
            </div>

            {addingType === g.key && (
              <div className="add-input-row">
                {g.key === "vị_trí" ? (
                  <div className="multi-input">
                      <input 
                        className="zone-input"
                        placeholder="Kệ" 
                        value={newValue.split('-')[0] || ""} 
                      onChange={e => {
                        const parts = newValue.split('-');
                        setNewValue(`${e.target.value.toUpperCase()}-${parts[1] || ""}`);
                      }}
                    />
                    <input 
                      className="loc-input"
                      placeholder="Vị trí" 
                      value={newValue.split('-')[1] || ""} 
                      onChange={e => {
                        const parts = newValue.split('-');
                        setNewValue(`${parts[0] || ""}-${e.target.value}`);
                      }}
                    />
                  </div>
                ) : (
                  <input 
                    placeholder="Nhập giá trị..."
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd(g.key, g.label)}
                  />
                )}
                <button className="save-btn" onClick={() => handleAdd(g.key, g.label)}>Lưu</button>
              </div>
            )}
          </div>
        ))}

        <div className="setting-group admin-section">
          <div className="group-header">
            <h2>HỆ THỐNG</h2>
          </div>
          <button 
            className={`admin-toggle-btn ${isAdmin ? 'active' : ''}`}
            onClick={handleToggleAdmin}
          >
            {isAdmin ? "Tắt Chế độ Admin" : "Bật Chế độ Admin"}
          </button>
          <p className="admin-note">
            {isAdmin 
              ? "Chế độ Admin đang bật. Bạn có thể sửa dữ liệu tại chi tiết vị trí." 
              : "Bật chế độ admin để có thể chỉnh sửa dữ liệu kho trực tiếp."}
          </p>
        </div>

        <div className="spacer"></div>
      </main>

      <BottomNav />
      <style jsx>{`
        .admin-section {
          border: 2px dashed ${isAdmin ? '#3b82f6' : '#e2e8f0'};
          transition: all 0.3s ease;
        }
        .admin-toggle-btn {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          background: #f1f5f9;
          color: #64748b;
          transition: all 0.2s;
        }
        .admin-toggle-btn.active {
          background: #3b82f6;
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .admin-note {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 12px;
          text-align: center;
          font-weight: 500;
        }
        .mobile-wrapper {
          width: 100%;
          min-height: 100vh;
          background-color: var(--bg-light);
          position: relative;
          display: flex;
          flex-direction: column;
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
          max-height: 240px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .items-list::-webkit-scrollbar {
          width: 4px;
        }
        .items-list::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
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
        .multi-input {
          display: flex;
          gap: 4px;
          flex: 4;
        }
        .zone-input {
          max-width: 60px;
          border-right: 1px solid rgba(0,0,0,0.05) !important;
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

"use client";
import { useState, useEffect } from "react";
import { X, Edit2, Check, RotateCcw, Search } from "lucide-react";

interface SKUDetail {
  mã: string;
  màu: string;
  đơn: string;
  nhóm_cỡ: string;
  tháng?: string;
  row_index?: number;
  kệ?: string;
  vị_trí?: string;
}

interface LocationDetailsProps {
  locId: string;
  skus: SKUDetail[];
  onClose: () => void;
  onRefresh?: () => void;
  settings?: any;
}

export default function LocationDetails({ locId, skus, onClose, onRefresh, settings = {} }: LocationDetailsProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<SKUDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const LOOKUP_DATA = {
    mã: settings.mã || [],
    màu: settings.màu || [],
    nhóm_cỡ: settings.nhóm_cỡ || [],
    đơn: settings.đơn || [],
    vị_trí: settings.vị_trí || [],
    tháng: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
  };

  useEffect(() => {
    const checkAdmin = () => {
      setIsAdmin(localStorage.getItem("admin_mode") === "true");
    };
    checkAdmin();
    window.addEventListener("adminModeChanged", checkAdmin);
    return () => window.removeEventListener("adminModeChanged", checkAdmin);
  }, []);

  const handleStartEdit = (index: number, sku: SKUDetail) => {
    setEditingIndex(index);
    // Ensure vị_trí is set for navigation/editing
    const fullLoc = sku.kệ && sku.vị_trí ? `${sku.kệ}-${sku.vị_trí}` : (sku.vị_trí || locId);
    setEditData({ ...sku, vị_trí: fullLoc });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditData(null);
    setShowDropdown(null);
  };

  const handleSelect = (field: string, value: string) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
    setShowDropdown(null);
  };

  const handleSaveEdit = async () => {
    if (!editData || !editData.row_index) return;
    setSaving(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateKho",
          ...editData,
        }),
      });
      if (res.ok) {
        setEditingIndex(null);
        setEditData(null);
        if (onRefresh) onRefresh();
      } else {
        alert("Lỗi khi lưu dữ liệu!");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2>Vị Trí: {locId}</h2>
            {isAdmin && <span className="admin-badge">ADMIN MODE</span>}
          </div>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>

        <div className="details-list">
          {skus.length === 0 ? (
            <p className="empty">Vị trí này đang trống.</p>
          ) : (
            skus.map((sku, index) => {
              const isEditing = editingIndex === index;
              return (
                <div key={index} className={`sku-detail-card ${isEditing ? 'editing' : ''}`}>
                  {isEditing ? (
                    <div className="edit-form">
                      {/* Similar structure to EntryForm */}
                      
                      <div className="form-group">
                        <label>MÃ</label>
                        <div className="search-input" onClick={() => setShowDropdown("mã")}>
                          <input 
                            placeholder="Tìm mã..." 
                            value={editData?.mã || ""} 
                            onChange={(e) => {
                              setEditData({...editData!, mã: e.target.value});
                              setShowDropdown("mã");
                            }}
                          />
                        </div>
                        {showDropdown === "mã" && (
                          <ul className="dropdown">
                            {LOOKUP_DATA.mã.filter((v: string) => v.toLowerCase().includes((editData?.mã || "").toLowerCase())).map((v: string) => (
                              <li key={v} onClick={() => handleSelect("mã", v)}>{v}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="form-group">
                        <label>MÀU</label>
                        <div className="search-input" onClick={() => setShowDropdown("màu")}>
                          <input 
                            placeholder="Tìm màu..." 
                            value={editData?.màu || ""} 
                            onChange={(e) => {
                              setEditData({...editData!, màu: e.target.value});
                              setShowDropdown("màu");
                            }}
                          />
                        </div>
                        {showDropdown === "màu" && (
                          <ul className="dropdown">
                            {LOOKUP_DATA.màu.filter((v: string) => v.toLowerCase().includes((editData?.màu || "").toLowerCase())).map((v: string) => (
                              <li key={v} onClick={() => handleSelect("màu", v)}>{v}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="form-group">
                        <label>NHÓM CỠ</label>
                        <select 
                          value={editData?.nhóm_cỡ || ""} 
                          onChange={(e) => setEditData({...editData!, nhóm_cỡ: e.target.value})}
                        >
                          <option value="">Chọn nhóm cỡ...</option>
                          {LOOKUP_DATA.nhóm_cỡ.map((v: string) => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>ĐƠN</label>
                        <div className="search-input" onClick={() => setShowDropdown("đơn")}>
                          <input 
                            placeholder="Tìm đơn..." 
                            value={editData?.đơn || ""} 
                            onChange={(e) => {
                              setEditData({...editData!, đơn: e.target.value});
                              setShowDropdown("đơn");
                            }}
                          />
                        </div>
                        {showDropdown === "đơn" && (
                          <ul className="dropdown">
                            {LOOKUP_DATA.đơn.filter((v: string) => v.toLowerCase().includes((editData?.đơn || "").toLowerCase())).map((v: string) => (
                              <li key={v} onClick={() => handleSelect("đơn", v)}>{v}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* NEW: Vị trí input like EntryForm */}
                      <div className="form-group">
                        <label>VỊ TRÍ</label>
                        <div className="search-input" onClick={() => setShowDropdown("vị_trí")}>
                          <input 
                            placeholder="Tìm vị trí..." 
                            value={editData?.vị_trí || ""} 
                            onChange={(e) => {
                              setEditData({...editData!, vị_trí: e.target.value});
                              setShowDropdown("vị_trí");
                            }}
                          />
                        </div>
                        {showDropdown === "vị_trí" && (
                          <ul className="dropdown">
                            {LOOKUP_DATA.vị_trí.filter((v: string) => v.toLowerCase().includes((editData?.vị_trí || "").toLowerCase())).map((v: string) => (
                              <li key={v} onClick={() => handleSelect("vị_trí", v)}>{v}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="form-group">
                        <label>THÁNG</label>
                        <select 
                          value={editData?.tháng || ""} 
                          onChange={(e) => setEditData({...editData!, tháng: e.target.value})}
                        >
                          <option value="">Chọn tháng...</option>
                          {LOOKUP_DATA.tháng.map((v: string) => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>

                      <div className="edit-actions">
                        <button className="cancel-btn" onClick={handleCancelEdit} disabled={saving}>
                          <RotateCcw size={16} /> Hủy
                        </button>
                        <button className="confirm-btn" onClick={handleSaveEdit} disabled={saving}>
                          <Check size={16} /> {saving ? "Đang lưu..." : "Lưu"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="detail-row">
                        <span className="label">MÃ:</span>
                        <span className="value">{sku.mã}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">MÀU:</span>
                        <span className="value">{sku.màu}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">ĐƠN:</span>
                        <span className="value">{sku.đơn}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">NHÓM CỠ:</span>
                        <span className="value">{sku.nhóm_cỡ}</span>
                      </div>
                      {sku.tháng && (
                        <div className="detail-row">
                          <span className="label">THÁNG:</span>
                          <span className="value">{sku.tháng}</span>
                        </div>
                      )}
                      {isAdmin && sku.row_index && (
                        <button 
                          className="edit-btn" 
                          onClick={() => handleStartEdit(index, sku)}
                        >
                          <Edit2 size={14} /> Sửa dòng này
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            z-index: 9999;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 64px 24px 24px;
          }
          .modal-content {
            background: white;
            position: relative;
            width: 100%;
            max-width: 420px;
            border-radius: 36px;
            padding: 32px 24px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.15);
            animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 1px solid rgba(0,0,0,0.03);
          }
          @keyframes modalPop {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 28px;
          }
          .modal-header h2 {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            letter-spacing: -0.8px;
          }
          .admin-badge {
            font-size: 10px;
            background: #eff6ff;
            color: #3b82f6;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 800;
            margin-top: 8px;
            display: inline-block;
            border: 1px solid #dbeafe;
          }
          .close-btn {
            background: #f1f5f9;
            border: none;
            color: #475569;
            cursor: pointer;
            border-radius: 16px;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }
          .close-btn:active {
            transform: scale(0.92);
          }
          .details-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .sku-detail-card {
            background: #ffffff;
            border-radius: 28px;
            padding: 24px;
            border: 1px solid #f1f5f9;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
            position: relative;
          }
          .sku-detail-card.editing {
            border-color: #3b82f6;
            box-shadow: 0 10px 30px -5px rgba(59, 130, 246, 0.15);
            transform: translateY(-2px);
          }
          .edit-btn {
            width: 100%;
            margin-top: 16px;
            background: #ffffff;
            border: 1.5px solid #f1f5f9;
            color: #64748b;
            padding: 12px;
            border-radius: 18px;
            font-size: 13px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .edit-btn:hover {
            border-color: #e2e8f0;
            color: #334155;
            background: #f8fafc;
          }
          .edit-form {
            display: flex;
            flex-direction: column;
            gap: 14px;
            text-align: left;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            position: relative;
          }
          .form-group label {
            font-size: 11px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-left: 4px;
          }
          .search-input {
            position: relative;
          }
          input, select {
            width: 100%;
            padding: 12px 16px;
            background: #f8fafc;
            border: 1.5px solid #f1f5f9;
            border-radius: 16px;
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
            outline: none;
            transition: all 0.2s;
            appearance: none;
          }
          select {
            background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
            background-repeat: no-repeat;
            background-position: right 16px center;
            background-size: 16px;
          }
          input:focus, select:focus {
            background: #ffffff;
            border-color: #3b82f6;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
          }
          .dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 16px;
            margin-top: 8px;
            max-height: 180px;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            z-index: 100;
            list-style: none;
            padding: 8px;
            border: 1px solid #f1f5f9;
          }
          .dropdown li {
            padding: 12px 16px;
            font-size: 14px;
            color: #1e293b;
            font-weight: 600;
            cursor: pointer;
            border-radius: 10px;
          }
          .dropdown li:hover {
            background: #f8fafc;
            color: #3b82f6;
          }
          .edit-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 24px;
          }
          .edit-actions button {
            padding: 16px;
            border-radius: 20px;
            border: none;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s;
          }
          .cancel-btn {
            background: #f1f5f9;
            color: #64748b;
          }
          .confirm-btn {
            background: #3b82f6;
            color: white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
          }
          .confirm-btn:disabled { opacity: 0.5; }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            align-items: center;
          }
          .detail-row:last-of-type { margin-bottom: 0; }
          .label {
            font-size: 11px;
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }
          .value {
            font-size: 16px;
            color: #0f172a;
            font-weight: 700;
          }
          .empty {
            text-align: center;
            color: #94a3b8;
            padding: 24px 20px;
            font-weight: 600;
            font-size: 16px;
          }
          .modal-content::-webkit-scrollbar { width: 4px; }
          .modal-content::-webkit-scrollbar-track { background: transparent; }
          .modal-content::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
        `}</style>
      </div>
    </div>
  );
}

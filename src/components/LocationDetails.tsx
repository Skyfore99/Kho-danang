"use client";
import { useState, useEffect } from "react";
import { X, Edit2, Check, RotateCcw } from "lucide-react";

interface SKUDetail {
  mã: string;
  màu: string;
  đơn: string;
  nhóm_cỡ: string;
  tháng?: string;
  row_index?: number;
}

interface LocationDetailsProps {
  locId: string;
  skus: SKUDetail[];
  onClose: () => void;
  onRefresh?: () => void;
}

export default function LocationDetails({ locId, skus, onClose, onRefresh }: LocationDetailsProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<SKUDetail | null>(null);
  const [saving, setSaving] = useState(false);

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
    setEditData({ ...sku });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditData(null);
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
          vị_trí: locId
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
                      {['mã', 'màu', 'đơn', 'nhóm_cỡ', 'tháng'].map((field) => (
                        <div key={field} className="edit-row">
                          <label>{field.toUpperCase()}:</label>
                          <input 
                            value={(editData as any)?.[field] || ""} 
                            onChange={e => setEditData({...editData!, [field]: e.target.value})}
                          />
                        </div>
                      ))}
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
            background: rgba(255, 255, 255, 0.85); /* Increased opacity for light mode */
            backdrop-filter: blur(20px);
            z-index: 9999; /* Maximize z-index to stay above filters */
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .modal-content {
            background: white;
            position: relative; /* Changed from absolute to work with flex center */
            width: 100%;
            max-width: 420px;
            border-radius: 36px;
            padding: 32px 24px;
            max-height: 90vh; /* Allow it to be taller */
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
          }
          .edit-row {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .edit-row label {
            font-size: 11px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-left: 4px;
          }
          .edit-row input {
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
          }
          .edit-row input:focus {
            background: #ffffff;
            border-color: #3b82f6;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
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
            padding: 48px 20px;
            font-weight: 600;
            font-size: 16px;
          }
          /* Custom scrollbar for modal content */
          .modal-content::-webkit-scrollbar {
            width: 4px;
          }
          .modal-content::-webkit-scrollbar-track {
            background: transparent;
          }
          .modal-content::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
          }
        `}</style>
      </div>
    </div>
  );
}

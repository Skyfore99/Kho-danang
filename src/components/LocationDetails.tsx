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
            background: rgba(15, 20, 50, 0.5);
            backdrop-filter: blur(8px);
            z-index: 2000;
          }
          .modal-content {
            background: white;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: calc(100% - 48px);
            border-radius: 28px;
            padding: 24px 20px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: var(--shadow-lg);
            animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          @keyframes modalPop {
            from { opacity: 0; margin-top: 20px; }
            to { opacity: 1; margin-top: 0; }
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding: 0 4px;
          }
          .modal-header h2 {
            font-size: 20px;
            font-weight: 800;
            color: var(--primary-blue);
            margin: 0;
          }
          .admin-badge {
            font-size: 10px;
            background: #3b82f6;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 900;
            margin-top: 4px;
            display: inline-block;
          }
          .close-btn {
            background: var(--bg-input);
            border: none;
            color: var(--primary-blue);
            cursor: pointer;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
          }
          .close-btn:active {
            background: #e2e8f0;
          }
          .details-list {
            max-height: 440px;
            overflow-y: auto;
            padding-right: 4px;
          }
          .details-list::-webkit-scrollbar {
            width: 4px;
          }
          .details-list::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.02);
            border-radius: 4px;
          }
          .details-list::-webkit-scrollbar-thumb {
            background: rgba(35, 45, 125, 0.2);
            border-radius: 4px;
          }
          .sku-detail-card {
            background: var(--bg-input);
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 12px;
            border: 2px solid transparent;
            transition: all 0.2s;
            position: relative;
          }
          .sku-detail-card.editing {
            border-color: #3b82f6;
            background: white;
            box-shadow: var(--shadow-lg);
          }
          .edit-btn {
            width: 100%;
            margin-top: 12px;
            background: white;
            border: 1px solid #e2e8f0;
            color: #64748b;
            padding: 8px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            cursor: pointer;
          }
          .edit-form {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .edit-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
          .edit-row label {
            font-size: 11px;
            font-weight: 800;
            color: var(--text-muted);
            min-width: 60px;
          }
          .edit-row input {
            flex: 1;
            padding: 6px 10px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            color: var(--primary-blue);
            outline: none;
          }
          .edit-row input:focus {
            border-color: #3b82f6;
          }
          .edit-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 10px;
          }
          .edit-actions button {
            padding: 10px;
            border-radius: 8px;
            border: none;
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }
          .cancel-btn {
            background: #f1f5f9;
            color: #64748b;
          }
          .confirm-btn {
            background: #3b82f6;
            color: white;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            align-items: center;
          }
          .label {
            font-size: 11px;
            color: var(--text-muted);
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .value {
            font-size: 15px;
            color: var(--primary-blue);
            font-weight: 700;
          }
          .empty {
            text-align: center;
            color: var(--text-muted);
            padding: 32px 20px;
            font-weight: 600;
            font-size: 15px;
          }
        `}</style>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";

interface EntryFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  settings?: any;
}

export default function EntryForm({ onClose, onSubmit, settings = {} }: EntryFormProps) {
  const [formData, setFormData] = useState({
    mã: "",
    màu: "",
    nhóm_cỡ: "",
    đơn: "",
    tháng: "",
    vị_trí: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const LOOKUP_DATA = {
    mã: settings.mã || ["SKU-001", "SKU-002", "SKU-100"],
    màu: settings.màu || ["Đỏ", "Xanh", "Vàng"],
    nhóm_cỡ: settings.nhóm_cỡ || ["Nhóm A", "Nhóm B", "Nhóm C"],
    đơn: settings.đơn || ["Đơn 001", "Đơn 002"],
    vị_trí: settings.vị_trí || ["A01", "A02", "B01", "B02", "C01", "C02"],
    tháng: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
  };

  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Check required
    if (!formData.mã) newErrors.mã = "Mã là bắt buộc";
    if (!formData.màu) newErrors.màu = "Màu là bắt buộc";
    if (!formData.nhóm_cỡ) newErrors.nhóm_cỡ = "Nhóm cỡ là bắt buộc";
    if (!formData.đơn) newErrors.đơn = "Đơn là bắt buộc";
    if (!formData.vị_trí) newErrors.vị_trí = "Vị trí là bắt buộc";

    // STRICT VALIDATION (Match against Master Data)
    if (formData.mã && !LOOKUP_DATA.mã.includes(formData.mã)) newErrors.mã = "Mã không tồn tại trong dữ liệu gốc";
    if (formData.màu && !LOOKUP_DATA.màu.includes(formData.màu)) newErrors.màu = "Màu không tồn tại trong dữ liệu gốc";
    if (formData.đơn && !LOOKUP_DATA.đơn.includes(formData.đơn)) newErrors.đơn = "Đơn không tồn tại trong dữ liệu gốc";
    if (formData.vị_trí && !LOOKUP_DATA.vị_trí.includes(formData.vị_trí)) newErrors.vị_trí = "Vị trí không tồn tại trong dữ liệu gốc";
    if (formData.nhóm_cỡ && !LOOKUP_DATA.nhóm_cỡ.includes(formData.nhóm_cỡ)) newErrors.nhóm_cỡ = "Nhóm cỡ không tồn tại";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSelect = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setShowDropdown(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Nhập Thông Tin</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>

        <div className="form-body">
          {/* MÃ (Searchable) */}
          <div className="form-group">
            <label>MÃ *</label>
            <div className="search-input" onClick={() => setShowDropdown("mã")}>
              <input 
                placeholder="Tìm mã..." 
                value={formData.mã} 
                onChange={(e) => {
                  setFormData({...formData, mã: e.target.value});
                  setShowDropdown("mã");
                }}
              />
            </div>

            {showDropdown === "mã" && (
              <ul className="dropdown">
                {LOOKUP_DATA.mã.filter((v: string) => v.toLowerCase().includes(formData.mã.toLowerCase())).map((v: string) => (
                  <li key={v} onClick={() => handleSelect("mã", v)}>{v}</li>
                ))}
              </ul>
            )}
            {errors.mã && <span className="error">{errors.mã}</span>}
          </div>

          {/* MÀU (Searchable) */}
          <div className="form-group">
            <label>MÀU *</label>
            <div className="search-input" onClick={() => setShowDropdown("màu")}>
              <input 
                placeholder="Tìm màu..." 
                value={formData.màu} 
                onChange={(e) => {
                  setFormData({...formData, màu: e.target.value});
                  setShowDropdown("màu");
                }}
              />
            </div>

            {showDropdown === "màu" && (
              <ul className="dropdown">
                {LOOKUP_DATA.màu.filter((v: string) => v.toLowerCase().includes(formData.màu.toLowerCase())).map((v: string) => (
                  <li key={v} onClick={() => handleSelect("màu", v)}>{v}</li>
                ))}
              </ul>
            )}
            {errors.màu && <span className="error">{errors.màu}</span>}
          </div>

          {/* NHÓM CỠ (Select Only) */}
          <div className="form-group">
            <label>NHÓM CỠ *</label>
            <select 
              value={formData.nhóm_cỡ} 
              onChange={(e) => setFormData({...formData, nhóm_cỡ: e.target.value})}
            >
              <option value="">Chọn nhóm cỡ...</option>
              {LOOKUP_DATA.nhóm_cỡ.map((v: string) => <option key={v} value={v}>{v}</option>)}
            </select>
            {errors.nhóm_cỡ && <span className="error">{errors.nhóm_cỡ}</span>}
          </div>

          {/* ĐƠN (Searchable) */}
          <div className="form-group">
            <label>ĐƠN *</label>
            <div className="search-input" onClick={() => setShowDropdown("đơn")}>
              <input 
                placeholder="Tìm đơn..." 
                value={formData.đơn} 
                onChange={(e) => {
                  setFormData({...formData, đơn: e.target.value});
                  setShowDropdown("đơn");
                }}
              />
            </div>

            {showDropdown === "đơn" && (
              <ul className="dropdown">
                {LOOKUP_DATA.đơn.filter((v: string) => v.toLowerCase().includes(formData.đơn.toLowerCase())).map((v: string) => (
                  <li key={v} onClick={() => handleSelect("đơn", v)}>{v}</li>
                ))}
              </ul>
            )}
            {errors.đơn && <span className="error">{errors.đơn}</span>}
          </div>

          {/* VỊ TRÍ (Searchable) */}
          <div className="form-group">
            <label>VỊ TRÍ *</label>
            <div className="search-input" onClick={() => setShowDropdown("vị_trí")}>
              <input 
                placeholder="Tìm vị trí..." 
                value={formData.vị_trí} 
                onChange={(e) => {
                  setFormData({...formData, vị_trí: e.target.value});
                  setShowDropdown("vị_trí");
                }}
              />
            </div>
            {showDropdown === "vị_trí" && (
              <ul className="dropdown">
                {LOOKUP_DATA.vị_trí.filter((v: string) => v.toLowerCase().includes(formData.vị_trí.toLowerCase())).map((v: string) => (
                  <li key={v} onClick={() => handleSelect("vị_trí", v)}>{v}</li>
                ))}
              </ul>
            )}
            {errors.vị_trí && <span className="error">{errors.vị_trí}</span>}
          </div>


          {/* THÁNG (Select Only) */}
          <div className="form-group">
            <label>THÁNG</label>
            <select 
              value={formData.tháng} 
              onChange={(e) => setFormData({...formData, tháng: e.target.value})}
            >
              <option value="">Chọn tháng...</option>
              {LOOKUP_DATA.tháng.map((v: string) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-submit" onClick={() => validate() && onSubmit(formData)}>Gửi</button>
        </div>
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
          display: flex;
          flex-direction: column;
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
          font-size: 22px;
          font-weight: 800;
          color: var(--primary-blue);
          margin: 0;
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
        .form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }
        .form-group label {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding-left: 4px;
        }
        .search-input {
          position: relative;
          display: flex;
          align-items: center;
        }
         input, select {
          width: 100%;
          padding: 16px;
          border: 2px solid transparent;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 600;
          color: var(--primary-blue);
          background: var(--bg-input);
          outline: none;
          font-family: inherit;
          transition: all 0.2s;
          appearance: none;
          -webkit-appearance: none;
        }
        select {
          padding-left: 16px;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23232d7d%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
        }
        input:focus, select:focus {
          border-color: rgba(35, 45, 125, 0.2);
          background: white;
          box-shadow: 0 4px 12px rgba(35, 45, 125, 0.05);
        }
        input::placeholder {
          color: #a0aec0;
          font-weight: 500;
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
          box-shadow: var(--shadow-lg);
          z-index: 10;
          list-style: none;
          padding: 8px;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .dropdown li {
          padding: 12px 16px;
          font-size: 14px;
          color: var(--primary-blue);
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
        }
        .dropdown li:hover {
          background: var(--bg-light);
        }
        .error {
          font-size: 12px;
          color: #ef4444;
          font-weight: 600;
          padding-left: 4px;
        }
        .modal-footer {
          display: flex;
          gap: 12px;
          margin-top: 28px;
        }
        .btn-cancel, .btn-submit {
          flex: 1;
          padding: 16px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cancel {
          background: var(--bg-input);
          color: var(--text-muted);
        }
        .btn-submit {
          background: var(--accent-orange);
          color: white;
          box-shadow: 0 8px 20px rgba(242, 92, 5, 0.3);
        }
        .btn-cancel:active, .btn-submit:active {
          transform: scale(0.96);
        }
      `}</style>
    </div>
  );
}


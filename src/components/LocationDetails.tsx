"use client";
import { X } from "lucide-react";

interface SKUDetail {
  mã: string;
  màu: string;
  đơn: string;
  nhóm_cỡ: string;
  tháng?: string;
}

interface LocationDetailsProps {
  locId: string;
  skus: SKUDetail[];
  onClose: () => void;
}

export default function LocationDetails({ locId, skus, onClose }: LocationDetailsProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Chi Tiết Vị Trí: {locId}</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>

        <div className="details-list">
          {skus.length === 0 ? (
            <p className="empty">Vị trí này đang trống.</p>
          ) : (
            skus.map((sku, index) => (
              <div key={index} className="sku-detail-card">
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
              </div>
            ))
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
          .sku-detail-card {
            background: var(--bg-input);
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 12px;
            border: 2px solid transparent;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            align-items: center;
          }
          .detail-row:last-child {
            margin-bottom: 0;
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


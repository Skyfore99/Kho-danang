"use client";
import { ChevronDown, Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface FilterCardProps {
  label: string;
  value: string;
  options?: string[];
  onChange: (val: string) => void;
  isSearchable?: boolean;
}

export default function FilterCard({ label, value, options = [], onChange, isSearchable }: FilterCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  const clearFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="filter-wrapper" ref={dropdownRef}>
      <div 
        className={`filter-card ${isOpen ? 'active' : ''} ${value ? 'has-value' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="label">{label}</span>
        <div className="value-row">
          <span className="value truncate-text">{value || "Tất cả"}</span>
          <div className="icons">
            {value && <X size={14} className="clear-icon" onClick={clearFilter} />}
            <ChevronDown size={16} className={`chevron ${isOpen ? 'rotate' : ''}`} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="dropdown-panel">
          {isSearchable && (
            <div className="search-bar">
              <Search size={16} />
              <input 
                placeholder="Tìm kiếm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          <div className="options-list">
            <div className={`option ${!value ? 'selected' : ''}`} onClick={() => handleSelect("")}>
              Tất cả
            </div>
            {filteredOptions.map((opt) => (
              <div 
                key={opt} 
                className={`option ${value === opt ? 'selected' : ''}`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </div>
            ))}
            {isSearchable && filteredOptions.length === 0 && (
              <div className="no-result">Không tìm thấy</div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .filter-wrapper {
          position: relative;
          width: 100%;
        }
        .filter-card {
          background: var(--card-bg);
          border-radius: 18px;
          padding: 12px 14px;
          border: 1px solid rgba(0,0,0,0.03);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .filter-card:active {
          transform: scale(0.97);
        }
        .filter-card.active {
          border-color: var(--primary-blue);
          box-shadow: 0 4px 12px rgba(35, 45, 125, 0.1);
        }
        .filter-card.has-value {
          background: #f8faff;
          border-color: rgba(35, 45, 125, 0.1);
        }
        .label {
          font-size: 10px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .value-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 20px;
        }
        .value {
          font-size: 13px;
          font-weight: 700;
          color: var(--primary-blue);
          max-width: 80%;
        }
        .icons {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
        }
        .chevron {
          transition: transform 0.3s;
        }
        .chevron.rotate {
          transform: rotate(180deg);
        }
        .clear-icon {
          padding: 2px;
          border-radius: 50%;
          background: rgba(0,0,0,0.05);
        }

        .dropdown-panel {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 100%;
          min-width: 160px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          z-index: 2000;
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .search-bar {
          display: flex;
          align-items: center;
          padding: 12px 14px;
          border-bottom: 1px solid rgba(0,0,0,0.04);
          gap: 10px;
          color: var(--text-muted);
          background: white;
        }
        .search-bar input {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
          padding: 0;
          -webkit-appearance: none;
        }
        .search-bar input::placeholder {
          color: var(--text-muted);
          opacity: 0.6;
        }
        .options-list {
          max-height: 200px;
          overflow-y: auto;
          padding: 6px;
        }
        .option {
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          transition: background 0.2s;
        }
        .option:hover, .option:active {
          background: var(--bg-input);
          color: var(--primary-blue);
        }
        .option.selected {
          background: var(--primary-blue);
          color: white;
        }
        .no-result {
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

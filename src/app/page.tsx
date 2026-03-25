"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import FilterCard from "@/components/FilterCard";
import MapGrid from "@/components/MapGrid";
import FAB from "@/components/FAB";
import EntryForm from "@/components/EntryForm";
import LocationDetails from "@/components/LocationDetails";

// Mock Data
const MOCK_ZONES = [
  {
    id: "A",
    name: "ZONE A",
    locations: [
      { id: "A01", skus: [{ id: "SKU-001" }, { id: "SKU-002" }, { id: "SKU-003" }, { id: "SKU-004" }] },
      { id: "A02", skus: [{ id: "SKU-005" }, { id: "SKU-006" }, { id: "SKU-007" }, { id: "SKU-008" }] },
    ],
  },
  {
    id: "B",
    name: "ZONE B",
    locations: [
      { id: "B01", skus: [{ id: "SKU-010" }, { id: "SKU-011" }, { id: "SKU-012" }, { id: "SKU-013" }] },
      { id: "B02", skus: [{ id: "SKU-101" }, { id: "SKU-102" }, { id: "SKU-103" }, { id: "SKU-104" }] },
    ],
  },
  {
    id: "C",
    name: "ZONE C",
    locations: [
      { id: "C01", skus: [{ id: "SKU-205" }, { id: "SKU-206" }, { id: "SKU-207" }, { id: "SKU-208" }] },
      { id: "C02", skus: [{ id: "SKU-209" }, { id: "SKU-210" }, { id: "SKU-211" }, { id: "SKU-212" }] },
    ],
  },
];

export default function Home() {
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [settingsData, setSettingsData] = useState<any>({});

  // Filters
  const [filters, setFilters] = useState({
    mã: "",
    màu: "",
    đơn: "",
    nhóm_cỡ: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      if (!data.error) {
        setSheetData(data.kho || []);
        setSettingsData(data.settings || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = (locId: string) => {
    setSelectedLocation(locId);
  };

  const handleEntrySubmit = async (data: any) => {
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setShowEntryModal(false);
        fetchData(); // Refresh data
      }
    } catch (e) {
      console.error("Submit failed:", e);
    }
  };

  // Logic to build zones from sheet data with dynamic filtering
  const zones = MOCK_ZONES.map(zone => ({
    ...zone,
    locations: zone.locations.map(loc => {
      let activeItems = sheetData.filter(d => d.vị_trí === loc.id);
      
      if (filters.mã) activeItems = activeItems.filter(d => d.mã === filters.mã);
      if (filters.màu) activeItems = activeItems.filter(d => d.màu === filters.màu);
      if (filters.đơn) activeItems = activeItems.filter(d => d.đơn === filters.đơn);
      if (filters.nhóm_cỡ) activeItems = activeItems.filter(d => d.nhóm_cỡ === filters.nhóm_cỡ);

      return {
        ...loc,
        skus: activeItems.map(d => ({ id: d.mã }))
      };
    })
  }));

  return (
    <div className="mobile-wrapper">
      <Header />
      
      <main className="content">
        {loading && <div className="loader">Đang tải...</div>}
        <div className="filters-grid">
          <FilterCard 
            label="LỌC MÃ" 
            value={filters.mã}
            options={settingsData.mã || []}
            onChange={(v) => setFilters({...filters, mã: v})}
            isSearchable={true}
          />
          <FilterCard 
            label="LỌC MÀU" 
            value={filters.màu} 
            options={settingsData.màu || []}
            onChange={(v) => setFilters({...filters, màu: v})}
            isSearchable={true}
          />
          <FilterCard 
            label="LỌC ĐƠN" 
            value={filters.đơn}
            options={settingsData.đơn || []}
            onChange={(v) => setFilters({...filters, đơn: v})}
            isSearchable={true}
          />
          <FilterCard 
            label="NHÓM CỠ" 
            value={filters.nhóm_cỡ}
            options={settingsData.nhóm_cỡ || []}
            onChange={(v) => setFilters({...filters, nhóm_cỡ: v})}
            isSearchable={false}
          />

        </div>

        <MapGrid zones={zones} onLocationClick={handleLocationClick} />
      </main>

      <FAB onClick={() => setShowEntryModal(true)} />
      
      {showEntryModal && (
        <EntryForm 
          settings={settingsData}
          onClose={() => setShowEntryModal(false)} 
          onSubmit={handleEntrySubmit} 
        />
      )}

      {selectedLocation && (
        <LocationDetails 
          locId={selectedLocation} 
          skus={sheetData.filter(d => {
            if (d.vị_trí !== selectedLocation) return false;
            if (filters.mã && d.mã !== filters.mã) return false;
            if (filters.màu && d.màu !== filters.màu) return false;
            if (filters.đơn && d.đơn !== filters.đơn) return false;
            if (filters.nhóm_cỡ && d.nhóm_cỡ !== filters.nhóm_cỡ) return false;
            return true;
          })}
          onClose={() => setSelectedLocation(null)} 
        />
      )}


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
        .filters-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 12px 16px;
        }
        .content {
          padding-top: 4px;
        }
      `}</style>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import FilterCard from "@/components/FilterCard";
import MapGrid from "@/components/MapGrid";
import FAB from "@/components/FAB";
import EntryForm from "@/components/EntryForm";
import LocationDetails from "@/components/LocationDetails";



export default function Home() {
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"loading" | "success" | "saving" | "queued" | "done" | "idle">("loading");
  const [settingsData, setSettingsData] = useState<any>({});

  // Filters
  const [filters, setFilters] = useState({
    mã: "",
    màu: "",
    đơn: "",
    nhóm_cỡ: "",
  });

  useEffect(() => {
    // 1. Initial Load from LocalStorage for instant UI
    const cachedKho = localStorage.getItem("warehouse_data");
    const cachedSettings = localStorage.getItem("settings_data");
    
    if (cachedKho && cachedSettings) {
      try {
        setSheetData(JSON.parse(cachedKho));
        setSettingsData(JSON.parse(cachedSettings));
        setLoading(false);
        setSyncStatus("idle");
      } catch (e) {
        console.error("Cache parse error", e);
        fetchData();
      }
    } else {
      fetchData(); // Only full fetch if ABSOLUTELY no cache
    }
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setSyncStatus("loading");
    
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      if (!data.error) {
        const kho = data.kho || [];
        const settings = data.settings || {};
        
        setSheetData(kho);
        setSettingsData(settings);
        
        // Update Cache
        localStorage.setItem("warehouse_data", JSON.stringify(kho));
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

  const handleLocationClick = (locId: string) => {
    setSelectedLocation(locId);
  };

  const handleEntrySubmit = async (data: any) => {
    // 1. OPTIMISTIC UPDATE: Update UI instantly
    const newItems = [...sheetData, { ...data, thời_gian: new Date().toISOString() }];
    setSheetData(newItems);
    localStorage.setItem("warehouse_data", JSON.stringify(newItems));
    setShowEntryModal(false);

    // 2. STATUS SEQUENCE
    setSyncStatus("saving"); // "Đã lưu, đợi đồng bộ"
    
    setTimeout(async () => {
      setSyncStatus("queued"); // "Đang ở hàng chờ đợi đồng bộ"
      
      try {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        
        if (res.ok) {
          setSyncStatus("done"); // "Đã ghi vào Google Sheet"
          fetchData(true); // Silent refresh in background
        } else {

          setSyncStatus("idle");
        }
      } catch (e) {
        console.error("Submit failed:", e);
        setSyncStatus("idle");
      }
    }, 1500); // Artificial delay to show "saving" status
  };


  // Logic to build zones from sheet data with dynamic filtering
  const dynamicZones: any[] = [];
  const locationList = settingsData.vị_trí || [];
  
  locationList.forEach((locId: string) => {
    // If locId is "A-01", zone is "A", name is "ZONE A"
    const parts = locId.split('-');
    const zoneId = parts.length > 1 ? parts[0] : "CHUNG";
    const locName = parts.length > 1 ? parts[1] : locId;
    
    let zone = dynamicZones.find(z => z.id === zoneId);
    if (!zone) {
      zone = { id: zoneId, name: `KỆ ${zoneId}`, locations: [] };
      dynamicZones.push(zone);
    }
    
    let activeItems = sheetData.filter(d => d.vị_trí === locId);
    if (filters.mã) activeItems = activeItems.filter(d => d.mã === filters.mã);
    if (filters.màu) activeItems = activeItems.filter(d => d.màu === filters.màu);
    if (filters.đơn) activeItems = activeItems.filter(d => d.đơn === filters.đơn);
    if (filters.nhóm_cỡ) activeItems = activeItems.filter(d => d.nhóm_cỡ === filters.nhóm_cỡ);

    zone.locations.push({
      id: locId,
      displayId: locName,
      skus: activeItems.map(d => ({ id: d.mã }))
    });
  });

  return (
    <div className="mobile-wrapper">
      <Header status={syncStatus} onSync={fetchData} />
      
      <main className="content">
        {loading && <div className="loader">Kiểm tra kết nối...</div>}
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

        <MapGrid zones={dynamicZones} onLocationClick={handleLocationClick} />
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

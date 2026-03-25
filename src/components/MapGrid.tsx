"use client";

interface SKU {
  id: string;
}

interface Location {
  id: string;
  displayId?: string;
  skus: { id: string }[];
}

interface Zone {
  id: string;
  name: string;
  locations: Location[];
}

interface MapGridProps {
  zones: Zone[];
  onLocationClick: (locId: string) => void;
}

export default function MapGrid({ zones, onLocationClick }: MapGridProps) {
  return (
    <div className="map-grid">
      {zones.map((zone) => (
        <section key={zone.id} className="zone-section">
          <h2 className="zone-title">{zone.name}</h2>
          <div className="locations-container">
            {zone.locations.map((loc) => (
              <div 
                key={loc.id} 
                className={`location-card ${loc.skus.length > 0 ? 'active' : ''}`}
                onClick={() => onLocationClick(loc.id)}
              >
                <h3 className="location-id">{loc.displayId || loc.id}</h3>
                {loc.skus.length > 0 && (
                  <div className="sku-badges">
                    {loc.skus.slice(0, 6).map((sku, idx) => (
                      <div key={idx} className="sku-badge">{sku.id}</div>
                    ))}
                  </div>
                )}
              </div>

            ))}
          </div>
        </section>
      ))}

      <style jsx>{`
        .map-grid {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: calc(var(--nav-height) + 120px);
        }
        .zone-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .zone-title {
          font-size: 13px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding-left: 8px;
        }
        .locations-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 16px;
          background: var(--card-bg);
          border-radius: 24px;
          border: 1px solid rgba(0,0,0,0.03);
          box-shadow: var(--shadow-sm);
        }
        .location-card {
          background: var(--bg-input);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .location-card:active {
          transform: scale(0.96);
        }
        .location-id {
          font-size: 16px;
          font-weight: 800;
          color: var(--primary-blue);
          margin: 0;
        }
        .sku-badges {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .sku-badge {
          background: var(--secondary-blue);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 8px 4px;
          border-radius: 8px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}




// app/dashboard/components/MapBase.tsx
"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";

interface MapBaseProps {
  onRegionHover: (regionName: string | null) => void;
  onRegionClick: (regionName: string) => void;
  resetTrigger?: number; // TACTICAL SYNC: Added listener for the global reset
}

export default function MapBase({ onRegionHover, onRegionClick, resetTrigger = 0 }: MapBaseProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const regionLayersRef = useRef<{ [key: string]: any[] }>({});
  const currentHoveredRegionRef = useRef<string | null>(null);

  useEffect(() => {
    fetch("/maps/regions.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}: regions.json not found`);
        return res.json();
      })
      .then(setGeoData)
      .catch((err) => {
        console.error("Failed to load regions:", err);
        setFetchError(err.message);
      });
      
    return () => { regionLayersRef.current = {}; };
  }, []);

  const getRegionColor = (regionName: string) => {
    const hash = regionName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const tacticalColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4", "#84cc16", "#6366f1"];
    return tacticalColors[hash % tacticalColors.length];
  };

  const legendItems = useMemo(() => {
    if (!geoData || !geoData.features) return [];
    const regions = new Set<string>();
    geoData.features.forEach((f: any) => {
      if (f.properties && f.properties.parent_region) {
        regions.add(f.properties.parent_region);
      }
    });
    return Array.from(regions).sort().map(name => ({
      name,
      color: getRegionColor(name)
    }));
  }, [geoData]);

  const setGroupStyle = (regionName: string, style: any, bringToFront: boolean = false) => {
    const layers = regionLayersRef.current[regionName];
    if (layers) {
      layers.forEach(layer => {
        layer.setStyle(style);
        if (bringToFront && layer.bringToFront) {
          layer.bringToFront();
        }
      });
    }
  };

  const resetAllRegions = () => {
    Object.keys(regionLayersRef.current).forEach(name => {
      const baseColor = getRegionColor(name);
      setGroupStyle(name, { 
        weight: 1, 
        fillOpacity: 0.8, 
        color: "#1e293b", 
        fillColor: baseColor 
      }, false); 
    });
  };

  // RESET: Listen for the global refresh ping to wipe visual highlights
  useEffect(() => {
    if (resetTrigger > 0) {
      resetAllRegions();
      currentHoveredRegionRef.current = null;
    }
  }, [resetTrigger]);

  const onEachRegion = (feature: any, layer: any) => {
    const regionName = feature.properties.parent_region || "Unknown Region";

    if (!regionLayersRef.current[regionName]) {
      regionLayersRef.current[regionName] = [];
    }
    regionLayersRef.current[regionName].push(layer);

    const baseColor = getRegionColor(regionName);

    layer.on({
      mouseover: () => {
        if (currentHoveredRegionRef.current !== regionName) {
          resetAllRegions();
          setGroupStyle(regionName, { weight: 3, fillOpacity: 1, color: "#ffffff" }, true);
          onRegionHover(regionName);
          currentHoveredRegionRef.current = regionName;
        }
      },
      mouseout: (e: any) => {
        if (currentHoveredRegionRef.current === regionName) {
          const nextTarget = e.originalEvent.relatedTarget;
          if (!nextTarget || !nextTarget._path || !nextTarget._path.classList.contains('leaflet-interactive')) {
            resetAllRegions();
            onRegionHover(null);
            currentHoveredRegionRef.current = null;
          }
        }
      },
      click: () => {
        onRegionClick(regionName);
      }
    });

    layer.setStyle({
      fillColor: baseColor,
      weight: 1,
      opacity: 1,
      color: "#1e293b", 
      fillOpacity: 0.8,
    });
  };

  if (fetchError) return <div style={{ color: 'red', padding: '20px' }}>Error loading map: {fetchError}</div>;
  if (!geoData) return null;

  return (
    <>
      {/* DIRECT INJECTION: Guarantees Leaflet CSS loads independently of Next.js CSS bugs */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      
      <div style={{ position: 'relative', width: '100%', height: '800px', backgroundColor: '#0f172a' }}>
        <MapContainer 
          center={[12.2, 122.5]} 
          zoom={5.8}             
          zoomControl={false}    
          dragging={false} 
          scrollWheelZoom={false} 
          doubleClickZoom={false} 
          touchZoom={false} 
          keyboard={false}
          style={{ height: "800px", width: "100%", background: "#0f172a", zIndex: 1 }}
        >
          <GeoJSON data={geoData} onEachFeature={onEachRegion} />
        </MapContainer>

        {/* BOTTOM LEFT LEGEND - Expanded into a 2-Column Grid */}
        <div style={{ 
          position: 'absolute', 
          bottom: '24px', 
          left: '24px', 
          zIndex: 9999, 
          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
          border: '1px solid #334155', 
          padding: '16px', 
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          pointerEvents: 'auto'
        }}>
           <h4 style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '0.05em', borderBottom: '1px solid #334155', paddingBottom: '8px', textTransform: 'uppercase' }}>
             Sectors Legend:
           </h4>
           
           {/* Replaced Flex-Col with a 2-Column Grid */}
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '24px', rowGap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
              {legendItems.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '2px', backgroundColor: item.color, flexShrink: 0 }}></div> 
                  <span style={{ whiteSpace: 'nowrap' }}>{item.name}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </>
  );
}
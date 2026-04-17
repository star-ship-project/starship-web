// app/dashboard/MapLandingView.tsx
"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import RegionDetailsTable from './components/RegionDetailsTable';
import { 
  fetchRegionSummaries, 
  fetchRegionDetails, 
  toDatabaseRegion, 
  RegionSummary 
} from "@/lib/mapService";

const MapBase = dynamic(() => import('./components/MapBase'), { 
  ssr: false,
  loading: () => (
    <div style={{ height: '800px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#38bdf8' }}>
      ESTABLISHING SATELLITE UPLINK...
    </div>
  )
});

interface MapLandingViewProps {
  refreshTrigger?: number;
}

export default function MapLandingView({ refreshTrigger = 0 }: MapLandingViewProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<RegionSummary[]>([]);
  const [regionDetails, setRegionDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const [isMapRefreshing, setIsMapRefreshing] = useState(false);

  useEffect(() => {
    async function loadSummaries() {
      setIsMapRefreshing(true); 
      const data = await fetchRegionSummaries();
      setSummaryData(data);
      setIsMapRefreshing(false); 
    }
    
    if (refreshTrigger > 0) {
      setHoveredRegion(null);
      setSelectedRegion(null);
      setRegionDetails(null);
    }

    loadSummaries();
  }, [refreshTrigger]);

  const handleRegionClick = async (regionName: string) => {
    // 1. Instantly wipe old data to force the Loading Box to appear
    setSelectedRegion(regionName);
    setRegionDetails(null);
    setLoadingDetails(true);

    // 2. Instantly pan the camera down so the user can watch the extraction
    setTimeout(() => {
      document.getElementById('details-section')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 2500);

    // 3. TACTICAL DELAY: Force the 'Deep Extraction' sequence to remain visible for exactly 2 seconds
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 4. Fetch the fresh intelligence and remove the loading box
    const details = await fetchRegionDetails(regionName);
    setRegionDetails(details);
    setLoadingDetails(false);
  };

  const hoveredStats = hoveredRegion 
    ? summaryData.find(r => r.region === toDatabaseRegion(hoveredRegion)) 
    : null;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-950 p-4 space-y-6">
      
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '800px', 
        minHeight: '800px', 
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '0.75rem',
        overflow: 'hidden'
      }}>
        
        {isMapRefreshing && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto' 
          }}>
            <div className="animate-pulse" style={{ color: '#38bdf8', fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Pinging Supabase... Re-establishing Uplink
            </div>
          </div>
        )}

        <MapBase 
          onRegionHover={setHoveredRegion} 
          onRegionClick={handleRegionClick} 
          resetTrigger={refreshTrigger}
        />

        {hoveredRegion && (
          <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 9999, pointerEvents: 'none' }}>
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '2px solid rgba(14, 165, 233, 0.5)', padding: '20px', borderRadius: '8px', boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)', backdropFilter: 'blur(8px)', minWidth: '260px' }}>
              <div style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>Sector Identified</div>
              <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0' }}>{hoveredRegion}</h3>
              
              {hoveredStats ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Total Schools</span>
                    <span style={{ color: 'white', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '18px' }}>{hoveredStats.total_schools}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Enrollment</span>
                    <span style={{ color: '#7dd3fc', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '18px' }}>
                      {Number(hoveredStats.total_enrollment).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Active Teachers</span>
                    <span style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '18px' }}>{hoveredStats.total_teachers}</span>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#f59e0b', fontSize: '14px', fontStyle: 'italic', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="animate-pulse">●</span> No summary data available
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* TACTICAL LOCK: Added min-h-[400px] to prevent DOM collapse when swapping tables */}
      <div id="details-section" className="w-full min-h-[400px]">
        {loadingDetails ? (
          <div className="flex items-center justify-center p-20 bg-slate-900/50 rounded-xl border border-slate-800 h-full">
            <div className="text-sky-500 font-mono animate-pulse tracking-widest uppercase">
              Executing Deep Data Extraction...
            </div>
          </div>
        ) : selectedRegion && regionDetails ? (
          <RegionDetailsTable regionName={selectedRegion} data={regionDetails} />
        ) : (
          <div className="p-12 text-center bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
            <p className="text-slate-500 uppercase tracking-widest text-sm">Select a sector on the map to view granular personnel data</p>
          </div>
        )}
      </div>
    </div>
  );
}
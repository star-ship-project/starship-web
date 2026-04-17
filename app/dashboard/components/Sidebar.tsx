"use client";

import { useState } from "react";
import { ViewType } from "../types"; // Adjust path if types.ts is located elsewhere

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  // STATE UPDATE: Defaulted to true so the sidebar starts collapsed
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside 
      className="sidebar"
      style={{ 
        width: isCollapsed ? '100px' : '250px', 
        transition: 'width 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        backgroundColor: '#0f172a', // Added base dark theme to match your map
        borderRight: '1px solid #1e293b'
      }}
    >
      {/* Hamburger Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#cbd5e1', 
          fontSize: '32px', // ENLARGEMENT: Increased from 28px to 32px
          cursor: 'pointer',
          padding: '14px',
          textAlign: isCollapsed ? 'center' : 'left',
          marginBottom: '10px',
          transition: 'color 0.2s ease'
        }}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        ≡
      </button>

      {/* Navigation Buttons Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 8px' }}>
        <button
          className={`nav-btn ${activeView === "map" ? "active" : ""}`}
          onClick={() => setActiveView("map")}
          title="Map"
          style={{ 
            textAlign: isCollapsed ? 'center' : 'left', 
            padding: isCollapsed ? '12px 0' : '10px 16px',
            fontSize: isCollapsed ? '24px' : 'inherit' // ENLARGEMENT: Boosted icon size
          }}
        >
          {isCollapsed ? "🗺️" : "Map"}
        </button>
        
        <button
          className={`nav-btn ${activeView === "schools" ? "active" : ""}`}
          onClick={() => setActiveView("schools")}
          title="Schools"
          style={{ 
            textAlign: isCollapsed ? 'center' : 'left', 
            padding: isCollapsed ? '12px 0' : '10px 16px',
            fontSize: isCollapsed ? '24px' : 'inherit' // ENLARGEMENT: Boosted icon size
          }}
        >
          {isCollapsed ? "🏫" : "Schools"}
        </button>

        <button
          className={`nav-btn ${activeView === "teachers-bio" ? "active" : ""}`}
          onClick={() => setActiveView("teachers-bio")}
          title="Teacher Bios"
          style={{ 
            textAlign: isCollapsed ? 'center' : 'left', 
            padding: isCollapsed ? '12px 0' : '10px 16px',
            fontSize: isCollapsed ? '24px' : 'inherit' // ENLARGEMENT: Boosted icon size
          }}
        >
          {isCollapsed ? "👤" : "Teacher Bios"}
        </button>

        <button
          className={`nav-btn ${activeView === "teachers-professional" ? "active" : ""}`}
          onClick={() => setActiveView("teachers-professional")}
          title="Professional Data"
          style={{ 
            textAlign: isCollapsed ? 'center' : 'left', 
            padding: isCollapsed ? '12px 0' : '10px 16px',
            fontSize: isCollapsed ? '24px' : 'inherit' // ENLARGEMENT: Boosted icon size
          }}
        >
          {isCollapsed ? "💼" : "Professional Data"}
        </button>

        <button
          className={`nav-btn ${activeView === "qualifications" ? "active" : ""}`}
          onClick={() => setActiveView("qualifications")}
          title="Qualifications"
          style={{ 
            textAlign: isCollapsed ? 'center' : 'left', 
            padding: isCollapsed ? '12px 0' : '10px 16px',
            fontSize: isCollapsed ? '24px' : 'inherit' // ENLARGEMENT: Boosted icon size
          }}
        >
          {isCollapsed ? "🎓" : "Qualifications"}
        </button>

        <button
          className={`nav-btn ${activeView === "star-events" ? "active" : ""}`}
          onClick={() => setActiveView("star-events")}
          title="STAR Events"
          style={{ 
            textAlign: isCollapsed ? 'center' : 'left', 
            padding: isCollapsed ? '12px 0' : '10px 16px',
            fontSize: isCollapsed ? '24px' : 'inherit' // ENLARGEMENT: Boosted icon size
          }}
        >
          {isCollapsed ? "⭐" : "STAR Events"}
        </button>
      </div>
    </aside>
  );
}
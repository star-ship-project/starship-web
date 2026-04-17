"use client";

/**
 * UI
 * Receives triggers from page.tsx to initiate data refreshes 
 * or the cinematic system disconnect sequence.
 */

interface HeaderProps {
  onRefresh: () => void;
  onLogout: () => void; 
}

export default function Header({ onRefresh, onLogout }: HeaderProps) {
  return (
    <header className="top-banner">
      <div className="header-titles">
        <h1>STAR S.H.I.P</h1>
        <div className="sub-header">STAR SMS Hub for Information Processing</div>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        {/* Trigger global data fetch */}
        <button className="refresh-btn" onClick={onRefresh}>
          Refresh
        </button>
        
        {/* Trigger the 1.5s shutdown animation in page.tsx */}
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
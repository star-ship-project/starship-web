"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  onRefresh: () => void;
}

export default function Header({ onRefresh }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <header className="top-banner">
      <div className="header-titles">
        <h1>STAR S.H.I.P</h1>
        <div className="sub-header">STAR SMS Hub for Information Processing</div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="refresh-btn" onClick={onRefresh}>
          Refresh
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
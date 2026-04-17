"use client";

import { ViewType } from "../types"; // Adjust path if types.ts is located elsewhere

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button
        className={`nav-btn ${activeView === "map" ? "active" : ""}`}
        onClick={() => setActiveView("map")}
      >
        Map
      </button>
      <button
        className={`nav-btn ${activeView === "schools" ? "active" : ""}`}
        onClick={() => setActiveView("schools")}
      >
        Schools
      </button>
      <button
        className={`nav-btn ${activeView === "teachers-bio" ? "active" : ""}`}
        onClick={() => setActiveView("teachers-bio")}
      >
        Teacher Bios
      </button>
      <button
        className={`nav-btn ${activeView === "teachers-professional" ? "active" : ""}`}
        onClick={() => setActiveView("teachers-professional")}
      >
        Professional Data
      </button>
      <button
        className={`nav-btn ${activeView === "qualifications" ? "active" : ""}`}
        onClick={() => setActiveView("qualifications")}
      >
        Qualifications
      </button>
      <button
        className={`nav-btn ${activeView === "star-events" ? "active" : ""}`}
        onClick={() => setActiveView("star-events")}
      >
        STAR Events
      </button>
    </aside>
  );
}
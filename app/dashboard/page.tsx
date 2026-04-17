"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Tactical Router Injection
import { supabase } from "@/lib/db";
import { ViewType, School, TeacherBio, TeacherProfessional, Qualification, StarEvent } from "./types";

// UI Shell
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

// Views
import MapLandingView from "./MapLandingView";
import SchoolsTable from "./components/tables/SchoolsTable";
import TeacherBiosTable from "./components/tables/TeacherBiosTable";
import ProfessionalDataTable from "./components/tables/ProfessionalDataTable";
import QualificationsTable from "./components/tables/QualificationsTable";
import StarEventsTable from "./components/tables/StarEventsTable";

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>("map");
  const [schools, setSchools] = useState<School[]>([]);
  const [teachersBio, setTeachersBio] = useState<TeacherBio[]>([]);
  const [teachersProfessional, setTeachersProfessional] = useState<TeacherProfessional[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [starEvents, setStarEvents] = useState<StarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [mapRefreshTrigger, setMapRefreshTrigger] = useState(0);
  
  // 1. Tactical Logout State
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeView]);

  const fetchData = async () => {
    if (activeView === "map") {
      setMapRefreshTrigger(prev => prev + 1);
      return;
    }

    setLoading(true);
    try {
      if (activeView === "schools") {
        const { data, error } = await supabase.from('schools').select('*');
        if (!error) setSchools(data || []);
      } else if (activeView === "teachers-bio") {
        const { data, error } = await supabase.from('teachers_bio').select('*');
        if (!error) setTeachersBio(data || []);
      } else if (activeView === "teachers-professional") {
        const { data, error } = await supabase.from('teachers_professional').select('*, teachers_bio(first_name, last_name)');
        if (!error) {
          setTeachersProfessional((data || []).map((row: any) => ({
            teacher_name: `${row.teachers_bio?.first_name || ''} ${row.teachers_bio?.last_name || ''}`.trim(),
            years_experience: row.years_experience,
            teaching_level: row.teaching_level,
            role_position: row.role_position,
            specialization: row.specialization,
            is_internet_access: row.is_internet_access,
            device_count: row.device_count
          })));
        }
      } else if (activeView === "qualifications") {
        const { data, error } = await supabase.from('qualifications').select('*, teachers_bio(first_name, last_name)');
        if (!error) {
          setQualifications((data || []).map((row: any) => ({
            teacher_name: `${row.teachers_bio?.first_name || ''} ${row.teachers_bio?.last_name || ''}`.trim(),
            cert_name: row.cert_name,
            category: row.category,
            awarding_body: row.awarding_body,
            date_obtained: row.date_obtained
          })));
        }
      } else if (activeView === "star-events") {
        const { data, error } = await supabase.from('star_events').select('*, teachers_bio(first_name, last_name)');
        if (!error) {
          setStarEvents((data || []).map((row: any) => ({
            teacher_name: `${row.teachers_bio?.first_name || ''} ${row.teachers_bio?.last_name || ''}`.trim(),
            event_title: row.event_title,
            event_type: row.event_type,
            event_date: row.event_date
          })));
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setLoading(false);
  };

  // 2. The Tactical Disconnect Sequence
  const handleLogout = () => {
    setIsLoggingOut(true); 
    setTimeout(() => {
      router.push("/"); 
    }, 1500); 
  };

  const renderContent = () => {
    if (activeView === "map") {
      return (
        <div style={{ padding: "20px", height: "100%", width: "100%" }}>
          <MapLandingView refreshTrigger={mapRefreshTrigger} />
        </div>
      );
    } 

    if (loading) {
      return <div style={{ padding: "30px", color: "#94a3b8" }}>Loading data...</div>;
    }

    switch (activeView) {
      case "schools": return <SchoolsTable data={schools} />;
      case "teachers-bio": return <TeacherBiosTable data={teachersBio} />;
      case "teachers-professional": return <ProfessionalDataTable data={teachersProfessional} />;
      case "qualifications": return <QualificationsTable data={qualifications} />;
      case "star-events": return <StarEventsTable data={starEvents} />;
      default: return null;
    }
  };

  return (
    <>
      <div className="app-window" style={{ filter: isLoggingOut ? 'blur(4px)' : 'none', transition: 'filter 0.5s ease-in-out' }}>
        {/* 3. Pass the command down to the header */}
        <Header onRefresh={fetchData} onLogout={handleLogout} />
        <div className="app-body">
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
          <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
            {renderContent()}
          </main>
        </div>
      </div>

      {/* 4. The Full-Screen Shutdown HUD Overlay */}
      {isLoggingOut && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div className="animate-pulse" style={{ color: '#ef4444', fontSize: '28px', fontWeight: 'bold', letterSpacing: '0.3em' }}>
            SYSTEMS DISCONNECTING...
          </div>
          <div style={{ color: '#94a3b8', marginTop: '16px', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            Severing secure uplink to Starship Command
          </div>
          {/* Tactical Progress Bar */}
          <div style={{ width: '300px', height: '2px', backgroundColor: '#1e293b', marginTop: '30px', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: '#ef4444', transition: 'width 1.5s linear', width: '100%', animation: 'shrinkBar 1.5s linear forwards' }} />
          </div>
          <style>{`
            @keyframes shrinkBar {
              0% { width: 100%; }
              100% { width: 0%; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
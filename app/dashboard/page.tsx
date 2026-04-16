"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

type ViewType = "schools" | "teachers-bio" | "teachers-professional" | "qualifications" | "star-events";

interface School {
  school_id: string;
  name: string;
  region: string;
  division: string;
  total_enrollment: number;
}

interface TeacherBio {
  deped_id: string;
  school_id: string;
  first_name: string;
  last_name: string;
  sex: string;
  age: number;
  phone_number: string;
}

interface TeacherProfessional {
  teacher_name: string;
  years_experience: number;
  teaching_level: string;
  role_position: string;
  specialization: string;
  is_internet_access: number;
  device_count: number;
}

interface Qualification {
  teacher_name: string;
  cert_name: string;
  category: string;
  awarding_body: string;
  date_obtained: string;
}

interface StarEvent {
  teacher_name: string;
  event_title: string;
  event_type: string;
  event_date: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>("schools");
  const [schools, setSchools] = useState<School[]>([]);
  const [teachersBio, setTeachersBio] = useState<TeacherBio[]>([]);
  const [teachersProfessional, setTeachersProfessional] = useState<TeacherProfessional[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [starEvents, setStarEvents] = useState<StarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeView]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const cacheBust = `?t=${Date.now()}`;
      
      if (activeView === "schools") {
        const res = await fetch(`${baseUrl}/api/schools${cacheBust}`);
        const data = await res.json();
        setSchools(data);
      } else if (activeView === "teachers-bio") {
        const res = await fetch(`${baseUrl}/api/teachers-bio${cacheBust}`);
        const data = await res.json();
        setTeachersBio(data);
      } else if (activeView === "teachers-professional") {
        const res = await fetch(`${baseUrl}/api/teachers-professional${cacheBust}`);
        const data = await res.json();
        setTeachersProfessional(data);
      } else if (activeView === "qualifications") {
        const res = await fetch(`${baseUrl}/api/qualifications${cacheBust}`);
        const data = await res.json();
        setQualifications(data);
      } else if (activeView === "star-events") {
        const res = await fetch(`${baseUrl}/api/star-events${cacheBust}`);
        const data = await res.json();
        setStarEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    router.push("/");
  };

  const renderContent = () => {
    if (loading) {
      return <div style={{ padding: "30px", color: "#94a3b8" }}>Loading data...</div>;
    }

    switch (activeView) {
      case "schools":
        return (
          <div className="table-view">
            <h2 className="view-title">Schools</h2>
            <table>
              <thead>
                <tr>
                  <th>School ID</th>
                  <th>Name</th>
                  <th>Region</th>
                  <th>Division</th>
                  <th>Total Enrollment</th>
                </tr>
              </thead>
              <tbody>
                {schools.length === 0 ? (
                  <tr><td colSpan={5}>No data available</td></tr>
                ) : (
                  schools.map((item) => (
                    <tr key={item.school_id}>
                      <td>{item.school_id}</td>
                      <td>{item.name}</td>
                      <td>{item.region}</td>
                      <td>{item.division}</td>
                      <td>{item.total_enrollment}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case "teachers-bio":
        return (
          <div className="table-view">
            <h2 className="view-title">Teacher Bios</h2>
            <table>
              <thead>
                <tr>
                  <th>DepEd ID</th>
                  <th>School ID</th>
                  <th>Name</th>
                  <th>Sex</th>
                  <th>Age</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {teachersBio.length === 0 ? (
                  <tr><td colSpan={6}>No data available</td></tr>
                ) : (
                  teachersBio.map((item) => (
                    <tr key={item.deped_id}>
                      <td>{item.deped_id}</td>
                      <td>{item.school_id}</td>
                      <td>{item.first_name} {item.last_name}</td>
                      <td>{item.sex}</td>
                      <td>{item.age}</td>
                      <td>{item.phone_number}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case "teachers-professional":
        return (
          <div className="table-view">
            <h2 className="view-title">Professional Data</h2>
            <table>
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Years Experience</th>
                  <th>Teaching Level</th>
                  <th>Position</th>
                  <th>Specialization</th>
                  <th>Internet</th>
                  <th>Devices</th>
                </tr>
              </thead>
              <tbody>
                {teachersProfessional.length === 0 ? (
                  <tr><td colSpan={7}>No data available</td></tr>
                ) : (
                  teachersProfessional.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.teacher_name}</td>
                      <td>{item.years_experience}</td>
                      <td>{item.teaching_level}</td>
                      <td>{item.role_position}</td>
                      <td>{item.specialization}</td>
                      <td>{item.is_internet_access ? "Yes" : "No"}</td>
                      <td>{item.device_count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case "qualifications":
        return (
          <div className="table-view">
            <h2 className="view-title">Qualifications</h2>
            <table>
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Certificate Name</th>
                  <th>Category</th>
                  <th>Awarding Body</th>
                  <th>Date Obtained</th>
                </tr>
              </thead>
              <tbody>
                {qualifications.length === 0 ? (
                  <tr><td colSpan={5}>No data available</td></tr>
                ) : (
                  qualifications.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.teacher_name}</td>
                      <td>{item.cert_name}</td>
                      <td>{item.category}</td>
                      <td>{item.awarding_body}</td>
                      <td>{item.date_obtained}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case "star-events":
        return (
          <div className="table-view">
            <h2 className="view-title">STAR Events</h2>
            <table>
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Event Title</th>
                  <th>Event Type</th>
                  <th>Event Date</th>
                </tr>
              </thead>
              <tbody>
                {starEvents.length === 0 ? (
                  <tr><td colSpan={4}>No data available</td></tr>
                ) : (
                  starEvents.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.teacher_name}</td>
                      <td>{item.event_title}</td>
                      <td>{item.event_type}</td>
                      <td>{item.event_date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="app-window">
      <header className="top-banner">
        <div className="header-titles">
          <h1>STAR S.H.I.P</h1>
          <div className="sub-header">STAR SMS Hub for Information Processing</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="refresh-btn" onClick={() => fetchData()}>
            Refresh
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
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

        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
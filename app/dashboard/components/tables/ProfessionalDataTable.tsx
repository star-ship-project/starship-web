"use client";
import { TeacherProfessional } from "../../types";

export default function ProfessionalDataTable({ data }: { data: TeacherProfessional[] }) {
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
          {data.length === 0 ? (
            <tr><td colSpan={7}>No data available</td></tr>
          ) : (
            data.map((item, idx) => (
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
}
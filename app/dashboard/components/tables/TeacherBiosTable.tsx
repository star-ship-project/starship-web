"use client";
import { TeacherBio } from "../../types";

export default function TeacherBiosTable({ data }: { data: TeacherBio[] }) {
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
          {data.length === 0 ? (
            <tr><td colSpan={6}>No data available</td></tr>
          ) : (
            data.map((item) => (
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
}
"use client";
import { School } from "../../types";

export default function SchoolsTable({ data }: { data: School[] }) {
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
          {data.length === 0 ? (
            <tr><td colSpan={5}>No data available</td></tr>
          ) : (
            data.map((item) => (
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
}
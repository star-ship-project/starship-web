"use client";
import { Qualification } from "../../types";

export default function QualificationsTable({ data }: { data: Qualification[] }) {
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
          {data.length === 0 ? (
            <tr><td colSpan={5}>No data available</td></tr>
          ) : (
            data.map((item, idx) => (
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
}
"use client";
import { StarEvent } from "../../types";

export default function StarEventsTable({ data }: { data: StarEvent[] }) {
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
          {data.length === 0 ? (
            <tr><td colSpan={4}>No data available</td></tr>
          ) : (
            data.map((item, idx) => (
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
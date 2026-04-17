// app/dashboard/components/RegionDetailsTable.tsx
import React from 'react';
import { toFrontendRegion } from '@/lib/mapService';

interface Teacher {
  deped_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  sex: string;
  age: number;
}

interface SchoolData {
  name: string;
  total_enrollment: number;
  teachers_bio: Teacher[];
}

export default function RegionDetailsTable({ regionName, data }: { regionName: string, data: SchoolData[] }) {
  // Ensure the user always sees the Roman Numeral variant
  const displayTitle = toFrontendRegion(regionName);

  if (!data || data.length === 0) {
    return (
      <div className="mt-8 p-6 bg-slate-900 border border-red-900/30 rounded-lg text-red-400 italic">
        No active data records found for {displayTitle}. Please verify regional deployment.
      </div>
    );
  }

  return (
    <div className="mt-8 bg-slate-900 rounded-lg p-6 shadow-xl border border-slate-700">
      <div className="flex items-center justify-between mb-8 border-b border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-sky-400 tracking-wider uppercase">
          {displayTitle} Sector Data
        </h2>
      </div>

      <div className="space-y-8">
        {data.map((school, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 bg-slate-800 flex justify-between items-center border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">{school.name}</h3>
              <span className="bg-sky-500/20 text-sky-400 text-xs px-3 py-1 rounded-full font-mono">
                Enrollment: {school.total_enrollment}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs uppercase bg-slate-900/50 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Personnel Name</th>
                    <th className="px-4 py-3 font-semibold">Sex</th>
                    <th className="px-4 py-3 font-semibold">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {school.teachers_bio && school.teachers_bio.length > 0 ? (
                    school.teachers_bio.map((teacher, tIdx) => (
                      <tr key={tIdx} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-4 font-mono text-xs">{teacher.deped_id}</td>
                        <td className="px-4 py-4 text-white font-medium">
                          {`${teacher.first_name} ${teacher.middle_name ? teacher.middle_name + ' ' : ''}${teacher.last_name}`}
                        </td>
                        <td className="px-4 py-4">{teacher.sex}</td>
                        <td className="px-4 py-4">{teacher.age}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center italic text-slate-500 bg-slate-900/30">
                        No personnel bios associated with this facility.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
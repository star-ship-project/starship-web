// lib/mapService.ts
import { supabase } from './db';

export interface RegionSummary {
  region: string;
  total_schools: number;
  total_enrollment: number;
  total_teachers: number;
}

/**
 * TACTICAL NORMALIZATION MAP
 */
const regionMap: { [key: string]: string } = {
  'Region I': 'Region 1',
  'Region II': 'Region 2',
  'Region III': 'Region 3',
  'Region IV-A': 'Region 4A',
  'MIMAROPA': 'Region 4B',
  'Region V': 'Region 5',
  'Region VI': 'Region 6',
  'Region VII': 'Region 7',
  'Region VIII': 'Region 8',
  'Region IX': 'Region 9',
  'Region X': 'Region 10',
  'Region XI': 'Region 11',
  'Region XII': 'Region 12',
  'Region XIII': 'Region 13',
  'NCR': 'NCR',
  'CAR': 'CAR',
  'BARMM': 'BARMM'
};

// Create reverse mapping for UI display
const reverseRegionMap = Object.fromEntries(
  Object.entries(regionMap).map(([k, v]) => [v, k])
);

export const toDatabaseRegion = (name: string): string => {
  return regionMap[name.trim()] || name;
};

export const toFrontendRegion = (name: string): string => {
  return reverseRegionMap[name.trim()] || name;
};

export const fetchRegionSummaries = async (): Promise<RegionSummary[]> => {
  const { data, error } = await supabase.from('region_summary').select('*');
  if (error) {
    console.error("Error fetching region summaries:", error);
    return [];
  }
  return data || [];
};

export const fetchRegionDetails = async (regionName: string) => {
  const dbName = toDatabaseRegion(regionName);
  console.log(`[STARSHIP DB] Querying for normalized region: ${dbName}`);

  const { data, error } = await supabase
    .from('schools')
    .select(`
      name,
      total_enrollment,
      teachers_bio (
        deped_id,
        first_name,
        middle_name,
        last_name,
        sex,
        age
      )
    `)
    .eq('region', dbName);

  if (error) {
    console.error(`Error fetching details for ${dbName}:`, error);
    return null;
  }
  return data;
};
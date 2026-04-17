import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_STARSHIP_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_STARSHIP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getUserByPhone(phone: string) {
  const { data, error } = await supabase
    .from('teachers_bio')
    .select('step, errors, deped_id, school_id, first_name, middle_name, last_name, suffix_name, sex, age, phone_number')
    .eq('phone_number', phone)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createUser(phone: string) {
  const tempId = `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const { data, error } = await supabase
    .from('teachers_bio')
    .insert({ deped_id: tempId, phone_number: phone, step: 1, errors: 0 })
    .select('deped_id')
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateBioByPhone(phone: string, field: string, value: string | null, nextStep: number) {
  const allowedFields = ['deped_id', 'school_id', 'first_name', 'middle_name', 'last_name', 'suffix_name', 'sex', 'age'];
  if (!allowedFields.includes(field)) throw new Error(`Invalid field: ${field}`);
  
  const updateData: any = { [field]: value, step: nextStep, errors: 0 };
  
  const { error } = await supabase
    .from('teachers_bio')
    .update(updateData)
    .eq('phone_number', phone);
  
  if (error) throw error;
}

export async function createProfessionalRecord(depedId: string) {
  const { error } = await supabase
    .from('teachers_professional')
    .insert({ teacher_id: depedId });
  
  if (error) throw error;
}

export async function updateProfessional(depedId: string, field: string, value: any) {
  const allowedFields = ['years_experience', 'teaching_level', 'role_position', 'specialization', 'is_internet_access', 'device_count'];
  if (!allowedFields.includes(field)) throw new Error(`Invalid field: ${field}`);
  
  const { error } = await supabase
    .from('teachers_professional')
    .update({ [field]: value })
    .eq('teacher_id', depedId);
  
  if (error) throw error;
}

export async function getProfessionalById(teacherId: string) {
  const { data, error } = await supabase
    .from('teachers_professional')
    .select('*')
    .eq('teacher_id', teacherId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function updateStep(depedId: string, step: number) {
  const { error } = await supabase
    .from('teachers_bio')
    .update({ step, errors: 0 })
    .eq('deped_id', depedId);
  
  if (error) throw error;
}

export async function incrementError(depedId: string) {
  const { data: current, error: fetchError } = await supabase
    .from('teachers_bio')
    .select('errors')
    .eq('deped_id', depedId)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
  
  const newErrors = (current?.errors || 0) + 1;
  
  const { error } = await supabase
    .from('teachers_bio')
    .update({ errors: newErrors })
    .eq('deped_id', depedId);
  
  if (error) throw error;
}

export async function getAllSchools() {
  const { data, error } = await supabase.from('schools').select('*', { count: 'exact' });
  if (error) throw error;
  return data || [];
}

export async function getAllTeachersBio() {
  const { data, error } = await supabase.from('teachers_bio').select('*');
  if (error) throw error;
  return data || [];
}

export async function getAllTeachersProfessional() {
  const { data, error } = await supabase
    .from('teachers_professional')
    .select('*, teachers_bio(first_name, last_name)');
  
  if (error) throw error;
  
  return (data || []).map((row: any) => ({
    teacher_name: `${row.teachers_bio?.first_name || ''} ${row.teachers_bio?.last_name || ''}`.trim(),
    years_experience: row.years_experience,
    teaching_level: row.teaching_level,
    role_position: row.role_position,
    specialization: row.specialization,
    is_internet_access: row.is_internet_access,
    device_count: row.device_count
  }));
}

export async function getAllQualifications() {
  const { data, error } = await supabase
    .from('qualifications')
    .select('*, teachers_bio(first_name, last_name)');
  
  if (error) throw error;
  
  return (data || []).map((row: any) => ({
    teacher_name: `${row.teachers_bio?.first_name || ''} ${row.teachers_bio?.last_name || ''}`.trim(),
    cert_name: row.cert_name,
    category: row.category,
    awarding_body: row.awarding_body,
    date_obtained: row.date_obtained
  }));
}

export async function getAllStarEvents() {
  const { data, error } = await supabase
    .from('star_events')
    .select('*, teachers_bio(first_name, last_name)');
  
  if (error) throw error;
  
  return (data || []).map((row: any) => ({
    teacher_name: `${row.teachers_bio?.first_name || ''} ${row.teachers_bio?.last_name || ''}`.trim(),
    event_title: row.event_title,
    event_type: row.event_type,
    event_date: row.event_date
  }));
}
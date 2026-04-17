# Local Development Setup

## Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

## Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the project root with the following:

```env
# Supabase (required)
NEXT_PUBLIC_STARSHIP_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_STARSHIP_SUPABASE_ANON_KEY=your_supabase_anon_key

# HTTP SMS API (optional - for SMS functionality)
HTTPSMS_API_KEY=your_httpsms_api_key
FROM_NUMBER=+1234567890
```

**Getting Supabase credentials:**
1. Go to [Supabase](https://supabase.com) and open your project
2. Go to **Settings** → **API**
3. Copy the **Project URL** and **anon public** key

**Getting HTTP SMS credentials:**
1. Sign up at [httpsms.com](https://httpsms.com)
2. Get your API key from the dashboard
3. Get a phone number for `FROM_NUMBER`

### 3. Supabase Database Setup

Run the following SQL in your Supabase **SQL Editor** to create the required tables:

```sql
-- Teachers Bio table
CREATE TABLE IF NOT EXISTS teachers_bio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deped_id TEXT UNIQUE,
  school_id TEXT,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  suffix_name TEXT,
  sex TEXT,
  age TEXT,
  phone_number TEXT UNIQUE,
  step INTEGER DEFAULT 1,
  errors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teachers Professional table
CREATE TABLE IF NOT EXISTS teachers_professional (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id TEXT REFERENCES teachers_bio(deped_id),
  years_experience TEXT,
  teaching_level TEXT,
  role_position TEXT,
  specialization TEXT,
  is_internet_access TEXT,
  device_count TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Qualifications table
CREATE TABLE IF NOT EXISTS qualifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id TEXT REFERENCES teachers_bio(deped_id),
  cert_name TEXT,
  category TEXT,
  awarding_body TEXT,
  date_obtained TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Star Events table
CREATE TABLE IF NOT EXISTS star_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id TEXT REFERENCES teachers_bio(deped_id),
  event_title TEXT,
  event_type TEXT,
  event_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_name TEXT,
  school_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (optional - disable for local dev)
ALTER TABLE teachers_bio ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers_professional ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (remove in production)
CREATE POLICY "Allow all access" ON teachers_bio FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON teachers_professional FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON qualifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON star_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON schools FOR ALL USING (true) WITH CHECK (true);
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Production Deployment

The easiest way to deploy is with [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Set the same environment variables in your Vercel project settings under **Environment Variables**.

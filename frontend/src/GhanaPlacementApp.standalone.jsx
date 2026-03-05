/**
 * ============================================================
 *  GHANA SCHOOLS PLACEMENT SYSTEM
 *  Full-stack React app with Supabase backend integration
 *  Schools sourced from shsselect.com/directory/schools
 * ============================================================
 *
 *  SUPABASE SETUP INSTRUCTIONS
 *  ─────────────────────────────────────────────────────────
 *  1. Go to https://supabase.com and create a free project
 *  2. In your project dashboard → SQL Editor, run this schema:
 *
 *  -- Students table
 *  CREATE TABLE students (
 *    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *    full_name TEXT NOT NULL,
 *    index_number TEXT UNIQUE NOT NULL,
 *    gender TEXT CHECK (gender IN ('Male','Female')) NOT NULL,
 *    dob DATE NOT NULL,
 *    parent_contact TEXT NOT NULL,
 *    photo_url TEXT,
 *    created_at TIMESTAMPTZ DEFAULT now()
 *  );
 *
 *  -- Scores table
 *  CREATE TABLE scores (
 *    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
 *    subject TEXT NOT NULL,
 *    score INTEGER CHECK (score >= 0 AND score <= 100),
 *    updated_at TIMESTAMPTZ DEFAULT now(),
 *    UNIQUE (student_id, subject)
 *  );
 *
 *  -- Selections table
 *  CREATE TABLE selections (
 *    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *    student_id UUID REFERENCES students(id) ON DELETE CASCADE UNIQUE,
 *    choices JSONB NOT NULL DEFAULT '[]',
 *    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
 *    reason TEXT,
 *    submitted_at TIMESTAMPTZ DEFAULT now(),
 *    reviewed_at TIMESTAMPTZ
 *  );
 *
 *  -- Notifications table
 *  CREATE TABLE notifications (
 *    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *    message TEXT NOT NULL,
 *    read BOOLEAN DEFAULT false,
 *    created_at TIMESTAMPTZ DEFAULT now()
 *  );
 *
 *  -- Enable Row Level Security (optional for MVP, disable for testing)
 *  -- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
 *
 *  3. Go to Settings → API and copy:
 *     - Project URL
 *     - anon/public key
 *
 *  4. Replace SUPABASE_URL and SUPABASE_ANON_KEY below with your values
 *
 *  5. Install supabase-js:  npm install @supabase/supabase-js
 *
 *  6. For photo uploads, create a storage bucket named "student-photos"
 *     in Storage → New bucket → set to public
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { ChartBarIcon, PencilSquareIcon, UsersIcon, BuildingLibraryIcon, AcademicCapIcon, ClipboardDocumentCheckIcon, ClockIcon, ChartPieIcon, UserCircleIcon, CheckCircleIcon, XCircleIcon, StarIcon, ThumbUpIcon, BookOpenIcon, ExclamationTriangleIcon, UserPlusIcon, CameraIcon, MapPinIcon, InboxIcon, CheckBadgeIcon, ArrowRightIcon, ArrowLeftIcon, Bars3Icon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
// Replace these with your actual Supabase credentials
const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// Minimal Supabase client (no extra package needed for demo)
const supabase = {
  _url: SUPABASE_URL,
  _key: SUPABASE_ANON_KEY,
  _headers() {
    return { "apikey": this._key, "Authorization": `Bearer ${this._key}`, "Content-Type": "application/json", "Prefer": "return=representation" };
  },
  async select(table, query = "") {
    const r = await fetch(`${this._url}/rest/v1/${table}${query}`, { headers: this._headers() });
    return r.json();
  },
  async insert(table, data) {
    const r = await fetch(`${this._url}/rest/v1/${table}`, { method:"POST", headers: this._headers(), body: JSON.stringify(data) });
    return r.json();
  },
  async update(table, data, match) {
    const q = Object.entries(match).map(([k,v])=>`${k}=eq.${v}`).join("&");
    const r = await fetch(`${this._url}/rest/v1/${table}?${q}`, { method:"PATCH", headers: this._headers(), body: JSON.stringify(data) });
    return r.json();
  },
  async upsert(table, data, conflict) {
    const headers = { ...this._headers(), "Prefer": `resolution=merge-duplicates,return=representation`, "on_conflict": conflict };
    const r = await fetch(`${this._url}/rest/v1/${table}`, { method:"POST", headers, body: JSON.stringify(data) });
    return r.json();
  },
  async uploadPhoto(bucket, path, file) {
    const r = await fetch(`${this._url}/storage/v1/object/${bucket}/${path}`, {
      method:"POST", headers: { "apikey": this._key, "Authorization": `Bearer ${this._key}`, "Content-Type": file.type },
      body: file
    });
    if (r.ok) return `${this._url}/storage/v1/object/public/${bucket}/${path}`;
    return null;
  }
};

// Demo mode flag – set to true to use local state instead of Supabase
const DEMO_MODE = true; // Change to false when Supabase is configured

// ─── REAL SCHOOLS DATA (from shsselect.com) ───────────────────────────────────
const ALL_SCHOOLS = [
  // ── Category A ──
  {id:1,name:"Abetifi Kyemase Technical Institute",category:"A",region:"Eastern"},
  {id:2,name:"Abomosu STEM Senior High",category:"A",region:"Eastern"},
  {id:3,name:"Aburi Girls' Senior High",category:"A",region:"Eastern"},
  {id:4,name:"Accra Academy",category:"A",region:"Greater Accra"},
  {id:5,name:"Accra Girls Senior High",category:"A",region:"Greater Accra"},
  {id:6,name:"Accra Tech. Trg. Centre",category:"A",region:"Greater Accra"},
  {id:7,name:"Achimota Senior High",category:"A",region:"Greater Accra"},
  {id:8,name:"Ada Tech. Inst.",category:"A",region:"Greater Accra"},
  {id:9,name:"Adako Jachie Technical Institute",category:"A",region:"Ashanti"},
  {id:10,name:"Adisadel College",category:"A",region:"Central"},
  {id:11,name:"Akwatia Tech. Inst.",category:"A",region:"Eastern"},
  {id:12,name:"Anlo Tech. Inst.",category:"A",region:"Volta"},
  {id:13,name:"Archbishop Porter Girls Snr. High",category:"A",region:"Western"},
  {id:14,name:"Assin Foso Technical Institute",category:"A",region:"Central"},
  {id:15,name:"Asuansi Tech. Inst.",category:"A",region:"Central"},
  {id:16,name:"Awaso STEM Senior High",category:"A",region:"Western North"},
  {id:17,name:"Bawku Tech. Inst.",category:"A",region:"Upper East"},
  {id:18,name:"Berekum Presby Senior High",category:"A",region:"Bono"},
  {id:19,name:"Biriwa Technical Institute",category:"A",region:"Central"},
  {id:20,name:"Bishop Herman College",category:"A",region:"Volta"},
  {id:21,name:"Bolga Girls Senior High",category:"A",region:"Upper East"},
  {id:22,name:"Bolga Tech. Inst.",category:"A",region:"Upper East"},
  {id:23,name:"Bolgatanga Senior High",category:"A",region:"Upper East"},
  {id:24,name:"Bosomtwe Girls STEM Senior High",category:"A",region:"Ashanti"},
  {id:25,name:"Bosomtwe STEM Academy",category:"A",region:"Ashanti"},
  {id:26,name:"Cape Coast Tech. Inst.",category:"A",region:"Central"},
  {id:27,name:"Dabokpa Voc/Tech. Inst.",category:"A",region:"Northern"},
  {id:28,name:"Dormaa Technical Institute",category:"A",region:"Bono"},
  {id:29,name:"East Legon Applied Technology Institute",category:"A",region:"Greater Accra"},
  {id:30,name:"Fijai Senior High",category:"A",region:"Western"},
  {id:31,name:"Ghana Senior High School, Tamale",category:"A",region:"Northern"},
  {id:32,name:"Ghana Senior High, Koforidua",category:"A",region:"Eastern"},
  {id:33,name:"Ghana Senior High/Tech",category:"A",region:"Western"},
  {id:34,name:"Holy Child School, Cape Coast",category:"A",region:"Central"},
  {id:35,name:"Kibi Technical Institute",category:"A",region:"Eastern"},
  {id:36,name:"Kikam Tech. Inst.",category:"A",region:"Western"},
  {id:37,name:"Koforidua Senior High/Tech",category:"A",region:"Eastern"},
  {id:38,name:"Koforidua Tech. Inst.",category:"A",region:"Eastern"},
  {id:39,name:"Konongo Odumase Senior High",category:"A",region:"Ashanti"},
  {id:40,name:"Kpando Tech. Inst.",category:"A",region:"Volta"},
  {id:41,name:"Kpasenpke STEM Senior High",category:"A",region:"North East"},
  {id:42,name:"Krobo Girls' Presby Senior High",category:"A",region:"Eastern"},
  {id:43,name:"Kumasi High School",category:"A",region:"Ashanti"},
  {id:44,name:"Kumasi Tech. Inst.",category:"A",region:"Ashanti"},
  {id:45,name:"Lawra Senior High",category:"A",region:"Upper West"},
  {id:46,name:"Madina Technical Institute",category:"A",region:"Greater Accra"},
  {id:47,name:"Mawuli School, Ho",category:"A",region:"Volta"},
  {id:48,name:"Mfantsiman Girls' Senior High",category:"A",region:"Central"},
  {id:49,name:"Mfantsipim School",category:"A",region:"Central"},
  {id:50,name:"Nandom Senior High",category:"A",region:"Upper West"},
  {id:51,name:"Navrongo Senior High",category:"A",region:"Upper East"},
  {id:52,name:"New Century Technical Institute",category:"A",region:"Greater Accra"},
  {id:53,name:"Nkoranza Tech Inst.",category:"A",region:"Bono East"},
  {id:54,name:"Notre Dame Girls Senior High, Sunyani",category:"A",region:"Bono"},
  {id:55,name:"Notre Dame Sem/Senior High, Navrongo",category:"A",region:"Upper East"},
  {id:56,name:"OLA Girls Senior High, Ho",category:"A",region:"Volta"},
  {id:57,name:"OLA Girls Senior High, Kenyasi",category:"A",region:"Ahafo"},
  {id:58,name:"Ofori Panin Senior High",category:"A",region:"Eastern"},
  {id:59,name:"Okuapeman Senior High",category:"A",region:"Eastern"},
  {id:60,name:"Opoku Ware School",category:"A",region:"Ashanti"},
  {id:61,name:"Our Lady of Providence Senior High",category:"A",region:"Bono"},
  {id:62,name:"Panfokrom Technical Institute",category:"A",region:"Central"},
  {id:63,name:"Pilot Technical Institute",category:"A",region:"Greater Accra"},
  {id:64,name:"Pope John Snr. High & Min. Sem., Koforidua",category:"A",region:"Eastern"},
  {id:65,name:"Prempeh College",category:"A",region:"Ashanti"},
  {id:66,name:"Presby Boys' Senior High, Legon",category:"A",region:"Greater Accra"},
  {id:67,name:"Sekondi College",category:"A",region:"Western"},
  {id:68,name:"Serwaa Kesse Girls Senior High",category:"A",region:"Ahafo"},
  {id:69,name:"St. Augustine's College, Cape Coast",category:"A",region:"Central"},
  {id:70,name:"St. Charles Senior High, Tamale",category:"A",region:"Northern"},
  {id:71,name:"St. Francis Girls Senior High, Jirapa",category:"A",region:"Upper West"},
  {id:72,name:"St. James Sem & Senior High, Abesim",category:"A",region:"Bono"},
  {id:73,name:"St. John's Senior High, Sekondi",category:"A",region:"Western"},
  {id:74,name:"St. Louis Senior High, Kumasi",category:"A",region:"Ashanti"},
  {id:75,name:"St. Mary's Senior High, Korle Gonno",category:"A",region:"Greater Accra"},
  {id:76,name:"St. Mary's Technical Institute, Asamankese",category:"A",region:"Eastern"},
  {id:77,name:"St. Paul's Tech. Inst.",category:"A",region:"Eastern"},
  {id:78,name:"St. Peter's Senior High, Nkwatia",category:"A",region:"Eastern"},
  {id:79,name:"St. Rose's Senior High, Akwatia",category:"A",region:"Eastern"},
  {id:80,name:"St. Thomas Aquinas Senior High, Cantonments",category:"A",region:"Greater Accra"},
  {id:81,name:"Suame Technical Institute",category:"A",region:"Ashanti"},
  {id:82,name:"Sunyani Senior High",category:"A",region:"Bono"},
  {id:83,name:"T. I. Ahmadiyya Senior High, Kumasi",category:"A",region:"Ashanti"},
  {id:84,name:"Takoradi Tech. Inst.",category:"A",region:"Western"},
  {id:85,name:"Tamale Senior High",category:"A",region:"Northern"},
  {id:86,name:"Tema Mission Technical Institute",category:"A",region:"Greater Accra"},
  {id:87,name:"Tema Senior High",category:"A",region:"Greater Accra"},
  {id:88,name:"Tema Tech. Inst.",category:"A",region:"Greater Accra"},
  {id:89,name:"Wa Tech. Inst.",category:"A",region:"Upper West"},
  {id:90,name:"Wesley Girls' High School, Cape Coast",category:"A",region:"Central"},
  {id:91,name:"Winneba Technical Institute",category:"A",region:"Central"},
  {id:92,name:"Yaa Asantewaa Girls Senior High",category:"A",region:"Ashanti"},
  {id:93,name:"Yamfo Technical Institute",category:"A",region:"Ahafo"},
  // ── Category B ──
  {id:101,name:"Abetifi Presby Senior High",category:"B",region:"Eastern"},
  {id:102,name:"Abetifi Tech. Inst.",category:"B",region:"Eastern"},
  {id:103,name:"Abuakwa State College",category:"B",region:"Eastern"},
  {id:104,name:"Abutia Senior High/Technical",category:"B",region:"Volta"},
  {id:105,name:"Academy of Christ the King",category:"B",region:"Central"},
  {id:106,name:"Accra STEM Academy",category:"B",region:"Greater Accra"},
  {id:107,name:"Accra Senior High",category:"B",region:"Greater Accra"},
  {id:108,name:"Acherensua Senior High",category:"B",region:"Ahafo"},
  {id:109,name:"Achiase Senior High",category:"B",region:"Eastern"},
  {id:110,name:"Ada Senior High",category:"B",region:"Greater Accra"},
  {id:111,name:"Adankwaman Senior High",category:"B",region:"Central"},
  {id:112,name:"Adiembra Senior High",category:"B",region:"Western"},
  {id:113,name:"Adonten Senior High",category:"B",region:"Eastern"},
  {id:114,name:"Aduman Senior High",category:"B",region:"Ashanti"},
  {id:115,name:"Adventist Senior High, Kumasi",category:"B",region:"Ashanti"},
  {id:116,name:"Afienya Technical Institute",category:"B",region:"Greater Accra"},
  {id:117,name:"Afua Kobi Ampem Girls' Senior High",category:"B",region:"Ashanti"},
  {id:118,name:"Aggrey Mem. A.M.E.Zion Snr. High",category:"B",region:"Central"},
  {id:119,name:"Agona Senior High/Tech",category:"B",region:"Ashanti"},
  {id:120,name:"Agona Swedru Technical Institute",category:"B",region:"Central"},
  {id:121,name:"Ahafoman Senior High/Tech",category:"B",region:"Ahafo"},
  {id:122,name:"Ahantaman Girls' Senior High",category:"B",region:"Western"},
  {id:123,name:"Akim Swedru Senior High",category:"B",region:"Eastern"},
  {id:124,name:"Akontombra Senior High",category:"B",region:"Western North"},
  {id:125,name:"Akrofuom Senior High/Tech",category:"B",region:"Ashanti"},
  {id:126,name:"Akumfi Ameyaw Senior High/Tech.",category:"B",region:"Bono East"},
  {id:127,name:"Akwamuman Senior High",category:"B",region:"Eastern"},
  {id:128,name:"Al-Azariya Islamic Snr. High, Kumasi",category:"B",region:"Ashanti"},
  {id:129,name:"Amanten Senior High",category:"B",region:"Bono East"},
  {id:130,name:"Amenfiman Senior High",category:"B",region:"Western"},
  {id:131,name:"Anglican Senior High, Kumasi",category:"B",region:"Ashanti"},
  {id:132,name:"Anlo Senior High",category:"B",region:"Volta"},
  {id:133,name:"Anum Presby Technical Institute",category:"B",region:"Eastern"},
  {id:134,name:"Apam Senior High",category:"B",region:"Central"},
  {id:135,name:"Armed Forces Senior High/Tech, Kumasi",category:"B",region:"Ashanti"},
  {id:136,name:"Asamankese Senior High",category:"B",region:"Eastern"},
  {id:137,name:"Asanteman Senior High",category:"B",region:"Ashanti"},
  {id:138,name:"Asare Bediako Senior High",category:"B",region:"Ashanti"},
  {id:139,name:"Asawinso Senior High",category:"B",region:"Western North"},
  {id:140,name:"Attafuah Senior High/Tech",category:"B",region:"Eastern"},
  {id:141,name:"Awudome Senior High",category:"B",region:"Volta"},
  {id:142,name:"Awutu Winton Senior High",category:"B",region:"Central"},
  {id:143,name:"Axim Technical Institute",category:"B",region:"Western"},
  {id:144,name:"Badu Senior High/Tech.",category:"B",region:"Bono"},
  {id:145,name:"Bawku Senior High",category:"B",region:"Upper East"},
  {id:146,name:"Bechem Presby Senior High",category:"B",region:"Ahafo"},
  {id:147,name:"Benkum Senior High",category:"B",region:"Eastern"},
  {id:148,name:"Berekum Senior High",category:"B",region:"Bono"},
  {id:149,name:"Bia Senior High/Tech",category:"B",region:"Western North"},
  {id:150,name:"Boa-Amponsem Senior High",category:"B",region:"Central"},
  {id:151,name:"Breman Asikuma Senior High",category:"B",region:"Central"},
  {id:152,name:"Charlotte Dolphyne Technical Institute",category:"B",region:"Western"},
  {id:153,name:"Chemu Senior High/Tech",category:"B",region:"Greater Accra"},
  {id:154,name:"Chiraa Senior High",category:"B",region:"Bono"},
  {id:155,name:"Christ the King Cath., Obuasi",category:"B",region:"Ashanti"},
  {id:156,name:"Collins Senior High/Commercial, Agogo",category:"B",region:"Ashanti"},
  {id:157,name:"Daboase Senior High/Tech",category:"B",region:"Western"},
  {id:158,name:"Dormaa Senior High",category:"B",region:"Bono"},
  {id:159,name:"Drobo Senior High",category:"B",region:"Bono"},
  {id:160,name:"Dwamena Akenten Senior High",category:"B",region:"Ashanti"},
  {id:161,name:"E.P.C. Mawuko Girls Senior High",category:"B",region:"Volta"},
  {id:162,name:"Edinaman Senior High",category:"B",region:"Central"},
  {id:163,name:"Ejisu Senior High/Tech",category:"B",region:"Ashanti"},
  {id:164,name:"Ekumfi T. I. Ahmadiiyya SHTS",category:"B",region:"Central"},
  {id:165,name:"Esiama Senior High/Tech",category:"B",region:"Western"},
  {id:166,name:"Forces Senior High/Tech, Burma Camp",category:"B",region:"Greater Accra"},
  {id:167,name:"Ghana Muslim Mission Senior High",category:"B",region:"Ashanti"},
  {id:168,name:"Ghana National College",category:"B",region:"Central"},
  {id:169,name:"Ghanata Senior High",category:"B",region:"Greater Accra"},
  {id:170,name:"Government Technical Institute",category:"B",region:"Greater Accra"},
  {id:171,name:"Half Assini Senior High",category:"B",region:"Western"},
  {id:172,name:"Hwidiem Senior High",category:"B",region:"Ahafo"},
  {id:173,name:"Jachie Pramso Senior High",category:"B",region:"Ashanti"},
  {id:174,name:"Jacobu Senior High/Tech.",category:"B",region:"Ashanti"},
  {id:175,name:"Juaben Senior High",category:"B",region:"Ashanti"},
  {id:176,name:"KNUST Senior High",category:"B",region:"Ashanti"},
  {id:177,name:"Kalpohin Senior High",category:"B",region:"Northern"},
  {id:178,name:"Kanton Senior High",category:"B",region:"Upper West"},
  {id:179,name:"Keta Senior High/Tech",category:"B",region:"Volta"},
  {id:180,name:"Kibi Senior High/Tech",category:"B",region:"Eastern"},
  {id:181,name:"Kpando Senior High",category:"B",region:"Volta"},
  {id:182,name:"Kumasi Academy",category:"B",region:"Ashanti"},
  {id:183,name:"Kumasi Girls Senior High",category:"B",region:"Ashanti"},
  {id:184,name:"Kumasi Wesley Girls High School",category:"B",region:"Ashanti"},
  {id:185,name:"Kusanaba Technical Institute",category:"B",region:"Upper East"},
  {id:186,name:"Kwahu Ridge Senior High",category:"B",region:"Eastern"},
  {id:187,name:"Labone Senior High",category:"B",region:"Greater Accra"},
  {id:188,name:"Lassie-Tuolu Senior High",category:"B",region:"Upper West"},
  {id:189,name:"Manya Krobo Senior High",category:"B",region:"Eastern"},
  {id:190,name:"Methodist Girls Senior High, Mamfe",category:"B",region:"Eastern"},
  {id:191,name:"Methodist High School, Saltpond",category:"B",region:"Central"},
  {id:192,name:"Mim Senior High",category:"B",region:"Ahafo"},
  {id:193,name:"Mpraeso Senior High",category:"B",region:"Eastern"},
  {id:194,name:"Nafana Senior High",category:"B",region:"Bono"},
  {id:195,name:"New Edubiase Senior High",category:"B",region:"Ashanti"},
  {id:196,name:"New Juaben Senior High/Com",category:"B",region:"Eastern"},
  {id:197,name:"Nkawkaw Senior High",category:"B",region:"Eastern"},
  {id:198,name:"Nkoranza Senior High/Tech",category:"B",region:"Bono East"},
  {id:199,name:"Nungua Senior High",category:"B",region:"Greater Accra"},
  {id:200,name:"Oda Senior High",category:"B",region:"Eastern"},
  {id:201,name:"Odorgonno Senior High",category:"B",region:"Greater Accra"},
  {id:202,name:"Ofoase Kokoben Senior High",category:"B",region:"Ashanti"},
  {id:203,name:"Okomfo Anokye Senior High",category:"B",region:"Ashanti"},
  {id:204,name:"Osei Bonsu Senior High",category:"B",region:"Bono East"},
  {id:205,name:"Osei Kyeretwie Senior High",category:"B",region:"Ashanti"},
  {id:206,name:"Osei Tutu Senior High, Akropong",category:"B",region:"Ashanti"},
  {id:207,name:"Otumfuo Osei Tutu II College",category:"B",region:"Ashanti"},
  {id:208,name:"Our Lady of Mercy Senior High",category:"B",region:"Greater Accra"},
  {id:209,name:"Peki Senior High",category:"B",region:"Volta"},
  {id:210,name:"Prampram Senior High",category:"B",region:"Greater Accra"},
  {id:211,name:"Queen of Peace Senior High, Nadowli",category:"B",region:"Upper West"},
  {id:212,name:"Sacred Heart Senior High, Nsoatre",category:"B",region:"Bono"},
  {id:213,name:"Sakafia Islamic Senior High",category:"B",region:"Ashanti"},
  {id:214,name:"Sekondi Takoradi Technical Institute",category:"B",region:"Western"},
  {id:215,name:"Serwaah Nyarko Girls' Snr. High",category:"B",region:"Ashanti"},
  {id:216,name:"Sogakofe Senior High",category:"B",region:"Volta"},
  {id:217,name:"St. Dominic's Senior High/Tech, Pepease",category:"B",region:"Eastern"},
  {id:218,name:"St. Hubert Sem/Senior High, Kumasi",category:"B",region:"Ashanti"},
  {id:219,name:"St. John's Grammar Senior High",category:"B",region:"Greater Accra"},
  {id:220,name:"St. Monica's Senior High, Mampong",category:"B",region:"Ashanti"},
  {id:221,name:"Suhum Senior High/Tech",category:"B",region:"Eastern"},
  {id:222,name:"Swedru Senior High",category:"B",region:"Central"},
  {id:223,name:"T. I. Ahmadiyya Senior High, Wa",category:"B",region:"Upper West"},
  {id:224,name:"Tamale Girls Senior High",category:"B",region:"Northern"},
  {id:225,name:"Tarkwa Senior High",category:"B",region:"Western"},
  {id:226,name:"Techiman Senior High",category:"B",region:"Bono East"},
  {id:227,name:"Tweneboa Kodua Senior High",category:"B",region:"Ashanti"},
  {id:228,name:"University Practice Senior High",category:"B",region:"Central"},
  {id:229,name:"Wa Senior High",category:"B",region:"Upper West"},
  {id:230,name:"Wesley Grammar School",category:"B",region:"Greater Accra"},
  {id:231,name:"West Africa Senior High",category:"B",region:"Greater Accra"},
  {id:232,name:"Winneba Senior High",category:"B",region:"Central"},
  {id:233,name:"Yendi Senior High",category:"B",region:"Northern"},
  {id:234,name:"Zebilla Senior High/Tech",category:"B",region:"Upper East"},
  // ── Category C (sample – full list from shsselect.com) ──
  {id:301,name:"Abakrampa Senior High/Tech",category:"C",region:"Central"},
  {id:302,name:"Abeadze State College",category:"C",region:"Central"},
  {id:303,name:"Abiriw Presby Technical Institute",category:"C",region:"Eastern"},
  {id:304,name:"Abor Senior High",category:"C",region:"Volta"},
  {id:305,name:"Abosamso Technical Institute",category:"C",region:"Ashanti"},
  {id:306,name:"Accra Wesley Girls High",category:"C",region:"Greater Accra"},
  {id:307,name:"Adaklu Senior High",category:"C",region:"Volta"},
  {id:308,name:"Adidome Senior High",category:"C",region:"Volta"},
  {id:309,name:"Adjen Kotoku Senior High",category:"C",region:"Greater Accra"},
  {id:310,name:"Agogo State College",category:"C",region:"Ashanti"},
  {id:311,name:"Agomeda Technical Institute",category:"C",region:"Greater Accra"},
  {id:312,name:"Agotime Senior High",category:"C",region:"Volta"},
  {id:313,name:"Akatsi Senior High/Tech",category:"C",region:"Volta"},
  {id:314,name:"Akim Asafo Senior High",category:"C",region:"Eastern"},
  {id:315,name:"Akokoaso Senior High/Tech",category:"C",region:"Eastern"},
  {id:316,name:"Akramaman Senior High",category:"C",region:"Greater Accra"},
  {id:317,name:"Akumadan Senior High",category:"C",region:"Ashanti"},
  {id:318,name:"Amasaman Senior High/Tech",category:"C",region:"Greater Accra"},
  {id:319,name:"Anfoega Senior High",category:"C",region:"Volta"},
  {id:320,name:"Antoa Senior High",category:"C",region:"Ashanti"},
  {id:321,name:"Apam Senior High/Tech",category:"C",region:"Central"},
  {id:322,name:"Ashiaman Senior High",category:"C",region:"Greater Accra"},
  {id:323,name:"Assin Manso Senior High",category:"C",region:"Central"},
  {id:324,name:"Atebubu Senior High",category:"C",region:"Bono East"},
  {id:325,name:"Atwima Kwanwoma Snr High/Tech",category:"C",region:"Ashanti"},
  {id:326,name:"Bamba Senior High",category:"C",region:"Savannah"},
  {id:327,name:"Bimbia Senior High/Tech",category:"C",region:"North East"},
  {id:328,name:"Bimbilla Senior High",category:"C",region:"Northern"},
  {id:329,name:"Bole Senior High",category:"C",region:"Savannah"},
  {id:330,name:"Bolga Sherigu Comm. Senior High",category:"C",region:"Upper East"},
  {id:331,name:"Bongo Senior High",category:"C",region:"Upper East"},
  {id:332,name:"Bonwire Senior High/Tech",category:"C",region:"Ashanti"},
  {id:333,name:"Bortianor Senior High",category:"C",region:"Greater Accra"},
  {id:334,name:"Buipe Senior High",category:"C",region:"Savannah"},
  {id:335,name:"Bunkpurugu Senior High/Tech",category:"C",region:"North East"},
  {id:336,name:"Business Senior High, Tamale",category:"C",region:"Northern"},
  {id:337,name:"Chereponi Senior High/Tech.",category:"C",region:"North East"},
  {id:338,name:"Chiana Senior High",category:"C",region:"Upper East"},
  {id:339,name:"Dambai Senior High",category:"C",region:"Oti"},
  {id:340,name:"Damongo Senior High",category:"C",region:"Savannah"},
  {id:341,name:"Dompoase Senior High/Tech",category:"C",region:"Ashanti"},
  {id:342,name:"Drobonso Senior High/Tech",category:"C",region:"Ashanti"},
  {id:343,name:"Duayaw Nkwanta Senior High",category:"C",region:"Ahafo"},
  {id:344,name:"Ejura Senior High/Tech",category:"C",region:"Ashanti"},
  {id:345,name:"Gyamfi Kumanini Senior High/Tech",category:"C",region:"Ahafo"},
  {id:346,name:"Jema Senior High",category:"C",region:"Bono East"},
  {id:347,name:"Kadjebi Senior High",category:"C",region:"Oti"},
  {id:348,name:"Keta Technical Institute",category:"C",region:"Volta"},
  {id:349,name:"Krachi Senior High/Tech",category:"C",region:"Oti"},
  {id:350,name:"Kukuom Senior High",category:"C",region:"Ahafo"},
  {id:351,name:"Kwame Nkrumah Senior High, Nkoranza",category:"C",region:"Bono East"},
  {id:352,name:"Larteh Kubease Senior High",category:"C",region:"Eastern"},
  {id:353,name:"Mankuma Senior High/Tech",category:"C",region:"Ahafo"},
  {id:354,name:"Manso Nkwanta Senior High",category:"C",region:"Ashanti"},
  {id:355,name:"Nima Senior High",category:"C",region:"Greater Accra"},
  {id:356,name:"Nkwanta Senior High",category:"C",region:"Oti"},
  {id:357,name:"Nsawam Senior High/Tech",category:"C",region:"Eastern"},
  {id:358,name:"Nsuaem Senior High/Tech",category:"C",region:"Western North"},
  {id:359,name:"Nyinahin Technical Institute",category:"C",region:"Ashanti"},
  {id:360,name:"Obuasi Senior High",category:"C",region:"Ashanti"},
  {id:361,name:"Offinso Senior High",category:"C",region:"Ashanti"},
  {id:362,name:"Pong-Tamale Senior High",category:"C",region:"Northern"},
  {id:363,name:"Saboba Senior High",category:"C",region:"Northern"},
  {id:364,name:"Salaga Senior High",category:"C",region:"Savannah"},
  {id:365,name:"Sankore Senior High",category:"C",region:"Ahafo"},
  {id:366,name:"Savelugu Senior High",category:"C",region:"Northern"},
  {id:367,name:"Shama Senior High",category:"C",region:"Western"},
  {id:368,name:"Sogakofe Technical Institute",category:"C",region:"Volta"},
  {id:369,name:"Sunyani Technical Institute",category:"C",region:"Bono"},
  {id:370,name:"Tamale Central Technical Institute",category:"C",region:"Northern"},
  {id:371,name:"Tano Odumasi Senior High",category:"C",region:"Ahafo"},
  {id:372,name:"Tatale Senior High",category:"C",region:"Northern"},
  {id:373,name:"Tolon Senior High",category:"C",region:"Northern"},
  {id:374,name:"Tumu Senior High",category:"C",region:"Upper West"},
  {id:375,name:"Tumu Technical Institute",category:"C",region:"Upper West"},
  {id:376,name:"Wa Anglican Senior High",category:"C",region:"Upper West"},
  {id:377,name:"Wamfie Senior High",category:"C",region:"Bono"},
  {id:378,name:"Walewale Senior High/Tech",category:"C",region:"North East"},
  {id:379,name:"Wenchi Senior High",category:"C",region:"Bono"},
  {id:380,name:"Wiafe Akenten Senior High",category:"C",region:"Ashanti"},
  {id:381,name:"Wioso Senior High",category:"C",region:"Ashanti"},
  {id:382,name:"Wulensi Senior High",category:"C",region:"Northern"},
  {id:383,name:"Yendi Technical Institute",category:"C",region:"Northern"},
  {id:384,name:"Yikpabongo Senior High",category:"C",region:"North East"},
  {id:385,name:"Zorko Senior High",category:"C",region:"Upper East"},
];

const GH_SUBJECTS = ["Mathematics","English Language","Integrated Science","Social Studies",
  "Religious & Moral Education","Ghanaian Language","French","Creative Arts","Computing / ICT","Career Technology"];

const REGIONS = [...new Set(ALL_SCHOOLS.map(s=>s.region))].sort();
const CAT_COLOR = {A:"#1d4ed8",B:"#0891b2",C:"#6366f1"};
const CAT_BG    = {A:"#dbeafe",B:"#cffafe",C:"#e0e7ff"};

function genId() { return Date.now().toString(36)+Math.random().toString(36).slice(2); }
function today() { return new Date().toISOString().split("T")[0]; }
function getGrade(s){if(s>=80)return"A1";if(s>=70)return"B2";if(s>=60)return"B3";if(s>=55)return"C4";if(s>=50)return"C5";if(s>=45)return"C6";if(s>=40)return"D7";if(s>=35)return"E8";return"F9";}
function gradeStyle(s){if(s>=70)return{bg:"#dcfce7",color:"#166534"};if(s>=50)return{bg:"#fef3c7",color:"#92400e"};return{bg:"#fee2e2",color:"#991b1b"};}
function statusStyle(s){if(s==="approved")return{bg:"#dcfce7",color:"#166534"};if(s==="rejected")return{bg:"#fee2e2",color:"#991b1b"};return{bg:"#fef3c7",color:"#92400e"};}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [portal,setPortal]   = useState(() => localStorage.getItem('portal') || "home");
  const [students,setStudents] = useState([]);
    const [scores,setScores]   = useState({}); // Initialize scores state
  const [selections,setSelections] = useState({});
  const [notifications,setNotifications] = useState([]);
  const [loggedStudent,setLoggedStudent] = useState(null);
  const [adminTab,setAdminTab] = useState(() => localStorage.getItem('adminTab') || "dashboard");
  const [studentTab,setStudentTab] = useState(() => localStorage.getItem('studentTab') || "profile");
  const [sidebarOpen,setSidebarOpen] = useState(false);

  useEffect(() => { localStorage.setItem('portal', portal); }, [portal]);
  useEffect(() => { localStorage.setItem('adminTab', adminTab); }, [adminTab]);
  useEffect(() => { localStorage.setItem('studentTab', studentTab); }, [studentTab]);

  const addNotif = (msg) => setNotifications(n=>[{id:genId(),msg,time:new Date().toLocaleTimeString(),read:false},...n]);

  // Reset admin tab to dashboard when entering admin portal
  useEffect(() => {
    if (portal === "admin") {
      setAdminTab("dashboard");
    }
  }, [portal]);

  const registerStudent = async (data) => {
    const s = {...data,id:genId(),createdAt:today()};
      if (!DEMO_MODE) { // Check if in demo mode
        await supabase.insert("students",{full_name:s.fullName,index_number:s.indexNumber,gender:s.gender,dob:s.dob,parent_contact:s.parentContact,photo_url:s.photoUrl||null}); // Insert student data
      }
    setStudents(p=>[...p,s]);
    addNotif({ icon:<UserPlusIcon className="h-4 w-4" style={{ color: "#10b981" }}/>, msg: `New student enrolled: ${s.fullName}` });
    return s;
  };

  const saveScores = async (studentId, subScores) => {
    if (!DEMO_MODE) {
      for (const [subject,score] of Object.entries(subScores)) {
        await supabase.upsert("scores",{student_id:studentId,subject,score:Number(score)},"student_id,subject");
      }
    }
    setScores(p=>({...p,[studentId]:subScores}));
  };

  const submitSelection = async (studentId, choices) => {
    if (!DEMO_MODE) {
      await supabase.upsert("selections",{student_id:studentId,choices,status:"pending",reason:null},"student_id");
      await supabase.insert("notifications",{message:`Selection submitted by ${students.find(s=>s.id===studentId)?.fullName}`});
    }
    setSelections(p=>({...p,[studentId]:{choices,status:"pending",reason:""}}));
    addNotif(`School selection submitted by ${students.find(s=>s.id===studentId)?.fullName}`);
  };

  const reviewSelection = async (studentId, status, reason="") => {
    if (!DEMO_MODE) {
      await supabase.update("selections",{status,reason,reviewed_at:new Date().toISOString()},{student_id:studentId});
    }
    setSelections(p=>({...p,[studentId]:{...p[studentId],status,reason}}));
    addNotif({ icon: status==="approved" ? <CheckCircleIcon className="h-4 w-4" style={{ color: "#10b981" }}/> : <XCircleIcon className="h-4 w-4" style={{ color: "#ef4444" }}/>, msg: `Selection ${status} for ${students.find(s=>s.id===studentId)?.fullName}` });
  };

  const markRead = () => setNotifications(n=>n.map(x=>({...x,read:true})));
  const unread = notifications.filter(n=>!n.read).length;

  if (portal==="home") return <Home onSelectPortal={setPortal}/>;

  const sharedProps = {students,schools:ALL_SCHOOLS,scores,selections,notifications,unread,markRead,sidebarOpen,setSidebarOpen};

  if (portal==="admin") return (
    <AdminPortal {...sharedProps} adminTab={adminTab} setAdminTab={setAdminTab}
      registerStudent={registerStudent} saveScores={saveScores} reviewSelection={reviewSelection}
      onLogout={()=>setPortal("home")}/>
  );
  if (portal==="student") return (
    <StudentPortal {...sharedProps} studentTab={studentTab} setStudentTab={setStudentTab}
      loggedStudent={loggedStudent} setLoggedStudent={setLoggedStudent}
      submitSelection={submitSelection} onLogout={()=>{setPortal("home");setLoggedStudent(null);}}/>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function Home({onSelectPortal}){
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,right:0,width:"40vw",height:"40vw",background:"radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:0,left:0,width:"40vw",height:"40vw",background:"radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>
      
      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:900,width:"100%"}}>
        <div style={{marginBottom:16}}>
          <span style={{display:"inline-block",background:"linear-gradient(135deg,#3b82f6 0%,#06b6d4 100%)",color:"#000",padding:"8px 16px",borderRadius:24,fontSize:12,fontWeight:700,letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:0}}>Comprehensive Student Management System</span>
        </div>
        
        <h1 style={{color:"#0f172a",fontSize:"clamp(28px,4.5vw,44px)",fontWeight:900,margin:"-12px 0 16px",lineHeight:1.1,letterSpacing:"-1.5px"}}>WUNDEF INTELLIGENT<br/>INTERNET SERVICE</h1>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24,maxWidth:700,margin:"0 auto 48px"}}>
          {[{icon:<BuildingLibraryIcon className="h-10 w-10"/>,title:"Admin Portal",desc:"Manage enrollments, monitor scores, and review student selections",color:"#3b82f6",key:"admin"},
            {icon:<AcademicCapIcon className="h-10 w-10"/>,title:"Student Portal",desc:"Access your profile, view scores, and select your preferred institutions",color:"#06b6d4",key:"student"}
          ].map(p=><PortalCard key={p.key} {...p} onClick={()=>onSelectPortal(p.key)}/>)}
        </div>
        
        <p style={{color:"#64748b",fontSize:12,marginTop:48}}>© 2026 WUNDEF Intelligent Internet Service. All rights reserved.</p>
      </div>
    </div>
  );
}

function PortalCard({icon,title,desc,color,onClick}){
  const [hov,setHov]=useState(false);
  return(
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"36px 28px",cursor:"pointer",transition:"all 0.3s ease",transform:hov?"translateY(-8px)":"translateY(0)",boxShadow:hov?"0 24px 48px rgba(0,0,0,0.12)":"0 4px 12px rgba(0,0,0,0.08)",overflow:"hidden",position:"relative",display:"flex",flexDirection:"column",height:"100%",alignItems:"center",textAlign:"center"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:color}}></div>
      <div style={{fontSize:40,marginBottom:20}}>{icon}</div>
      <h2 style={{color:"#1f2937",fontSize:20,fontWeight:700,margin:"0 0 12px",letterSpacing:"-0.5px",minHeight:28}}>{title}</h2>
      <p style={{color:"#000",fontSize:14,margin:"0 0 auto",lineHeight:1.6,flex:1}}>{desc}</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:color,color:"#000",padding:"10px 24px",borderRadius:6,fontSize:13,fontWeight:600,transition:"all 0.3s ease",opacity:hov?1:0.9,marginTop:24}}>Login to Portal <ArrowRightIcon className="h-4 w-4 inline-block ml-1"/></div>
    </div>
  );
}

// ─── LAYOUT SHELL ─────────────────────────────────────────────────────────────
function AppShell({tabs,activeTab,setActiveTab,title,unread,notifications,markRead,sidebarOpen,setSidebarOpen,onLogout,children}){
  const isMobile = useResponsive();
  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#f1f5f9",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",position:"relative"}}>
      {/* Overlay for mobile */}
      {isMobile&&sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:40}}/>}

      {/* Sidebar */}
      <aside style={{
        width:230,flexShrink:0,background:"linear-gradient(180deg,#0f172a 0%,#1e3a8a 100%)",
        display:"flex",flexDirection:"column",
        position:isMobile?"fixed":"sticky",top:0,left:0,height:"100vh",
        transform:isMobile?(sidebarOpen?"translateX(0)":"translateX(-100%)"):"none",
        transition:"transform 0.3s ease",zIndex:50,
      }}>
        {/* Sidebar header — logo covers entire header */}
        <div style={{ padding:0, borderBottom:"1px solid rgba(255,255,255,0.1)", flexShrink:0, height:96, overflow:"hidden" }}>
          <div className="logo-wrap" style={{ height: '100%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', background:'#1d4ed8', color:'white', fontSize:18, fontWeight:800 }} onClick={() => window.location.reload()}>
            WISS SCHOOL MANAGEMENT
          </div>
        </div>
        {/* Scrollable nav */}
        <nav style={{flex:1,overflowY:"auto",padding:"8px 0",scrollbarWidth:"thin",scrollbarColor:"rgba(255,255,255,0.2) transparent"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>{setActiveTab(t.id);if(isMobile)setSidebarOpen(false);}}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 20px",background:activeTab===t.id?"rgba(255,255,255,0.13)":"none",border:"none",borderRight:activeTab===t.id?"3px solid #60a5fa":"3px solid transparent",color:activeTab===t.id?"white":"#94a3b8",cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:activeTab===t.id?700:500,transition:"all 0.15s",position:"relative"}}>
              <span style={{fontSize:17,flexShrink:0}}>{t.icon}</span>
              <span style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.label}</span>
              {t.badge>0&&<span style={{background:"#ef4444",color:"#000",fontSize:9,fontWeight:800,padding:"2px 5px",borderRadius:10,flexShrink:0}}>{t.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:16,borderTop:"1px solid rgba(255,255,255,0.08)",flexShrink:0}}>
          <button onClick={onLogout} style={{width:"100%",padding:"9px 16px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"#cbd5e1",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,textAlign:"left",display:"flex",alignItems:"center",gap:6}}><ArrowLeftOnRectangleIcon className="h-4 w-4"/>Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflowX:"hidden"}}>
        <TopBar title={tabs.find(t=>t.id===activeTab)?.label||""} unread={unread} notifications={notifications} markRead={markRead}
          onMenuClick={()=>setSidebarOpen(!sidebarOpen)} isMobile={isMobile}/>
        <main style={{flex:1,padding:"clamp(12px,3vw,24px) clamp(12px,3vw,28px)",overflowY:"auto"}}>
          {children}
        </main>
      </div>
    </div>
  );
}

function TopBar({title,unread,notifications,markRead,onMenuClick,isMobile}){
  const [showN,setShowN]=useState(false);
  return(
    <div style={{background:"white",padding:"12px clamp(12px,3vw,24px)",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:30,boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
        {isMobile&&<button onClick={onMenuClick} style={{background:"none",border:"none",cursor:"pointer",padding:4,flexShrink:0}}><Bars3Icon className="h-6 w-6" style={{ color: "#475569" }}/></button>}
        <h1 style={{margin:0,fontSize:"clamp(15px,2.5vw,20px)",fontWeight:700,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{title}</h1>
      </div>
      <div style={{position:"relative",flexShrink:0}}>
        <button onClick={()=>{setShowN(!showN);markRead&&markRead();}} style={{background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:14,position:"relative",display:"flex",alignItems:"center",gap:4}}>
          <BellIcon className="h-5 w-5" style={{ color: "#475569" }}/>{unread>0&&<span style={{background:"#ef4444",color:"#000",fontSize:9,fontWeight:800,padding:"1px 5px",borderRadius:10,position:"absolute",top:-4,right:-4}}>{unread}</span>}
        </button>
        {showN&&(
          <div style={{position:"absolute",right:0,top:"110%",width:"min(320px,90vw)",background:"white",borderRadius:12,boxShadow:"0 8px 40px rgba(0,0,0,0.15)",border:"1px solid #e2e8f0",zIndex:100,maxHeight:360,overflowY:"auto"}}>
            <div style={{padding:"10px 14px",borderBottom:"1px solid #e2e8f0",fontWeight:700,fontSize:13,color:"#1d4ed8",display:"flex",justifyContent:"space-between"}}>
              <span>Notifications</span><span style={{cursor:"pointer",fontSize:14,color:"#64748b"}} onClick={()=>setShowN(false)}><XMarkIcon className="h-4 w-4"/></span>
            </div>
            {notifications?.length===0?<div style={{padding:16,color:"#94a3b8",fontSize:13,textAlign:"center"}}>No notifications</div>:
              notifications?.slice(0,10).map(n=>(
                <div key={n.id} style={{padding:"9px 14px",borderBottom:"1px solid #f8fafc",fontSize:12,color:"#334155"}}>
                  <div>{n.msg}</div><div style={{color:"#94a3b8",fontSize:10,marginTop:2}}>{n.time}</div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

function useResponsive(){
  const [mobile,setMobile]=useState(()=>window.innerWidth<768);
  useEffect(()=>{const h=()=>setMobile(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return mobile;
}

// ─── ADMIN PORTAL ─────────────────────────────────────────────────────────────
function AdminPortal({students,schools,scores,selections,notifications,unread,markRead,adminTab,setAdminTab,registerStudent,saveScores,reviewSelection,onLogout,sidebarOpen,setSidebarOpen}){
  const pending=Object.values(selections).filter(s=>s.status==="pending").length;
  const TABS=[
    {id:"dashboard",label:"Dashboard",icon:<ChartBarIcon className="h-5 w-5" />},
    {id:"enroll",label:"Enroll Student",icon:<PencilSquareIcon className="h-5 w-5" />},
    {id:"students",label:"Students",icon:<UsersIcon className="h-5 w-5" />},
    {id:"schools",label:"Schools",icon:<BuildingLibraryIcon className="h-5 w-5" />},
    {id:"academics",label:"Academics",icon:<AcademicCapIcon className="h-5 w-5" />},
    {id:"scores",label:"Test Scores",icon:<ClipboardDocumentCheckIcon className="h-5 w-5" />},
    {id:"pending",label:"Pending",icon:<ClockIcon className="h-5 w-5" />,badge:pending},
    {id:"analytics",label:"Analytics",icon:<ChartPieIcon className="h-5 w-5" />},
  ];
  return(
    <AppShell tabs={TABS} activeTab={adminTab} setActiveTab={setAdminTab} title="Admin Portal"
      unread={unread} notifications={notifications} markRead={markRead}
      sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={onLogout}>
      {adminTab==="dashboard"&&<Dashboard students={students} schools={schools} scores={scores} selections={selections}/>}
      {adminTab==="enroll"&&<EnrollTab onRegister={registerStudent}/>}
      {adminTab==="students"&&<StudentsTab students={students} scores={scores} selections={selections}/>}
      {adminTab==="schools"&&<SchoolsTab schools={schools}/>}
      {adminTab==="academics"&&<AcademicsTab students={students} scores={scores}/>}
      {adminTab==="scores"&&<ScoresTab students={students} scores={scores} onSave={saveScores}/>}
      {adminTab==="pending"&&<PendingTab students={students} schools={schools} selections={selections} onReview={reviewSelection}/>}
      {adminTab==="analytics"&&<AnalyticsTab students={students} scores={scores} selections={selections} schools={schools}/>}
    </AppShell>
  );
}

// ─── STUDENT PORTAL ───────────────────────────────────────────────────────────
function StudentPortal({students,schools,scores,selections,loggedStudent,setLoggedStudent,studentTab,setStudentTab,submitSelection,onLogout,sidebarOpen,setSidebarOpen,notifications,unread,markRead}){
  if(!loggedStudent) return <StudentLogin students={students} onLogin={setLoggedStudent} onBack={onLogout}/>;
  const me=students.find(s=>s.id===loggedStudent);
  const TABS=[
    {id:"profile",label:"My Profile",icon:<UserCircleIcon className="h-5 w-5" />},
    {id:"scores",label:"My Scores",icon:<ChartBarIcon className="h-5 w-5" />},
    {id:"selection",label:"School Selection",icon:<BuildingLibraryIcon className="h-5 w-5" />},
    {id:"status",label:"Selection Status",icon:<CheckCircleIcon className="h-5 w-5" />},
  ];
  return(
    <AppShell tabs={TABS} activeTab={studentTab} setActiveTab={setStudentTab} title="Student Portal"
      unread={0} notifications={[]} markRead={()=>{}} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={onLogout}>
      {studentTab==="profile"&&<StudentProfile student={me} scores={scores[loggedStudent]||{}} selection={selections[loggedStudent]} schools={schools}/>}
      {studentTab==="scores"&&<StudentScoresView scores={scores[loggedStudent]||{}}/>}
      {studentTab==="selection"&&<SchoolSelectionTab student={me} schools={schools} selections={selections} onSubmit={submitSelection}/>}
      {studentTab==="status"&&<SelectionStatusTab student={me} schools={schools} selection={selections[loggedStudent]}/>}
    </AppShell>
  );
}

function StudentLogin({students,onLogin,onBack}){
  const [idx,setIdx]=useState(""); const [contact,setContact]=useState(""); const [err,setErr]=useState("");
  const handle=()=>{
    const i = idx.trim();
    const iDigits = i.replace(/\D/g, "");
    const c = contact.trim();
    const cDigits = c.replace(/\D/g, "");

    // validation: index must be exactly 12 digits, contact required (digits)
    if (!iDigits || iDigits.length !== 12) { setErr("Index number must be exactly 12 digits."); return; }
    if (!cDigits || cDigits.length !== 10) { setErr("Enter a valid parent/guardian contact (10 digits)."); return; }
    const s = students.find(x=>{
      const storedIdx = String(x.indexNumber || x.index || "").trim();
      const storedIdxDigits = storedIdx.replace(/\D/g, "");
      const storedContact = String(x.parent_contact || x.parentContact || x.parentcontact || "").trim();
      const storedContactDigits = storedContact.replace(/\D/g, "");
      return (storedIdx === i || storedIdxDigits === iDigits) && (storedContact === c || storedContactDigits === cDigits);
    });
    if(!s){setErr("Invalid index number or parent/guardian contact.");return;}onLogin(s.id);
  };
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#0c1445,#1e3a8a,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"white",borderRadius:20,padding:"clamp(24px,5vw,48px) clamp(20px,5vw,40px)",maxWidth:420,width:"100%",boxShadow:"0 24px 64px rgba(0,0,0,0.2)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48}}><AcademicCapIcon className="h-12 w-12" style={{ color: "#2563eb" }}/></div>
          <h2 style={{color:"#1d4ed8",fontSize:22,fontWeight:800,margin:"8px 0 4px"}}>Student Login</h2>
          <p style={{color:"#64748b",fontSize:13,margin:0}}>Enter your index number and parent/guardian contact</p>
        </div>
        <label style={S.label}>Index Number</label>
        <input style={S.input} placeholder="000000000000" maxLength={12} value={idx} onChange={e=>setIdx(e.target.value.replace(/\D/g,""))} onKeyDown={e=>e.key==="Enter"&&handle()}/>
        <label style={{...S.label,marginTop:16}}>Parent/Guardian Contact</label>
        <input style={S.input} placeholder="0201234567" maxLength={10} value={contact} onChange={e=>setContact(e.target.value.replace(/\D/g, ""))} onKeyDown={e=>e.key==="Enter"&&handle()}/>
        {err&&<p style={{color:"#ef4444",fontSize:12,margin:"4px 0 0"}}>{err}</p>}
        <button style={{...S.btnPrimary,width:"100%",marginTop:16,display:"flex",alignItems:"center",gap:6}} onClick={handle}>Login <ArrowRightIcon className="h-4 w-4"/></button>
        <button style={{...S.btnGhost,width:"100%",marginTop:10,display:"flex",alignItems:"center",gap:6}} onClick={onBack}><ArrowLeftIcon className="h-4 w-4"/>Back to Home</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({students,schools,scores,selections}){
  const males=students.filter(s=>s.gender==="Male").length;
  const females=students.filter(s=>s.gender==="Female").length;
  const pending=Object.values(selections).filter(s=>s.status==="pending").length;
  const approved=Object.values(selections).filter(s=>s.status==="approved").length;
  const allAvgs=students.map(s=>{const v=Object.values(scores[s.id]||{}).filter(x=>x!=="").map(Number);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null;}).filter(v=>v!==null);
  const avgScore=allAvgs.length?Math.round(allAvgs.reduce((a,b)=>a+b,0)/allAvgs.length):0;
  const stats=[
    {label:"Total Students",value:students.length,icon:<UsersIcon className="h-6 w-6" />,color:"#1d4ed8"},
    {label:"Male",value:males,icon:<UserCircleIcon className="h-6 w-6" />,color:"#0891b2"},
    {label:"Female",value:females,icon:<UserCircleIcon className="h-6 w-6" />,color:"#7c3aed"},
    {label:"Total Schools",value:schools.length,icon:<BuildingLibraryIcon className="h-6 w-6" />,color:"#059669"},
    {label:"Cat A",value:schools.filter(s=>s.category==="A").length,icon:<StarIcon className="h-6 w-6" />,color:"#dc2626"},
    {label:"Cat B",value:schools.filter(s=>s.category==="B").length,icon:<StarIcon className="h-6 w-6" />,color:"#0891b2"},
    {label:"Cat C",value:schools.filter(s=>s.category==="C").length,icon:<StarIcon className="h-6 w-6" />,color:"#6366f1"},
    {label:"Pending",value:pending,icon:<ClockIcon className="h-6 w-6" />,color:"#d97706"},
    {label:"Approved",value:approved,icon:<CheckCircleIcon className="h-6 w-6" />,color:"#10b981"},
    {label:"Avg Score",value:`${avgScore}%`,icon:<ChartBarIcon className="h-6 w-6" />,color:"#8b5cf6"},
  ];
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(160px,45%),1fr))",gap:12,marginBottom:24}}>
        {stats.map(s=><StatCard key={s.label} {...s}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(300px,100%),1fr))",gap:20}}>
        <div style={S.card}>
          <h3 style={S.cardH}>Recent Enrollments</h3>
          {students.length===0?<Empty text="No students yet"/>:students.slice(-5).reverse().map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
              <div style={{...S.avatar,flexShrink:0}}>{s.fullName[0]}</div>
              <div style={{minWidth:0}}>
                <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.fullName}</div>
                <div style={{fontSize:11,color:"#64748b"}}>{s.indexNumber}</div>
              </div>
              <div style={{marginLeft:"auto",fontSize:11,color:"#94a3b8",flexShrink:0}}>{s.createdAt}</div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={S.cardH}>Schools by Region</h3>
          {REGIONS.slice(0,8).map(r=>{const c=ALL_SCHOOLS.filter(s=>s.region===r).length;const pct=Math.round(c/ALL_SCHOOLS.length*100);return(
            <div key={r} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                <span style={{color:"#334155",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,marginRight:8}}>{r}</span>
                <span style={{color:"#64748b",flexShrink:0}}>{c}</span>
              </div>
              <div style={{height:6,background:"#e2e8f0",borderRadius:3}}>
                <div style={{height:6,borderRadius:3,background:"#1d4ed8",width:`${pct*3}%`,maxWidth:"100%",transition:"width 0.6s"}}/>
              </div>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

function StatCard({label,value,icon,color}){
  return(
    <div style={{background:"white",borderRadius:12,padding:"14px 16px",borderTop:`3px solid ${color}`,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:"clamp(20px,3vw,28px)",fontWeight:800,color:"#1e293b"}}>{value}</div>
          <div style={{fontSize:"clamp(10px,1.5vw,12px)",color:"#64748b",fontWeight:600,marginTop:2}}>{label}</div>
        </div>
        <div style={{fontSize:24,opacity:0.2}}>{icon}</div>
      </div>
    </div>
  );
}

// ─── ENROLL TAB ───────────────────────────────────────────────────────────────
function EnrollTab({onRegister}){
  const init={fullName:"",indexNumber:"",gender:"",dob:"",parentContact:"",photoUrl:""};
  const [form,setForm]=useState(init);
  const [errors,setErrors]=useState({});
  const [success,setSuccess]=useState(false);
  const fileRef=useRef();
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const validate=()=>{
    const e={};
    if(!form.fullName.trim())e.fullName="Full name required";
    if(!/^\d{12}$/.test(form.indexNumber))e.indexNumber="Must be exactly 12 digits";
    if(!form.gender)e.gender="Select gender";
    if(!form.dob)e.dob="Date of birth required";
    if(!/^0[0-9]{9}$/.test(form.parentContact))e.parentContact="Must be valid 10-digit Ghana number (e.g. 024XXXXXXX)";
    return e;
  };
  const submit=()=>{const e=validate();if(Object.keys(e).length){setErrors(e);return;}onRegister({...form});setForm(init);setErrors({});setSuccess(true);setTimeout(()=>setSuccess(false),3000);};
  const handlePhoto=e=>{const f=e.target.files[0];if(!f)return;set("photoUrl",URL.createObjectURL(f));};
  return(
    <div style={S.card}>
      <h2 style={S.pageH}>Student Enrollment</h2>
      {success&&<div style={S.success}><CheckCircleIcon className="h-5 w-5 inline-block mr-1" style={{ color: "#10b981" }}/>Student enrolled successfully!</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(260px,100%),1fr))",gap:16}}>
        <Field label="Full Name *" error={errors.fullName}><input style={S.input} placeholder="e.g. Kwame Asante Boateng" value={form.fullName} onChange={e=>set("fullName",e.target.value)}/></Field>
        <Field label="Index Number * (12 digits)" error={errors.indexNumber}><input style={S.input} placeholder="000000000000" maxLength={12} value={form.indexNumber} onChange={e=>set("indexNumber",e.target.value.replace(/\D/g,""))}/></Field>
        <Field label="Gender *" error={errors.gender}><select style={S.input} value={form.gender} onChange={e=>set("gender",e.target.value)}><option value="">Select Gender</option><option>Male</option><option>Female</option></select></Field>
        <Field label="Date of Birth *" error={errors.dob}><input type="date" style={S.input} value={form.dob} onChange={e=>set("dob",e.target.value)}/></Field>
        <Field label="Parent/Guardian Contact *" error={errors.parentContact}><input style={S.input} placeholder="024XXXXXXX" maxLength={10} value={form.parentContact} onChange={e=>set("parentContact",e.target.value.replace(/\D/g,""))}/></Field>
        <Field label="Passport Photo">
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            {form.photoUrl&&<img src={form.photoUrl} alt="preview" style={{width:44,height:44,borderRadius:8,objectFit:"cover",border:"2px solid #dbeafe"}}/>}
            <button style={S.btnSec} onClick={()=>fileRef.current.click()}><CameraIcon className="h-5 w-5 inline-block mr-1"/>Upload Photo</button>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
          </div>
        </Field>
      </div>
      <div style={{marginTop:20,display:"flex",gap:10,flexWrap:"wrap"}}>
        <button style={S.btnPrimary} onClick={submit}><UserPlusIcon className="h-5 w-5 inline-block mr-1"/>Enroll Student</button>
        <button style={S.btnGhost} onClick={()=>{setForm(init);setErrors({});}}>Clear</button>
      </div>
    </div>
  );
}

// ─── STUDENTS TAB ─────────────────────────────────────────────────────────────
function StudentsTab({students,scores,selections}){
  const [search,setSearch]=useState(""); const [gFilter,setGFilter]=useState("all");
  const sortedStudents = students.sort((a, b) => {
    const aIndex = parseInt(a.indexNumber) || 0;
    const bIndex = parseInt(b.indexNumber) || 0;
    return aIndex - bIndex;
  });
  const filtered=sortedStudents.filter(s=>{
    const q=search.toLowerCase();
    return (s.fullName.toLowerCase().includes(q)||s.indexNumber.includes(q))&&(gFilter==="all"||s.gender===gFilter);
  });
  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input style={{...S.input,flex:1,minWidth:160}} placeholder="Search name or index..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{...S.input,width:140,flexShrink:0}} value={gFilter} onChange={e=>setGFilter(e.target.value)}>
          <option value="all">All Genders</option><option value="Male">Male</option><option value="Female">Female</option>
        </select>
      </div>
      {filtered.length===0?<Empty text="No students found"/>:(
        <div style={{overflowX:"auto",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <table style={S.table}>
            <thead><tr style={{background:"#f8fafc"}}>{["#","Photo","Name","Index","Gender","DOB","Contact","Avg","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((s,i)=>{
                const sc=scores[s.id]||{};
                const vals=Object.values(sc).filter(v=>v!=="").map(Number);
                const avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;
                const sel=selections[s.id];
                const ss=sel?statusStyle(sel.status):{};
                return(
                  <tr key={s.id} style={{background:i%2===0?"white":"#f8fafc"}}>
                    <td style={S.td}>{i+1}</td>
                    <td style={S.td}>{s.photoUrl?<img src={s.photoUrl} style={{width:32,height:32,borderRadius:6,objectFit:"cover"}}/>:<div style={S.avatar}>{s.fullName[0]}</div>}</td>
                    <td style={{...S.td,fontWeight:600,whiteSpace:"nowrap"}}>{s.fullName}</td>
                    <td style={S.td}><code style={{fontSize:11}}>{s.indexNumber}</code></td>
                    <td style={S.td}><Chip label={s.gender} bg={s.gender==="Male"?"#dbeafe":"#fce7f3"} color={s.gender==="Male"?"#1d4ed8":"#9d174d"}/></td>
                    <td style={{...S.td,whiteSpace:"nowrap"}}>{s.dob||"-"}</td>
                    <td style={{...S.td,whiteSpace:"nowrap"}}>{s.parentContact}</td>
                    <td style={S.td}>{avg!==null?<Chip label={`${avg}%`} bg="#dcfce7" color="#166534"/>:"-"}</td>
                    <td style={S.td}>{sel?<Chip label={sel.status} bg={ss.bg} color={ss.color}/>:"-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── SCHOOLS TAB ──────────────────────────────────────────────────────────────
function SchoolsTab({schools}){
  const [region,setRegion]=useState("all"); const [cat,setCat]=useState("all"); const [search,setSearch]=useState("");
  const filtered=schools.filter(s=>{
    if(region!=="all"&&s.region!==region)return false;
    if(cat!=="all"&&s.category!==cat)return false;
    if(search&&!s.name.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });
  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input style={{...S.input,flex:1,minWidth:140}} placeholder="Search schools..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{...S.input,width:180,flexShrink:0}} value={region} onChange={e=>setRegion(e.target.value)}>
          <option value="all">All Regions</option>{REGIONS.map(r=><option key={r}>{r}</option>)}
        </select>
        <select style={{...S.input,width:140,flexShrink:0}} value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="all">All Categories</option><option value="A">CAT A</option><option value="B">CAT B</option><option value="C">CAT C</option>
        </select>
      </div>
      <div style={{marginBottom:10,fontSize:13,color:"#64748b"}}>{filtered.length} schools found</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(260px,100%),1fr))",gap:12}}>
        {filtered.map(s=>(
          <div key={s.id} style={{background:"white",borderRadius:10,padding:"14px 16px",borderLeft:`4px solid ${CAT_COLOR[s.category]}`,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{fontWeight:700,fontSize:13,color:"#1e293b",flex:1,minWidth:0}}>{s.name}</div>
              <Chip label={`CAT ${s.category}`} bg={CAT_BG[s.category]} color={CAT_COLOR[s.category]}/>
            </div>
            <div style={{fontSize:12,color:"#64748b",marginTop:6}}><MapPinIcon className="h-4 w-4 inline-block mr-1" style={{ color: "#475569" }}/>{s.region}</div>
          </div>
        ))}
      </div>
      {filtered.length===0&&<Empty text="No schools match your filters"/>}
    </div>
  );
}

// ─── ACADEMICS TAB ────────────────────────────────────────────────────────────
function AcademicsTab({students,scores}){
  const [sub,setSub]=useState("overview");
  const SUBS=[{id:"overview",l:"Overview"},{id:"subjects",l:"Subject Analysis"},{id:"grading",l:"Grading"},{id:"attendance",l:"Attendance"},{id:"performance",l:"Performance"}];
  return(
    <div>
      <div style={{display:"flex",gap:0,marginBottom:20,overflowX:"auto",borderBottom:"2px solid #e2e8f0"}}>
        {SUBS.map(t=><button key={t.id} onClick={()=>setSub(t.id)} style={{padding:"8px 14px",background:"none",border:"none",borderBottom:`2px solid ${sub===t.id?"#1d4ed8":"transparent"}`,color:sub===t.id?"#1d4ed8":"#64748b",cursor:"pointer",fontSize:13,fontWeight:sub===t.id?700:500,whiteSpace:"nowrap",marginBottom:-2}}>{t.l}</button>)}
      </div>
      {sub==="overview"&&<AcademicsOverview students={students} scores={scores}/>}
      {sub==="subjects"&&<SubjectAnalysis students={students} scores={scores}/>}
      {sub==="grading"&&<GradingSystem/>}
      {sub==="attendance"&&<AttendancePage students={students}/>}
      {sub==="performance"&&<PerformanceBands students={students} scores={scores}/>}
    </div>
  );
}
function AcademicsOverview({students,scores}){
  const avgs=GH_SUBJECTS.map(sub=>{const v=students.map(s=>scores[s.id]?.[sub]).filter(x=>x!=null&&x!=="").map(Number);return{sub,avg:v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):0};});
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(140px,45%),1fr))",gap:12,marginBottom:20}}>
        <StatCard label="Scored Students" value={students.filter(s=>Object.keys(scores[s.id]||{}).length>0).length} icon={<ClipboardDocumentCheckIcon className="h-6 w-6" />} color="#1d4ed8"/>
        <StatCard label="Subjects" value={GH_SUBJECTS.length} icon={<BookOpenIcon className="h-6 w-6" />} color="#7c3aed"/>
      </div>
      <div style={S.card}>
        <h3 style={S.cardH}>Subject Averages</h3>
        {avgs.map(({sub,avg})=>(
          <div key={sub} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:"clamp(120px,25%,180px)",fontSize:12,color:"#334155",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sub}</div>
            <div style={{flex:1,height:7,background:"#e2e8f0",borderRadius:4}}><div style={{height:7,borderRadius:4,width:`${avg}%`,background:avg>=70?"#10b981":avg>=50?"#f59e0b":"#ef4444",transition:"width 0.6s"}}/></div>
            <div style={{width:36,textAlign:"right",fontSize:12,fontWeight:700,flexShrink:0}}>{avg}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function SubjectAnalysis({students,scores}){
  const [sel,setSel]=useState(GH_SUBJECTS[0]);
  const vals=students.map(s=>({name:s.fullName,score:scores[s.id]?.[sel]})).filter(x=>x.score!=null&&x.score!=="").map(x=>({...x,score:Number(x.score)})).sort((a,b)=>b.score-a.score);
  return(
    <div style={S.card}>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <select style={{...S.input,maxWidth:300}} value={sel} onChange={e=>setSel(e.target.value)}>{GH_SUBJECTS.map(s=><option key={s}>{s}</option>)}</select>
        {vals.length>0&&<Chip label={`Avg: ${Math.round(vals.reduce((a,b)=>a+b.score,0)/vals.length)}%`} bg="#dbeafe" color="#1d4ed8"/>}
      </div>
      {vals.length===0?<Empty text="No scores for this subject"/>:(
        <div style={{overflowX:"auto"}}><table style={S.table}><thead><tr style={{background:"#f8fafc"}}>{["Rank","Student","Score","Grade"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{vals.map((r,i)=>{const g=gradeStyle(r.score);return(<tr key={r.name} style={{background:i%2===0?"white":"#f8fafc"}}><td style={S.td}><strong>{i+1}</strong></td><td style={S.td}>{r.name}</td><td style={S.td}><strong>{r.score}%</strong></td><td style={S.td}><Chip label={getGrade(r.score)} bg={g.bg} color={g.color}/></td></tr>);})}</tbody></table></div>
      )}
    </div>
  );
}
function GradingSystem(){
  const gs=[{g:"A1",r:"80–100",rem:"Excellent",c:"#10b981"},{g:"B2",r:"70–79",rem:"Very Good",c:"#3b82f6"},{g:"B3",r:"60–69",rem:"Good",c:"#6366f1"},{g:"C4",r:"55–59",rem:"Credit",c:"#8b5cf6"},{g:"C5",r:"50–54",rem:"Credit",c:"#a78bfa"},{g:"C6",r:"45–49",rem:"Credit",c:"#f59e0b"},{g:"D7",r:"40–44",rem:"Pass",c:"#f97316"},{g:"E8",r:"35–39",rem:"Pass",c:"#ef4444"},{g:"F9",r:"0–34",rem:"Fail",c:"#dc2626"}];
  return(<div style={S.card}><h3 style={S.cardH}>WAEC Grading System</h3><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(160px,45%),1fr))",gap:10}}>{gs.map(g=><div key={g.g} style={{padding:14,borderRadius:10,background:"#f8fafc",borderLeft:`4px solid ${g.c}`}}><div style={{fontWeight:800,fontSize:18,color:g.c}}>{g.g}</div><div style={{fontSize:13,color:"#334155",fontWeight:600}}>{g.r}%</div><div style={{fontSize:11,color:"#64748b"}}>{g.rem}</div></div>)}</div></div>);
}
function AttendancePage({students}){
  return(<div style={S.card}><h3 style={S.cardH}>Attendance Records</h3>{students.length===0?<Empty text="No students"/>:<div style={{overflowX:"auto"}}><table style={S.table}><thead><tr style={{background:"#f8fafc"}}>{["Student","Index","Status","Date"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>{students.map((s,i)=><tr key={s.id} style={{background:i%2===0?"white":"#f8fafc"}}><td style={S.td}>{s.fullName}</td><td style={S.td}><code style={{fontSize:11}}>{s.indexNumber}</code></td><td style={S.td}><Chip label="Active" bg="#dcfce7" color="#166534"/></td><td style={S.td}>{s.createdAt}</td></tr>)}</tbody></table></div>}</div>);
}
function PerformanceBands({students,scores}){
  const avgs=students.map(s=>{const v=Object.values(scores[s.id]||{}).filter(x=>x!=="").map(Number);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null;});
  const bands=[{l:"Excellent (80+)",min:80,max:100,c:"#10b981",icon:<StarIcon className="h-4 w-4"/>},{l:"Good (60–79)",min:60,max:79,c:"#3b82f6",icon:<ThumbUpIcon className="h-4 w-4"/>},{l:"Average (40–59)",min:40,max:59,c:"#f59e0b",icon:<BookOpenIcon className="h-4 w-4"/>},{l:"Below Average (<40)",min:0,max:39,c:"#ef4444",icon:<ExclamationTriangleIcon className="h-4 w-4"/>}];
  return(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(160px,45%),1fr))",gap:12}}>{bands.map(b=><StatCard key={b.l} label={b.l} value={avgs.filter(a=>a!==null&&a>=b.min&&a<=b.max).length} icon={b.icon} color={b.c}/>)}</div>);
}

// ─── SCORES TAB ───────────────────────────────────────────────────────────────
function ScoresTab({students,scores,onSave}){
  const [selS,setSelS]=useState(""); const [form,setForm]=useState({}); const [saved,setSaved]=useState(false);
  useEffect(()=>{if(selS)setForm(scores[selS]||{});},[selS,scores]);
  const setScore=(sub,val)=>setForm(f=>({...f,[sub]:val}));
  const save=()=>{if(!selS)return;onSave(selS,form);setSaved(true);setTimeout(()=>setSaved(false),2500);};
  const vals=Object.values(form).filter(v=>v!=="").map(Number);
  const avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;
  return(
    <div style={S.card}>
      <h2 style={S.pageH}>Enter Test Scores</h2>
      <select style={{...S.input,maxWidth:360,marginBottom:16}} value={selS} onChange={e=>setSelS(e.target.value)}>
        <option value="">-- Select Student --</option>{students.map(s=><option key={s.id} value={s.id}>{s.fullName} ({s.indexNumber})</option>)}
      </select>
      {saved&&<div style={S.success}><CheckCircleIcon className="h-5 w-5 inline-block mr-1" style={{ color: "#10b981" }}/>Scores saved!</div>}
      {selS&&<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(240px,100%),1fr))",gap:12,marginBottom:16}}>
          {GH_SUBJECTS.map(sub=>{const g=form[sub]?gradeStyle(Number(form[sub])):null;return(
            <div key={sub}>
              <label style={S.label}>{sub}</label>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="number" min={0} max={100} style={{...S.input,flex:1}} placeholder="0–100" value={form[sub]||""} onChange={e=>setScore(sub,e.target.value)}/>
                {g&&<Chip label={getGrade(Number(form[sub]))} bg={g.bg} color={g.color}/>}
              </div>
            </div>
          );})}
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <button style={S.btnPrimary} onClick={save}>💾 Save Scores</button>
          {avg!==null&&<span style={{fontSize:13,color:"#64748b"}}>Overall Average: <strong>{avg}%</strong> · <strong>{getGrade(avg)}</strong></span>}
        </div>
      </>}
    </div>
  );
}

// ─── PENDING TAB ──────────────────────────────────────────────────────────────
function PendingTab({students,schools,selections,onReview}){
  const [reasons,setReasons]=useState({});
  const entries=Object.entries(selections);
  const pending=entries.filter(([,v])=>v.status==="pending");
  const done=entries.filter(([,v])=>v.status!=="pending");
  return(
    <div>
      <h3 style={{...S.cardH,marginBottom:16}}>Pending Selections ({pending.length})</h3>
      {pending.length===0?<Empty text="No pending selections"/>:pending.map(([sid,sel])=>{
        const stu=students.find(s=>s.id===sid);
        return(
          <div key={sid} style={{...S.card,marginBottom:16,borderLeft:"4px solid #f59e0b"}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:12}}>
              <div><div style={{fontWeight:700,fontSize:15}}>{stu?.fullName}</div><div style={{fontSize:11,color:"#64748b"}}>{stu?.indexNumber}</div></div>
              <Chip label={<span><ClockIcon className="h-4 w-4 inline-block mr-1"/>Pending</span>} bg="#fef3c7" color="#92400e"/>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:600,color:"#475569",marginBottom:6}}>School Choices:</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {sel.choices.map((id,i)=>{const sc=schools.find(s=>s.id===id);return sc?<span key={i} style={{fontSize:11,padding:"3px 8px",borderRadius:12,background:CAT_BG[sc.category],color:CAT_COLOR[sc.category],fontWeight:600}}>{i+1}. {sc.name} (Cat {sc.category})</span>:null;})}
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <button style={S.btnSuccess} onClick={()=>onReview(sid,"approved")}><CheckCircleIcon className="h-4 w-4 inline-block mr-1"/>Approve</button>
              <input style={{...S.input,flex:1,minWidth:180,height:36,fontSize:12}} placeholder="Reason for rejection..." value={reasons[sid]||""} onChange={e=>setReasons(r=>({...r,[sid]:e.target.value}))}/>
              <button style={S.btnDanger} onClick={()=>{if(reasons[sid])onReview(sid,"rejected",reasons[sid]);}}><XCircleIcon className="h-4 w-4 inline-block mr-1"/>Reject</button>
            </div>
          </div>
        );
      })}
      {done.length>0&&<>
        <h3 style={{...S.cardH,marginTop:28,marginBottom:12}}>Reviewed ({done.length})</h3>
        {done.map(([sid,sel])=>{const stu=students.find(s=>s.id===sid);const ss=statusStyle(sel.status);return(
          <div key={sid} style={{...S.card,marginBottom:10,padding:14,borderLeft:`4px solid ${ss.color}`}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <div><strong>{stu?.fullName}</strong> <span style={{fontSize:11,color:"#64748b"}}>({stu?.indexNumber})</span></div>
              <Chip label={sel.status} bg={ss.bg} color={ss.color}/>
            </div>
            {sel.reason&&<div style={{fontSize:12,color:"#64748b",marginTop:4}}>Reason: {sel.reason}</div>}
          </div>
        );})}
      </>}
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function AnalyticsTab({students,scores,selections,schools}){
  const total=Object.keys(selections).length;
  const approved=Object.values(selections).filter(s=>s.status==="approved").length;
  const rejected=Object.values(selections).filter(s=>s.status==="rejected").length;
  const demand={};
  Object.values(selections).forEach(s=>s.choices.forEach(id=>{demand[id]=(demand[id]||0)+1;}));
  const top=Object.entries(demand).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id,c])=>({school:schools.find(s=>s.id===Number(id)),count:c}));
  const allAvgs=students.map(s=>{const v=Object.values(scores[s.id]||{}).filter(x=>x!=="").map(Number);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null;}).filter(v=>v!==null);
  const bands=[{l:"90–100",min:90,max:100,c:"#10b981"},{l:"70–89",min:70,max:89,c:"#3b82f6"},{l:"50–69",min:50,max:69,c:"#f59e0b"},{l:"<50",min:0,max:49,c:"#ef4444"}];
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(150px,45%),1fr))",gap:12,marginBottom:20}}>
        <StatCard label="Total Selections" value={total} icon={<PencilSquareIcon className="h-6 w-6" />} color="#7c3aed"/>
        <StatCard label="Approved" value={approved} icon={<CheckCircleIcon className="h-6 w-6" />} color="#10b981"/>
        <StatCard label="Rejected" value={rejected} icon={<XCircleIcon className="h-6 w-6" />} color="#ef4444"/>
        <StatCard label="Pending" value={total-approved-rejected} icon={<ClockIcon className="h-6 w-6" />} color="#f59e0b"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(280px,100%),1fr))",gap:20}}>
        <div style={S.card}>
          <h3 style={S.cardH}>Score Distribution</h3>
          {bands.map(b=>{const c=allAvgs.filter(a=>a>=b.min&&a<=b.max).length;const pct=allAvgs.length?Math.round(c/allAvgs.length*100):0;return(
            <div key={b.l} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span>{b.l}</span><span style={{fontWeight:700}}>{c} ({pct}%)</span></div>
              <div style={{height:8,background:"#e2e8f0",borderRadius:4}}><div style={{height:8,borderRadius:4,background:b.c,width:`${pct}%`,transition:"width 0.6s"}}/></div>
            </div>
          );})}
        </div>
        <div style={S.card}>
          <h3 style={S.cardH}>Most Demanded Schools</h3>
          {top.length===0?<Empty text="No selections yet"/>:top.map(({school,count},i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:24,height:24,borderRadius:6,background:CAT_COLOR[school?.category||"C"],color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{school?.name||"Unknown"}</div>
                <div style={{height:5,background:"#e2e8f0",borderRadius:3,marginTop:4}}><div style={{height:5,borderRadius:3,background:CAT_COLOR[school?.category||"C"],width:`${Math.min(100,count*20)}%`}}/></div>
              </div>
              <div style={{fontSize:12,fontWeight:700,color:"#1d4ed8",flexShrink:0}}>{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT PROFILE ──────────────────────────────────────────────────────────
function StudentProfile({student,scores,selection,schools}){
  if(!student)return<Empty text="Student not found"/>;
  const vals=Object.values(scores).filter(v=>v!=="").map(Number);
  const avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;
  const statusChip=({approved:"#10b981",pending:"#f59e0b",rejected:"#ef4444",none:"#94a3b8"}[selection?.status||"none"]||"#94a3b8");
  return(
    <div style={{maxWidth:720}}>
      <div style={S.card}>
        <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
          <div style={{flexShrink:0}}>
            {student.photoUrl?<img src={student.photoUrl} style={{width:90,height:90,borderRadius:14,objectFit:"cover",border:"3px solid #dbeafe"}}/>:<div style={{width:90,height:90,borderRadius:14,background:"linear-gradient(135deg,#dbeafe,#bfdbfe)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,color:"#1d4ed8",fontWeight:800}}>{student.fullName[0]}</div>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <h2 style={{margin:"0 0 4px",color:"#ffffff",fontSize:"clamp(16px,3vw,22px)",fontWeight:800}}>{student.fullName}</h2>
            <Chip label={student.indexNumber} bg="#dbeafe" color="#1d4ed8"/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(160px,100%),1fr))",gap:12,marginTop:16}}>
              {[{l:"Gender",v:student.gender},{l:"Date of Birth",v:student.dob||"N/A"},{l:"Parent Contact",v:student.parentContact},{l:"Enrolled",v:student.createdAt},{l:"Avg Score",v:avg?`${avg}% (${getGrade(avg)})`:\""},Not scored\"},{l:"Selection",v:selection?.status||"None"}].map(({l,v})=>(
                <div key={l}><div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{l}</div><div style={{fontSize:13,color:"#1e293b",fontWeight:600,marginTop:2}}>{v}</div></div>
              ))}
            </div>
          </div>
        </div>
        {selection?.choices&&selection.choices.length>0&&(
          <div style={{marginTop:20,paddingTop:20,borderTop:"1px solid #e2e8f0"}}>
            <h3 style={S.cardH}>{selection.status==="approved"?"Approved Schools":"Submitted Schools"}</h3>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {selection.choices.map((id,i)=>{const sc=schools.find(s=>s.id===id);return(
                <div key={id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#f8fafc",borderRadius:8}}>
                  <div style={{width:24,height:24,borderRadius:5,background:CAT_COLOR[sc?.category||"C"],color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,fontSize:13,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#000000"}}>{sc?.name||`School ${id}`}</div>
                  <Chip label={`CAT ${sc?.category||"C"}`} bg={CAT_BG[sc?.category||"C"]} color={CAT_COLOR[sc?.category||"C"]}/>
                </div>
              );})
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentScoresView({scores}){
  const vals=Object.entries(scores).filter(([,v])=>v!=="");
  const avg=vals.length?Math.round(vals.reduce((a,[,v])=>a+Number(v),0)/vals.length):null;
  return(
    <div style={{maxWidth:720}}>
      {avg!==null&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:16}}>
        <StatCard label="Overall Average" value={`${avg}%`} icon={<ChartBarIcon className="h-6 w-6" />} color="#1d4ed8"/>
        <StatCard label="Subjects Scored" value={vals.length} icon={<BookOpenIcon className="h-6 w-6" />} color="#7c3aed"/>
        <StatCard label="Grade" value={getGrade(avg)} icon={<StarIcon className="h-6 w-6" />} color="#10b981"/>
      </div>}
      <div style={S.card}>
        <h3 style={S.cardH}>My Subject Scores</h3>
        {GH_SUBJECTS.map(sub=>{const sc=scores[sub];const g=sc?gradeStyle(Number(sc)):null;return(
          <div key={sub} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f1f5f9",flexWrap:"wrap"}}>
            <div style={{width:"clamp(140px,35%,200px)",fontSize:13,color:"#334155",flexShrink:0}}>{sub}</div>
            {sc?<>
              <div style={{flex:1,minWidth:80,height:7,background:"#e2e8f0",borderRadius:4}}><div style={{height:7,borderRadius:4,width:`${sc}%`,background:Number(sc)>=70?"#10b981":Number(sc)>=50?"#f59e0b":"#ef4444"}}/></div>
              <div style={{fontWeight:700,fontSize:13,width:36,textAlign:"right",flexShrink:0}}>{sc}%</div>
              <Chip label={getGrade(Number(sc))} bg={g.bg} color={g.color}/>
            </>:<span style={{color:"#94a3b8",fontSize:12}}>Not entered</span>}
          </div>
        );})}
      </div>
    </div>
  );
}

// ─── SCHOOL SELECTION ─────────────────────────────────────────────────────────
function SchoolSelectionTab({student,schools,selections,onSubmit}){
  if(!student)return<Empty text="Student not found"/>;
  const existing=selections[student.id];
  const [choices,setChoices]=useState(existing?.choices||[]);
  const [regionF,setRegionF]=useState("all"); const [catF,setCatF]=useState("all"); const [searchQ,setSearchQ]=useState("");
  const [err,setErr]=useState(""); const [submitted,setSubmitted]=useState(false);

  const catCount=(c)=>choices.map(id=>schools.find(s=>s.id===id)).filter(s=>s?.category===c).length;
  const catA=catCount("A"),catB=catCount("B"),catC=catCount("C");

  const validate=()=>{
    if(choices.length!==7){setErr("Select exactly 7 schools.");return false;}
    if(catA>1){setErr("Max 1 Category A school.");return false;}
    if(catA===1&&catB>2){setErr("With 1 Cat A: max 2 Cat B allowed.");return false;}
    if(catB>2){setErr("Max 2 Category B schools.");return false;}
    setErr("");return true;
  };
  const toggle=(id)=>{
    const sc=schools.find(s=>s.id===id);
    if(choices.includes(id)){setChoices(c=>c.filter(x=>x!==id));setErr("");return;}
    if(choices.length>=7){setErr("Maximum 7 schools reached.");return;}
    const next=[...choices,id];
    const na=next.map(i=>schools.find(s=>s.id===i)).filter(s=>s?.category==="A").length;
    const nb=next.map(i=>schools.find(s=>s.id===i)).filter(s=>s?.category==="B").length;
    if(na>1){setErr("Max 1 Category A.");return;}
    if(nb>2){setErr("Max 2 Category B.");return;}
    setChoices(next);setErr("");
  };
  const handleSubmit=()=>{if(!validate())return;onSubmit(student.id,choices);setSubmitted(true);};

  const filtered=schools.filter(s=>{
    if(regionF!=="all"&&s.region!==regionF)return false;
    if(catF!=="all"&&s.category!==catF)return false;
    if(searchQ&&!s.name.toLowerCase().includes(searchQ.toLowerCase()))return false;
    return true;
  });

  if(existing?.status==="approved")return(<div style={S.card}><div style={{textAlign:"center",padding:40}}><CheckCircleIcon className="h-8 w-8 mx-auto mb-3" style={{ color: "#10b981" }}/><h2 style={{color:"#10b981"}}>Selection Approved!</h2><p style={{color:"#64748b"}}>Your selections have been confirmed by the administrator.</p></div></div>);
  if(submitted||existing?.status==="pending")return(<div style={S.card}><div style={{textAlign:"center",padding:40}}><ClockIcon className="h-8 w-8 mx-auto mb-3" style={{ color: "#f59e0b" }}/><h2 style={{color:"#f59e0b"}}>Awaiting Review</h2><p style={{color:"#64748b"}}>Your selection has been submitted. Please check the Status tab.</p></div></div>);

  return(
    <div>
      {/* Rules bar */}
      <div style={{...S.card,marginBottom:16,padding:14}}>
        <div style={{fontSize:13,fontWeight:700,color:"#1d4ed8",marginBottom:8}}>Selection Rules</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",fontSize:12,color:"#334155",marginBottom:10}}>
          {["Exactly 7 schools","Max 1 Category A","Max 2 Category B","Remaining = Category C"].map(r=>(
            <span key={r} style={{display:"flex",alignItems:"center",gap:4}}>
              <CheckCircleIcon className="h-4 w-4 inline-block" style={{ color: "#10b981" }}/> {r}
            </span>
          ))}
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Chip label={`A: ${catA}/1`} bg="#dbeafe" color="#1d4ed8"/>
          <Chip label={`B: ${catB}/2`} bg="#cffafe" color="#0891b2"/>
          <Chip label={`C: ${catC}`} bg="#e0e7ff" color="#6366f1"/>
          <Chip label={`Total: ${choices.length}/7`} bg={choices.length===7?"#dcfce7":"#fef3c7"} color={choices.length===7?"#166534":"#92400e"}/>
        </div>
        {err&&<div style={{color:"#ef4444",fontSize:12,marginTop:8,fontWeight:600}}><ExclamationTriangleIcon className="h-4 w-4 inline-block mr-1" style={{ color: "#ef4444" }}/> {err}</div>}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <input style={{...S.input,flex:1,minWidth:140}} placeholder="Search schools..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
        <select style={{...S.input,width:170,flexShrink:0}} value={regionF} onChange={e=>setRegionF(e.target.value)}>
          <option value="all">All Regions</option>{REGIONS.map(r=><option key={r}>{r}</option>)}
        </select>
        <select style={{...S.input,width:140,flexShrink:0}} value={catF} onChange={e=>setCatF(e.target.value)}>
          <option value="all">All Categories</option><option value="A">CAT A</option><option value="B">CAT B</option><option value="C">CAT C</option>
        </select>
      </div>

      {/* School grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(240px,100%),1fr))",gap:10,marginBottom:16}}>
        {filtered.map(s=>{
          const sel=choices.includes(s.id);const idx=choices.indexOf(s.id)+1;
          return(
            <div key={s.id} onClick={()=>toggle(s.id)} style={{background:sel?CAT_BG[s.category]:"white",border:`2px solid ${sel?CAT_COLOR[s.category]:"#e2e8f0"}`,borderRadius:10,padding:12,cursor:"pointer",transition:"all 0.15s",boxShadow:sel?"0 2px 12px rgba(29,78,216,0.12)":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                <div style={{fontWeight:600,fontSize:12,color:"#1e293b",flex:1,minWidth:0}}>{s.name}</div>
                <Chip label={`CAT ${s.category}`} bg={CAT_BG[s.category]} color={CAT_COLOR[s.category]}/>
              </div>
              <div style={{fontSize:11,color:"#64748b",marginTop:4}}><MapPinIcon className="h-4 w-4 inline-block mr-1" style={{ color: "#475569" }}/>{s.region}</div>
              {sel&&<div style={{fontSize:11,fontWeight:700,color:CAT_COLOR[s.category],marginTop:4}}>✓ Choice #{idx}</div>}
            </div>
          );
        })}
      </div>

      {/* Selected list */}
      {choices.length>0&&(
        <div style={S.card}>
          <h3 style={S.cardH}>My {choices.length}/7 Choices</h3>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
            {choices.map((id,i)=>{const sc=schools.find(s=>s.id===id);return(
              <div key={id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#f8fafc",borderRadius:8}}>
                <div style={{width:26,height:26,borderRadius:6,background:CAT_COLOR[sc?.category||"C"],color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,flexShrink:0}}>{i+1}</div>
                <div style={{flex:1,fontSize:13,fontWeight:600,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sc?.name}</div>
                <Chip label={`CAT ${sc?.category}`} bg={CAT_BG[sc?.category||"C"]} color={CAT_COLOR[sc?.category||"C"]}/>
                <button onClick={e=>{e.stopPropagation();toggle(id);}} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontSize:16,flexShrink:0,padding:0}}>×</button>
              </div>
            );})}
          </div>
          <button style={{...S.btnPrimary,opacity:choices.length===7?1:0.55,cursor:choices.length===7?"pointer":"default"}} onClick={handleSubmit}>
            Submit Selection ({choices.length}/7) <ArrowRightIcon className="h-4 w-4"/>
          </button>
          {choices.length<7&&<div style={{fontSize:12,color:"#94a3b8",marginTop:6}}>Select {7-choices.length} more school{7-choices.length!==1?"s":""}</div>}
        </div>
      )}
    </div>
  );
}

function SelectionStatusTab({student,schools,selection}){
  if(!selection)return(<div style={S.card}><div style={{textAlign:"center",padding:40}}><ClipboardDocumentCheckIcon className="h-6 w-6" style={{ color: "#475569" }}/><h2 style={{color:"#64748b",marginBottom:8}}>No Selection</h2><p style={{color:"#94a3b8",fontSize:14}}>Go to School Selection to choose your schools.</p></div></div>);
  const ss=statusStyle(selection.status);
  const icons={approved:<CheckCircleIcon className="inline h-5 w-5" style={{ color: "#10b981" }}/>,rejected:<XCircleIcon className="inline h-5 w-5" style={{ color: "#ef4444" }}/>,pending:<ClockIcon className="inline h-5 w-5" style={{ color: "#f59e0b" }}/>};
  return(
    <div style={{maxWidth:640}}>
      <div style={{...S.card,borderLeft:`4px solid ${ss.color}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{fontSize:36}}>{icons[selection.status]}</div>
          <div><div style={{fontSize:18,fontWeight:800,color:ss.color,textTransform:"capitalize"}}>{selection.status}</div><div style={{fontSize:12,color:"#64748b"}}>Selection Status</div></div>
        </div>
        {selection.reason&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:10,fontSize:13,color:"#dc2626",marginBottom:16}}><strong>Reason:</strong> {selection.reason}</div>}
        <h3 style={S.cardH}>{selection.status === "approved" ? "Approved Schools" : "Submitted Schools"}</h3>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {selection.choices.map((id,i)=>{const sc=schools.find(s=>s.id===id);return(
            <div key={id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#f8fafc",borderRadius:8}}>
              <div style={{width:24,height:24,borderRadius:5,background:CAT_COLOR[sc?.category||"C"],color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1,fontSize:13,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sc?.name||"Unknown"}</div>
              <Chip label={`Cat ${sc?.category}`} bg={CAT_BG[sc?.category||"C"]} color={CAT_COLOR[sc?.category||"C"]}/>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
function Field({label,error,children}){
  return(<div><label style={S.label}>{label}</label>{children}{error&&<div style={{color:"#ef4444",fontSize:11,marginTop:2}}>{error}</div>}</div>);
}
function Chip({label,bg,color}){
  return<span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:700,background:bg,color,flexShrink:0,whiteSpace:"nowrap"}}>{label}</span>;
}
function Empty({text}){
  return(<div style={{textAlign:"center",padding:"36px 20px",color:"#94a3b8"}}><InboxIcon className="h-9 w-9 mx-auto mb-2" style={{ color: "#475569" }}/><div style={{fontSize:13}}>{text}</div></div>);
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S={
  card:{background:"white",borderRadius:14,padding:"clamp(14px,3vw,24px)",boxShadow:"0 1px 6px rgba(0,0,0,0.06)"},
  cardH:{margin:"0 0 14px",fontSize:15,fontWeight:700,color:"#1e293b"},
  pageH:{margin:"0 0 18px",fontSize:"clamp(16px,2.5vw,20px)",fontWeight:800,color:"#1e293b"},
  input:{display:"block",width:"100%",padding:"8px 11px",border:"1px solid #d1d5db",borderRadius:8,fontSize:13,outline:"none",boxSizing:"border-box",background:"white",color:"#1e293b",fontFamily:"inherit"},
  label:{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:4},
  btnPrimary:{padding:"9px 20px",background:"#1d4ed8",color:"#000",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit"},
  btnSec:{padding:"7px 14px",background:"#eff6ff",color:"#1d4ed8",border:"1px solid #bfdbfe",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap"},
  btnGhost:{padding:"9px 20px",background:"white",color:"#64748b",border:"1px solid #e2e8f0",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"},
  btnSuccess:{padding:"7px 14px",background:"#10b981",color:"#000",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",whiteSpace:"nowrap"},
  btnDanger:{padding:"7px 14px",background:"#ef4444",color:"#000",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",whiteSpace:"nowrap"},
  avatar:{width:32,height:32,borderRadius:7,background:"#dbeafe",color:"#1d4ed8",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,flexShrink:0},
  table:{width:"100%",borderCollapse:"collapse",fontSize:13,background:"white",borderRadius:12,overflow:"hidden"},
  th:{padding:"9px 12px",textAlign:"left",fontWeight:700,color:"#374151",borderBottom:"2px solid #e2e8f0",whiteSpace:"nowrap",fontSize:12},
  td:{padding:"9px 12px",borderBottom:"1px solid #f1f5f9",verticalAlign:"middle"},
  success:{background:"#dcfce7",border:"1px solid #bbf7d0",color:"#166534",padding:"9px 14px",borderRadius:8,marginBottom:14,fontSize:13,fontWeight:600},
};

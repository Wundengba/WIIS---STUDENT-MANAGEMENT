import { useState, useEffect, useRef } from "react";
import { ChartBarIcon, PencilSquareIcon, UsersIcon, BuildingLibraryIcon, AcademicCapIcon, ClipboardDocumentCheckIcon, ClockIcon, ChartPieIcon, UserCircleIcon, CheckCircleIcon, XCircleIcon, UserPlusIcon, DocumentChartBarIcon, BellIcon } from '@heroicons/react/24/outline';
import { S } from "./components/shared/styles";
import Home from "./pages/Home";
import StudentLogin from "./pages/StudentLogin";
import { AppShell } from "./components/shared/AppShell";
import { useNotifications } from "./hooks/useNotifications";

// Admin tab components
import Dashboard     from "./components/admin/Dashboard";
import EnrollTab     from "./components/admin/EnrollTab";
import StudentsTab   from "./components/admin/StudentsTab";
import SchoolsTab    from "./components/admin/SchoolsTab";
import AcademicsTab  from "./components/admin/AcademicsTab";
import ScoresTab     from "./components/admin/ScoresTab";
import PendingTab    from "./components/admin/PendingTab";
import AnalyticsTab  from "./components/admin/AnalyticsTab";
import NotificationsTab from "./components/admin/NotificationsTab";

// Student tab components
import StudentProfile     from "./components/student/StudentProfile";
import SchoolDirectoriesTab from "./components/student/SchoolDirectoriesTab";
import StudentScoresView  from "./components/student/StudentScoresView";
import SelectionStatusTab from "./components/student/SelectionStatusTab";

export default function App() {
  // Initialize from API/Supabase (not localStorage)
  const [portal,    setPortal]    = useState(() => localStorage.getItem('portal') || "home");
  const [adminTab,  setAdminTab]  = useState(() => localStorage.getItem('adminTab') || "dashboard");
  const [studentTab,setStudentTab]= useState(() => localStorage.getItem('studentTab') || "profile");
  const [students,  setStudents]  = useState([]);
  const [scores,    setScores]    = useState({});
  const [selections,setSelections]= useState({});
  const [loggedStudent, setLoggedStudent] = useState(() => { try { return JSON.parse(localStorage.getItem('loggedStudent')); } catch(e){ return null; }});
  const [sidebarOpen,   setSidebarOpen]   = useState(() => { try { const v = localStorage.getItem('sidebarOpen'); return v?JSON.parse(v):false } catch(e){ return false }});
  const [schools, setSchools] = useState([]);
  const [regions, setRegions] = useState([]);
  const { notifications, addNotification, markAllRead, unreadCount } = useNotifications();

  // Refs to track when portal/loggedStudent actually change (not on reload)
  const prevPortalRef = useRef(portal);
  const prevLoggedStudentRef = useRef(loggedStudent);

  // Helper to normalize student data from snake_case to camelCase
  const normalizeStudent = (student) => ({
    id: student.id,
    fullName: student.full_name,
    indexNumber: student.index_number,
    gender: student.gender,
    dob: student.dob,
    parentContact: student.parent_contact,
    photoUrl: student.photo_url,
    createdAt: student.created_at
  });

  // Fetch all data from backend API on app load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        
        // Fetch students
        const studentsRes = await fetch(`${API_URL}/students`);
        const studentsData = await studentsRes.json();
        setStudents(Array.isArray(studentsData) ? studentsData.map(normalizeStudent) : []);
        
        // Fetch scores
        const scoresRes = await fetch(`${API_URL}/scores`);
        const scoresData = await scoresRes.json();
        // Transform scores array into object by student_id
        const scoresObj = {};
        if (Array.isArray(scoresData)) {
          scoresData.forEach(score => {
            if (!scoresObj[score.student_id]) scoresObj[score.student_id] = {};
            scoresObj[score.student_id][score.subject] = score.score;
          });
        }
        setScores(scoresObj);
        
        // Fetch selections
        const selectionsRes = await fetch(`${API_URL}/selections`);
        const selectionsData = await selectionsRes.json();
        // Transform selections array into object by student_id
        const selectionsObj = {};
        if (Array.isArray(selectionsData)) {
          selectionsData.forEach(sel => {
            selectionsObj[sel.student_id] = sel;
          });
        }
        setSelections(selectionsObj);
        
        // Fetch schools
        const schoolsRes = await fetch(`${API_URL}/schools`);
        const schoolsData = await schoolsRes.json();
        setSchools(Array.isArray(schoolsData) ? schoolsData : []);
        setRegions([...new Set((Array.isArray(schoolsData) ? schoolsData : []).map(s => s.region))].sort());

        setLoading(false);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch data from API:", error);
        }
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // persist simple UI state when it changes
  useEffect(() => { localStorage.setItem('portal', portal); }, [portal]);
  useEffect(() => { localStorage.setItem('adminTab', adminTab); }, [adminTab]);
  
  // Reset to default tab only when actually ENTERING a portal (not on reload)
  useEffect(() => {
    if (portal === "admin" && prevPortalRef.current !== "admin") {
      setAdminTab("dashboard");
    }
    prevPortalRef.current = portal;
  }, [portal]);
  
  // Reset to profile only when a NEW student logs in (not on reload)
  useEffect(() => {
    if (loggedStudent && !prevLoggedStudentRef.current) {
      setStudentTab("profile");
    }
    prevLoggedStudentRef.current = loggedStudent;
  }, [loggedStudent]);
  
  // keep sidebar closed on each new login
  useEffect(() => {
    if (loggedStudent || portal === "admin") {
      setSidebarOpen(false);
    }
  }, [loggedStudent, portal]);
  useEffect(() => { localStorage.setItem('studentTab', studentTab); }, [studentTab]);
  useEffect(() => { localStorage.setItem('loggedStudent', JSON.stringify(loggedStudent)); }, [loggedStudent]);
  useEffect(() => { localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen)); }, [sidebarOpen]);

  const registerStudent = async (data) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.fullName,
          index_number: data.indexNumber,
          gender: data.gender,
          dob: data.dob,
          parent_contact: data.parentContact,
          photo_url: data.photoUrl || null
        })
      });
      const newStudent = await response.json();
      setStudents(p => [normalizeStudent(newStudent), ...p]);
      addNotification({ icon:<UserPlusIcon className="h-4 w-4" style={{ color: S.colors.green }}/>, msg: `New student enrolled: ${data.fullName}` });
      return newStudent;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to register student:", error);
      }
      addNotification({ icon:<UserPlusIcon className="h-4 w-4" style={{ color: S.colors.red }}/>, msg: `Failed to enroll student` });
    }
  };

  const refreshStudents = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const studentsRes = await fetch(`${API_URL}/students`);
      const studentsData = await studentsRes.json();
      setStudents(Array.isArray(studentsData) ? studentsData.map(normalizeStudent) : []);
      
      // Also refresh selections since schools might have been deleted
      const selectionsRes = await fetch(`${API_URL}/selections`);
      const selectionsData = await selectionsRes.json();
      const selectionsObj = {};
      if (Array.isArray(selectionsData)) {
        selectionsData.forEach(sel => {
          selectionsObj[sel.student_id] = sel;
        });
      }
      setSelections(selectionsObj);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to refresh students:", error);
      }
    }
  };

  const saveScores = async (studentId, newScores) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      // Save each score individually
      for (const [subject, score] of Object.entries(newScores)) {
        if (score !== "") {
          await fetch(`${API_URL}/scores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: studentId,
              subject,
              score: parseInt(score)
            })
          });
        }
      }
      setScores(p => ({ ...p, [studentId]: newScores }));
      const st = students.find(s => s.id === studentId);
      addNotification({ icon:<DocumentChartBarIcon className="h-4 w-4" style={{ color: S.colors.blue }}/>, msg: `Scores saved for ${st?.fullName}` });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to save scores:", error);
      }
      addNotification({ icon:<DocumentChartBarIcon className="h-4 w-4" style={{ color: S.colors.red }}/>, msg: `Failed to save scores` });
    }
  };

  const submitSelection = async (studentId, choices) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/selections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          choices
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = payload && payload.error ? payload.error : `Server returned ${response.status}`;
        throw new Error(msg);
      }
      const selection = payload;
      setSelections(p => ({ ...p, [studentId]: selection }));
      const st = students.find(s => s.id === studentId);
      addNotification({ icon:<BuildingLibraryIcon className="h-4 w-4" style={{ color: S.colors.indigo }}/>, msg: `${st?.fullName} submitted school selection` });
      return selection;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to submit selection:", error);
      }
      addNotification({ icon:<BuildingLibraryIcon className="h-4 w-4" style={{ color: S.colors.red }}/>, msg: `Failed to submit selection` });
      throw error;
    }
  };

  const clearSelection = async (studentId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/selections/student/${studentId}`, { method: 'DELETE' });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const msg = payload && payload.error ? payload.error : `Server returned ${response.status}`;
        throw new Error(msg);
      }
      // remove from local state
      setSelections(p => { const np = { ...p }; delete np[studentId]; return np; });
      const st = students.find(s => s.id === studentId);
      addNotification({ icon:<BuildingLibraryIcon className="h-4 w-4" style={{ color: S.colors.indigo }}/>, msg: `${st?.fullName} cleared selection` });
      return { ok: true };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to clear selection:", error);
      }
      addNotification({ icon:<BuildingLibraryIcon className="h-4 w-4" style={{ color: S.colors.red }}/>, msg: `Failed to clear selection` });
      throw error;
    }
  };

  const reviewSelection = async (studentId, status, reason = "") => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const selection = selections[studentId];
      if (!selection) return;
      
      await fetch(`${API_URL}/selections/${selection.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      });
      
      setSelections(p => ({ ...p, [studentId]: { ...p[studentId], status, reason, reviewedAt: new Date().toISOString() } }));
      const st = students.find(s => s.id === studentId);
      addNotification({ icon: status==="approved" ? <CheckCircleIcon className="h-4 w-4" style={{ color: S.colors.green }}/> : <XCircleIcon className="h-4 w-4" style={{ color: S.colors.red }}/>, msg: `Selection ${status} for ${st?.fullName}` });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to review selection:", error);
      }
      addNotification({ icon:<XCircleIcon className="h-4 w-4" style={{ color: S.colors.red }}/>, msg: `Failed to review selection` });
    }
  };

  if (portal === "home") return <Home onSelectPortal={setPortal}/>;

  const shared = { students, schools, scores, selections, notifications, unread:unreadCount, markRead:markAllRead, sidebarOpen, setSidebarOpen };

  const ADMIN_TABS = [
    {id:"dashboard",label:"Dashboard",icon:<ChartBarIcon className="h-4 w-4" style={{ color: S.colors.primary }}/>},
    {id:"enroll",   label:"Enroll Student",icon:<PencilSquareIcon className="h-4 w-4" style={{ color: S.colors.purple }}/>},
    {id:"students", label:"Students",icon:<UsersIcon className="h-4 w-4" style={{ color: S.colors.green }}/>},
    {id:"schools",  label:"Schools",icon:<BuildingLibraryIcon className="h-4 w-4" style={{ color: S.colors.indigo }}/>},
    {id:"academics",label:"Academics",icon:<AcademicCapIcon className="h-4 w-4" style={{ color: S.colors.teal }}/>},
    {id:"scores",   label:"Test Scores",icon:<ClipboardDocumentCheckIcon className="h-4 w-4" style={{ color: S.colors.blue }}/>},
    {id:"pending",  label:"Pending",icon:<ClockIcon className="h-4 w-4" style={{ color: S.colors.yellow }} />,badge:Object.values(selections).filter(s=>s.status==="pending").length},
    {id:"analytics",label:"Analytics",icon:<ChartPieIcon className="h-4 w-4" style={{ color: S.colors.teal }}/>},
    {id:"notifications",label:"Notifications",icon:<BellIcon className="h-4 w-4" style={{ color: S.colors.red }} />,badge:unreadCount},
  ];
  const STUDENT_TABS = [
    {id:"profile",   label:"My Profile",icon:<UserCircleIcon className="h-4 w-4" style={{ color: S.colors.primary }}/>},
    {id:"scores",    label:"My Scores",icon:<ChartBarIcon className="h-4 w-4" style={{ color: S.colors.primary }}/>},
    {id:"selection", label:"School Directories",icon:<BuildingLibraryIcon className="h-4 w-4" style={{ color: S.colors.indigo }}/>},
    {id:"status",    label:"Selection Status",icon:<CheckCircleIcon className="h-4 w-4" style={{ color: S.colors.green }}/>},
    {id:"notifications",label:"Notifications",icon:<BellIcon className="h-4 w-4" style={{ color: S.colors.red }} />,badge:unreadCount},
  ];

  if (portal === "student" && !loggedStudent)
    return <StudentLogin students={students} onLogin={setLoggedStudent} onBack={() => setPortal("home")}/>;

  return (
    <AppShell
      tabs={portal==="admin" ? ADMIN_TABS : STUDENT_TABS}
      activeTab={portal==="admin" ? adminTab : studentTab}
      setActiveTab={portal==="admin" ? setAdminTab : setStudentTab}
      title={portal==="admin" ? "Admin Portal" : "Student Portal"}
      {...shared} onLogout={() => { setPortal("home"); setLoggedStudent(null); }}>

      {portal === "admin" && <>
        {adminTab==="dashboard" && <Dashboard {...shared} />}
        {adminTab==="enroll"    && <EnrollTab onRegister={registerStudent}/>}
        {adminTab==="students"  && <StudentsTab students={students} scores={scores} selections={selections} schools={schools} onStudentUpdate={refreshStudents}/>}
        {adminTab==="schools"   && <SchoolsTab schools={schools} regions={regions}/>} 
        {adminTab==="academics" && <AcademicsTab students={students} scores={scores}/>} 
        {adminTab==="scores"    && <ScoresTab students={students} scores={scores} onSave={saveScores}/>} 
        {adminTab==="pending"   && <PendingTab students={students} schools={schools} selections={selections} onReview={reviewSelection}/>} 
        {adminTab==="analytics" && <AnalyticsTab students={students} scores={scores} selections={selections} schools={schools}/>}
        {adminTab==="notifications" && <NotificationsTab notifications={notifications}/>}
      </>}

      {portal === "student" && (() => {
        const me = students.find(s => s.id === loggedStudent);
        return <>
          {me && studentTab==="profile"   && <StudentProfile student={me} scores={scores[loggedStudent]||{}} selection={selections[loggedStudent]} schools={schools}/>} 
          {me && studentTab==="scores"    && <StudentScoresView scores={scores[loggedStudent]||{}}/>} 
          {me && studentTab==="selection" && <SchoolDirectoriesTab schools={schools}/>} 
          {me && studentTab==="status"    && <SelectionStatusTab student={me} schools={schools} selection={selections[loggedStudent]} onSubmit={submitSelection} onClear={clearSelection} regions={regions}/>}
          {me && studentTab==="notifications" && <NotificationsTab notifications={notifications}/>}
        </>;
      })()}
    </AppShell>
  );
}

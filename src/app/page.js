// "use client";

// import React, { useState, useEffect, useRef } from 'react';
// import { Trash2, Plus, Clock, AlertCircle, CheckCircle, Activity, Calendar, PlayCircle, Edit2, Save, X, List, ChevronLeft, CheckSquare, Square, FileText, GripVertical, Database, LogOut, User as UserIcon } from 'lucide-react';
// import { authUser, logout, checkAuth, getSubjects, saveSubjects } from './actions';

// export default function GateTracker() {
//   const [subjects, setSubjects] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
  
//   // Custom Auth State
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [username, setUsername] = useState("");
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
//   const [authError, setAuthError] = useState("");

//   // Drag & Drop Refs
//   const dragItem = useRef(null);
//   const dragOverItem = useRef(null);
//   const [activeSubjectId, setActiveSubjectId] = useState(null);

//   // Form States
//   const [newSubject, setNewSubject] = useState("");
//   const [duration, setDuration] = useState("");
//   const [customStartDate, setCustomStartDate] = useState("");
//   const [customEndDate, setCustomEndDate] = useState("");
//   const [trackMode, setTrackMode] = useState("manual"); 
//   const [taskName, setTaskName] = useState(""); 
//   const [taskTotal, setTaskTotal] = useState(""); 
//   const [syllabusInput, setSyllabusInput] = useState("");

//   const [currentTime, setCurrentTime] = useState(new Date());

//   // --- Initialize & Fetch Data ---
//   useEffect(() => {
//     async function loadData() {
//       const authData = await checkAuth();
//       setIsAuthenticated(authData.isAuthenticated);
//       setUsername(authData.username || "");

//       if (authData.isAuthenticated) {
//         const data = await getSubjects();
//         setSubjects(data || []);
//       }
//       setIsLoading(false);
//     }
//     loadData();
//   }, []);

//   const saveToDB = async (updatedSubjects) => {
//     setSubjects(updatedSubjects); // Optimistic UI update
//     if (!isAuthenticated) return;
//     await saveSubjects(updatedSubjects);
//   };

//   // --- Auth Handlers ---
//   const handleAuthSubmit = async (e) => {
//     e.preventDefault();
//     setAuthError("");
//     const formData = new FormData(e.target);
//     formData.append('mode', authMode);
    
//     const result = await authUser(formData);
//     if (result.error) {
//         setAuthError(result.error);
//     } else {
//         setShowAuthModal(false);
//         window.location.reload(); // Reload to fetch user data cleanly
//     }
//   };

//   const handleLogout = async () => {
//       await logout();
//       window.location.reload();
//   };

//   // --- MIGRATION TOOL ---
//   const handleMigrate = () => {
//       const localData = localStorage.getItem("gate_subjects_v5");
//       if (localData) {
//           const parsedData = JSON.parse(localData);
//           saveToDB(parsedData);
//           alert("Successfully migrated local data to the database!");
//       } else {
//           alert("No local data found under 'gate_subjects_v5'.");
//       }
//   };

//   // --- Clock ---
//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // --- Drag & Drop Logic ---
//   const handleSort = () => {
//     if (dragItem.current === null || dragOverItem.current === null) return;
//     let _subjects = [...subjects];
//     const draggedItemContent = _subjects.splice(dragItem.current, 1)[0];
//     _subjects.splice(dragOverItem.current, 0, draggedItemContent);
//     dragItem.current = null;
//     dragOverItem.current = null;
//     saveToDB(_subjects);
//   };

//   // --- Parsing Logic for Syllabus ---
//   // --- Parsing Logic for Syllabus ---
//   const parseSyllabus = (text) => {
//     const lines = text.split('\n');
//     const modules = [];
//     let currentModule = null;

//     for (let i = 0; i < lines.length; i++) {
//       let line = lines[i].trim();
//       if (!line || line.startsWith('===')) continue;

//       if (!line.startsWith('-')) {
//         // Added 'i' to guarantee a unique ID for the module
//         currentModule = { id: `mod_${Date.now()}_${i}`, title: line, lectures: [] };
//         modules.push(currentModule);
//       } else {
//         const timeMatch = line.match(/\[Timing:\s*([^\]]+)\]/i) || line.match(/\[Time:\s*([^\]]+)\]/i);
//         let durationMin = 0;
//         let cleanTitle = line.replace(/^-?\s*/, ''); 
        
//         if (timeMatch) {
//           const timeStr = timeMatch[1].trim();
//           if (timeStr.toUpperCase() !== 'NULL') {
//              const parts = timeStr.split(':');
//              if (parts.length >= 2) durationMin = parseInt(parts[0], 10);
//              else durationMin = parseInt(timeStr, 10) || 0;
//           }
//           cleanTitle = cleanTitle.replace(/\[Timing:\s*([^\]]+)\]/i, '').replace(/\[Time:\s*([^\]]+)\]/i, '').trim();
//         }

//         if (!currentModule) {
//             currentModule = { id: `mod_general_${Date.now()}_${i}`, title: "General Lectures", lectures: [] };
//             modules.push(currentModule);
//         }

//         currentModule.lectures.push({
//           // Added 'i' to guarantee a unique ID for every single lecture
//           id: `lec_${Date.now()}_${i}`, 
//           title: cleanTitle,
//           durationMin: durationMin,
//           isCompleted: false
//         });
//       }
//     }
//     return modules;
//   };

//   // --- Actions ---
//   const addSubject = (e) => {
//     e.preventDefault();
//     if (!newSubject) return;

//     let startDate = customStartDate ? new Date(customStartDate) : new Date();
//     let endDate;
//     let durationDays;

//     if (customEndDate) {
//       endDate = new Date(customEndDate);
//       endDate.setHours(23, 59, 59, 999);
//       durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); 
//     } else if (duration) {
//       durationDays = parseFloat(duration);
//       endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
//     } else {
//         alert("Please provide either a Duration (Days) or an End Date.");
//         return;
//     }

//     let modules = [];
//     let finalTaskTotal = 0;
//     let finalTaskName = "Tasks";

//     if (trackMode === "syllabus" && syllabusInput.trim()) {
//         modules = parseSyllabus(syllabusInput);
//         finalTaskTotal = modules.reduce((acc, mod) => acc + mod.lectures.length, 0);
//         finalTaskName = "Lectures";
//     } else if (trackMode === "manual" && taskTotal) {
//         finalTaskTotal = parseInt(taskTotal || 0);
//         finalTaskName = taskName || "Tasks";
//     }

//     const newEntry = {
//       id: Date.now(),
//       title: newSubject,
//       startDate: startDate.toISOString(),
//       endDate: endDate.toISOString(),
//       durationDays: durationDays,
//       taskName: finalTaskName,
//       taskTotal: finalTaskTotal,
//       taskCompleted: 0,
//       isManuallyCompleted: false,
//       modules: modules
//     };

//     saveToDB([...subjects, newEntry]);
    
//     setNewSubject(""); setDuration(""); setCustomStartDate(""); setCustomEndDate("");
//     setTrackMode("manual"); setTaskName(""); setTaskTotal(""); setSyllabusInput("");
//   };

//   const deleteSubject = (id) => {
//     saveToDB(subjects.filter((s) => s.id !== id));
//     if (activeSubjectId === id) setActiveSubjectId(null);
//   };

//   const updateSubject = (id, newStartIso, newEndIso, newTaskTotal, isManuallyCompleted) => {
//     const updated = subjects.map(s => {
//         if (s.id === id) {
//             const start = new Date(newStartIso);
//             const end = new Date(newEndIso);
//             end.setHours(23, 59, 59, 999);
//             return {
//                 ...s,
//                 startDate: start.toISOString(),
//                 endDate: end.toISOString(),
//                 durationDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
//                 taskTotal: newTaskTotal !== undefined ? Math.max(s.taskCompleted, parseInt(newTaskTotal || 0)) : s.taskTotal,
//                 isManuallyCompleted: isManuallyCompleted
//             };
//         }
//         return s;
//     });
//     saveToDB(updated);
//   };

//   const addToProgress = (id, amountToAdd) => {
//     const val = parseInt(amountToAdd);
//     if (isNaN(val) || val === 0) return;
//     const updated = subjects.map(s => {
//         if (s.id === id) {
//             return { ...s, taskCompleted: Math.min((s.taskCompleted || 0) + val, s.taskTotal) }; 
//         }
//         return s;
//     });
//     saveToDB(updated);
//   };

//   const toggleLecture = (subjectId, moduleId, lectureId) => {
//     const updated = subjects.map(s => {
//         if (s.id !== subjectId) return s;
//         const newModules = s.modules.map(m => {
//             if (m.id !== moduleId) return m;
//             return {
//                 ...m,
//                 lectures: m.lectures.map(l => l.id === lectureId ? { ...l, isCompleted: !l.isCompleted } : l)
//             };
//         });
//         const newCompletedCount = newModules.reduce((acc, m) => acc + m.lectures.filter(l => l.isCompleted).length, 0);
//         return { ...s, modules: newModules, taskCompleted: newCompletedCount };
//     });
//     saveToDB(updated);
//   };

//   // --- RENDER DETAIL VIEW ---
//   if (activeSubjectId) {
//       const subject = subjects.find(s => s.id === activeSubjectId);
//       if (!subject) return null;
//       return <SyllabusDetailView subject={subject} onBack={() => setActiveSubjectId(null)} onToggleLecture={toggleLecture} />;
//   }

//   // --- RENDER DASHBOARD ---
//   return (
//     <div className="min-h-screen bg-gray-900 text-gray-100 font-mono flex flex-col">
      
//       {/* AUTH MODAL */}
//       {showAuthModal && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
//             <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg w-full max-w-sm shadow-2xl relative">
//                 <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
//                 <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">
//                     {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
//                 </h2>
//                 <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
//                     <input type="text" name="username" placeholder="Username" required className="bg-gray-700 border border-gray-600 rounded px-3 py-2 outline-none focus:border-blue-500 text-white" />
//                     <input type="password" name="password" placeholder="Password" required className="bg-gray-700 border border-gray-600 rounded px-3 py-2 outline-none focus:border-blue-500 text-white" />
//                     {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
//                     <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition-colors mt-2">
//                         {authMode === 'login' ? 'Login' : 'Sign Up'}
//                     </button>
//                 </form>
//                 <div className="mt-4 text-center text-sm text-gray-400">
//                     {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
//                     <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-blue-400 hover:underline">
//                         {authMode === 'login' ? 'Sign Up' : 'Login'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//       )}

//       <header className="p-4 bg-gray-800 border-b border-gray-700 shadow-lg z-20">
//         <div className="flex items-center justify-between mb-4">
//             <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2">
//                 <Activity /> GATE CSE TRACKER
//             </h1>
            
//             {/* Custom Auth UI Nav */}
//             <div className="flex items-center gap-4">
//                 {!isAuthenticated ? (
//                     <button onClick={() => setShowAuthModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded font-bold transition-colors flex items-center gap-2 text-sm">
//                         <UserIcon size={16}/> Log In
//                     </button>
//                 ) : (
//                     <>
//                         {/* <button onClick={handleMigrate} className="flex items-center gap-2 text-xs bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 border border-yellow-500/50 px-3 py-1.5 rounded transition-colors" title="Move local storage data to cloud">
//                             <Database size={14} /> Migrate Local Data
//                         </button> */}
//                         <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer" title="Logout">
//                         <div className="flex items-center gap-3 bg-gray-700/50 px-3 py-1.5 rounded border border-gray-600">
//                             <span className="text-sm font-bold text-gray-300">Hi, {username}</span>
                            
//                                 <LogOut size={16} />
//                         </div>
//                             </button>
//                     </>
//                 )}
//             </div>
//         </div>

//         {isAuthenticated && (
//             <form onSubmit={addSubject} className="flex flex-col gap-4">
//                 <div className="flex flex-wrap gap-4 items-end bg-gray-800/50">
//                     <div className="flex flex-col gap-1">
//                         <label className="text-xs text-gray-400">Subject Name</label>
//                         <input required type="text" placeholder="e.g. DBMS" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-48 outline-none focus:border-blue-500" />
//                     </div>
//                     <div className="flex flex-col gap-1">
//                         <label className="text-xs text-gray-400">Start Date (Optional)</label>
//                         <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-36 outline-none text-sm text-gray-300 focus:border-blue-500" />
//                     </div>
//                     <div className="flex flex-col gap-1">
//                         <label className={`text-xs ${customEndDate ? 'text-gray-600' : 'text-gray-400'}`}>Days Duration</label>
//                         <input type="number" placeholder="15" value={duration} disabled={!!customEndDate} onChange={(e) => setDuration(e.target.value)} className={`bg-gray-700 border border-gray-600 rounded px-3 py-2 w-24 outline-none ${customEndDate ? 'opacity-30' : ''}`} />
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-gray-500 font-bold px-2">OR</div>
//                     <div className="flex flex-col gap-1">
//                         <label className={`text-xs ${duration ? 'text-gray-600' : 'text-gray-400'}`}>End Date</label>
//                         <input type="date" value={customEndDate} disabled={!!duration} onChange={(e) => setCustomEndDate(e.target.value)} className={`bg-gray-700 border border-gray-600 rounded px-3 py-2 w-36 outline-none text-sm text-gray-300 ${duration ? 'opacity-30' : ''}`} />
//                     </div>
//                 </div>

//                 <div className="flex flex-col gap-3 border-t border-gray-700 pt-3">
//                     <div className="flex items-center gap-4">
//                         <span className="text-sm text-gray-400">Task Tracking Setup:</span>
//                         <label className="flex items-center gap-2 cursor-pointer">
//                             <input type="radio" name="trackMode" checked={trackMode === "none"} onChange={() => setTrackMode("none")} className="text-blue-500 bg-gray-700" />
//                             <span className="text-sm text-gray-300">None</span>
//                         </label>
//                         <label className="flex items-center gap-2 cursor-pointer">
//                             <input type="radio" name="trackMode" checked={trackMode === "manual"} onChange={() => setTrackMode("manual")} className="text-blue-500 bg-gray-700" />
//                             <span className="text-sm text-gray-300">Manual Numbers</span>
//                         </label>
//                         <label className="flex items-center gap-2 cursor-pointer">
//                             <input type="radio" name="trackMode" checked={trackMode === "syllabus"} onChange={() => setTrackMode("syllabus")} className="text-blue-500 bg-gray-700" />
//                             <span className="text-sm text-gray-300 text-blue-400 font-semibold">Paste Syllabus (Auto-Todo)</span>
//                         </label>
//                     </div>

//                     {trackMode === "manual" && (
//                         <div className="flex gap-2 items-center">
//                             <input type="text" placeholder="Unit (e.g. PYQs)" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 w-40 text-sm outline-none focus:border-blue-500" />
//                             <input type="number" placeholder="Total (e.g. 150)" value={taskTotal} onChange={(e) => setTaskTotal(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 w-32 text-sm outline-none focus:border-blue-500" />
//                         </div>
//                     )}

//                     {trackMode === "syllabus" && (
//                         <div className="flex flex-col gap-2">
//                             <textarea 
//                                 placeholder="Paste your syllabus here... (e.g., - Lecture 1 - Title [Timing: 30:00])" 
//                                 value={syllabusInput} 
//                                 onChange={(e) => setSyllabusInput(e.target.value)} 
//                                 className="bg-gray-700/50 border border-gray-600 rounded p-3 w-full h-32 text-sm outline-none focus:border-blue-500 resize-y font-mono"
//                             />
//                         </div>
//                     )}

//                     <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded flex items-center justify-center gap-2 transition-colors text-sm w-48 mt-2">
//                         <Plus size={16} /> Add Tracker
//                     </button>
//                 </div>
//             </form>
//         )}
//       </header>

//       <main className="flex-grow overflow-y-auto pb-20 p-4">
//         {isLoading ? (
//              <div className="h-full flex items-center justify-center text-gray-500 text-xl">Loading Data...</div>
//         ) : !isAuthenticated ? (
//             <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
//                 <Clock size={64} className="opacity-50" />
//                 <p className="text-xl">Please log in to view your tracker.</p>
//                 <button onClick={() => setShowAuthModal(true)} className="bg-blue-600/20 text-blue-400 border border-blue-500/50 px-6 py-2 rounded font-bold hover:bg-blue-600/40 transition-colors">
//                     Log In
//                 </button>
//             </div>
//         ) : subjects.length === 0 ? (
//           <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
//             <Clock size={64} className="mb-4" />
//             <p className="text-xl">No active subjects.</p>
//           </div>
//         ) : (
//           <div className="flex flex-col gap-4">
//             {subjects.map((subject, index) => (
//               <div 
//                 key={subject.id}
//                 draggable
//                 onDragStart={() => dragItem.current = index}
//                 onDragEnter={() => dragOverItem.current = index}
//                 onDragEnd={handleSort}
//                 onDragOver={(e) => e.preventDefault()}
//                 className="cursor-move"
//               >
//                   <SubjectStrip 
//                     subject={subject} 
//                     currentTime={currentTime} 
//                     onDelete={deleteSubject}
//                     onAddToProgress={addToProgress}
//                     onUpdate={updateSubject}
//                     onOpenDetail={() => setActiveSubjectId(subject.id)}
//                   />
//               </div>
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// // --- SUB-COMPONENT: DETAIL VIEW ---
// function SyllabusDetailView({ subject, onBack, onToggleLecture }) {
//     let totalMins = 0; let completedMins = 0;
//     subject.modules.forEach(m => {
//         m.lectures.forEach(l => {
//             totalMins += l.durationMin;
//             if (l.isCompleted) completedMins += l.durationMin;
//         });
//     });

//     const isFullyComplete = subject.taskTotal > 0 && subject.taskCompleted >= subject.taskTotal;
//     const progressPerc = subject.taskTotal > 0 ? (subject.taskCompleted / subject.taskTotal) * 100 : 0;
//     const hrsTotal = (totalMins / 60).toFixed(1);
//     const hrsLeft = ((totalMins - completedMins) / 60).toFixed(1);

//     return (
//         <div className="min-h-screen bg-gray-900 text-gray-100 font-mono flex flex-col">
//             <div className="sticky top-0 z-30 bg-gray-800 border-b border-gray-700 shadow-xl p-4">
//                 <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
//                     <ChevronLeft size={20} /> Back to Dashboard
//                 </button>
//                 <div className="flex justify-between items-end">
//                     <div>
//                         <h1 className="text-3xl font-bold text-white mb-2">{subject.title}</h1>
//                         <div className="flex gap-4 text-sm text-gray-400">
//                             <span><List size={14} className="inline mr-1"/> {subject.taskCompleted} / {subject.taskTotal} Lectures</span>
//                             <span><Clock size={14} className="inline mr-1"/> {hrsLeft} hrs remaining (of {hrsTotal} hrs)</span>
//                         </div>
//                     </div>
//                     {isFullyComplete && <div className="text-green-500 font-bold border border-green-500 px-3 py-1 rounded">ALL COMPLETED</div>}
//                 </div>
//                 <div className="w-full h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
//                     <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progressPerc}%` }}></div>
//                 </div>
//             </div>

//             <div className="flex-grow p-4 overflow-y-auto max-w-5xl mx-auto w-full">
//                 {subject.modules.map((mod) => {
//                     const modCompleted = mod.lectures.filter(l => l.isCompleted).length;
//                     return (
//                         <div key={mod.id} className="mb-8 bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden">
//                             <div className="bg-gray-800 p-3 border-b border-gray-700 flex justify-between items-center">
//                                 <h2 className="font-bold text-lg text-blue-300">{mod.title}</h2>
//                                 <span className="text-xs text-gray-500 font-bold bg-gray-900 px-2 py-1 rounded">
//                                     {modCompleted}/{mod.lectures.length}
//                                 </span>
//                             </div>
//                             <div className="divide-y divide-gray-700/50">
//                                 {mod.lectures.map(lecture => (
//                                     <label key={lecture.id} className={`flex items-start gap-4 p-3 cursor-pointer hover:bg-gray-700/40 transition-colors ${lecture.isCompleted ? 'opacity-60 bg-gray-800/20' : ''}`}>
//                                         <div className="mt-1">
//                                             <input type="checkbox" checked={lecture.isCompleted} onChange={() => onToggleLecture(subject.id, mod.id, lecture.id)} className="sr-only" />
//                                             {lecture.isCompleted ? <CheckSquare className="text-green-500" size={20} /> : <Square className="text-gray-500" size={20} />}
//                                         </div>
//                                         <div className="flex-grow">
//                                             <p className={`text-sm ${lecture.isCompleted ? 'line-through text-gray-500' : 'text-gray-200'}`}>{lecture.title}</p>
//                                         </div>
//                                         <div className="text-xs text-gray-500 font-mono bg-gray-900/50 px-2 py-1 rounded whitespace-nowrap">
//                                             {lecture.durationMin > 0 ? `${lecture.durationMin} mins` : 'No Time'}
//                                         </div>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }

// // --- SUB-COMPONENT: DASHBOARD STRIP ---
// function SubjectStrip({ subject, currentTime, onDelete, onAddToProgress, onUpdate, onOpenDetail }) {
//   const [addAmount, setAddAmount] = useState(""); 
//   const [isEditing, setIsEditing] = useState(false);
  
//   const [tempStart, setTempStart] = useState("");
//   const [tempEnd, setTempEnd] = useState("");
//   const [tempTaskTotal, setTempTaskTotal] = useState("");
//   const [tempIsCompleted, setTempIsCompleted] = useState(false);

//   const start = new Date(subject.startDate);
//   const end = new Date(subject.endDate);
//   const timeElapsed = currentTime - start;
//   const timeLeft = end - currentTime;
//   const totalDuration = end - start;

//   const isBeforeStart = timeElapsed < 0;
//   const isEnded = timeLeft <= 0 && !isBeforeStart;
//   const isRunning = !isBeforeStart && !isEnded;
//   const isFullyComplete = subject.isManuallyCompleted || (subject.taskTotal > 0 && subject.taskCompleted >= subject.taskTotal);

//   const daysToStart = Math.ceil(Math.abs(timeElapsed) / (1000 * 60 * 60 * 24));
//   const daysRunningLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

//   let statusText = ""; let statusColor = ""; let displayValue = 0; let displayLabel = "";

//   if (isFullyComplete) { statusText = "Completed"; statusColor = "text-green-500"; displayValue = 0; displayLabel = "Finished"; } 
//   else if (isBeforeStart) { statusText = "Upcoming"; statusColor = "text-orange-500"; displayValue = daysToStart; displayLabel = "Days to Start"; } 
//   else if (isEnded) { statusText = "Ended"; statusColor = "text-red-500"; displayValue = 0; displayLabel = "Days Left"; } 
//   else { statusText = "Running"; statusColor = "text-green-500"; displayValue = daysRunningLeft; displayLabel = "Days Left"; }

//   let progress = isFullyComplete || isEnded ? 100 : isRunning ? Math.min(100, Math.max(0, (timeElapsed / totalDuration) * 100)) : 0;

//   const hasTask = subject.taskTotal > 0;
//   const hasSyllabus = subject.modules && subject.modules.length > 0;
//   const remainingTasks = Math.max(0, subject.taskTotal - subject.taskCompleted);
  
//   const activeDaysForPace = isBeforeStart ? (totalDuration / (1000 * 60 * 60 * 24)) : Math.max(0, timeLeft / (1000 * 60 * 60 * 24));
//   const dailyRate = hasTask ? (remainingTasks / Math.max(0.5, activeDaysForPace)).toFixed(1) : 0;
//   const taskProgress = hasTask ? (subject.taskCompleted / subject.taskTotal) * 100 : 0;

//   let totalMins = 0; let completedMins = 0;
//   if (hasSyllabus) {
//       subject.modules.forEach(m => {
//           m.lectures.forEach(l => { totalMins += l.durationMin; if (l.isCompleted) completedMins += l.durationMin; });
//       });
//   }
//   const hrsLeft = ((totalMins - completedMins) / 60).toFixed(1);

//   const handleAddSubmit = (e) => {
//     e.preventDefault();
//     if(!addAmount) return;
//     onAddToProgress(subject.id, addAmount);
//     setAddAmount(""); 
//   };

//   const startEditing = () => {
//     setTempStart(new Date(subject.startDate).toISOString().split('T')[0]);
//     setTempEnd(new Date(subject.endDate).toISOString().split('T')[0]);
//     setTempTaskTotal(subject.taskTotal);
//     setTempIsCompleted(subject.isManuallyCompleted || false);
//     setIsEditing(true);
//   };

//   const saveEdit = () => {
//     if(tempStart && tempEnd) {
//         onUpdate(subject.id, tempStart, tempEnd, tempTaskTotal, tempIsCompleted);
//         setIsEditing(false);
//     }
//   };

//   return (
//     <div className="relative w-full border border-gray-700 flex flex-col rounded-lg bg-gray-800/40 hover:bg-gray-800 transition-colors group overflow-hidden">
      
//       {/* Background Time Progress */}
//       <div className="absolute top-0 left-0 h-full bg-blue-900/10 pointer-events-none transition-all duration-1000" style={{ width: `${progress}%` }} />
//       <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-700">
//         <div className={`h-full transition-all duration-1000 ${isFullyComplete ? 'bg-green-500' : isEnded ? 'bg-red-500' : isBeforeStart ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }} />
//       </div>

//       {/* Grid Layout */}
//       <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 items-center w-full">
        
//         {/* Drag Handle & Info - 5 columns */}
//         <div className="lg:col-span-5 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-700/50 pb-4 lg:pb-0 lg:pr-6">
//           <div className="flex justify-between items-start mb-2">
//              <div className="flex items-center gap-3">
//                  <GripVertical className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing" size={20} />
//                  <h2 className={`text-2xl font-bold truncate flex items-center gap-2 cursor-pointer ${isFullyComplete ? 'text-green-400' : 'text-white hover:text-blue-300 transition-colors'}`} onClick={hasSyllabus ? onOpenDetail : undefined} title={subject.title}>
//                    {subject.title} {isFullyComplete && <CheckCircle size={20} />}
//                  </h2>
//              </div>
//              {!isEditing && (
//                  <button onClick={startEditing} className="text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
//                      <Edit2 size={16} />
//                  </button>
//              )}
//           </div>

//           {isEditing ? (
//               <div className="flex flex-col gap-3 my-2 bg-gray-900/90 p-3 rounded-lg border border-gray-600 shadow-xl z-50">
//                   <div className="flex gap-3">
//                     <div className="flex flex-col gap-1 w-1/2">
//                         <label className="text-[10px] text-gray-400 font-semibold uppercase">Start</label>
//                         <input type="date" value={tempStart} onChange={(e) => setTempStart(e.target.value)} className="bg-gray-800 text-xs p-1.5 rounded outline-none border border-gray-600 focus:border-blue-500" />
//                     </div>
//                     <div className="flex flex-col gap-1 w-1/2">
//                         <label className="text-[10px] text-gray-400 font-semibold uppercase">End</label>
//                         <input type="date" value={tempEnd} onChange={(e) => setTempEnd(e.target.value)} className="bg-gray-800 text-xs p-1.5 rounded outline-none border border-gray-600 focus:border-blue-500" />
//                     </div>
//                   </div>
//                   <div className="flex gap-2 mt-1 pt-2 border-t border-gray-700">
//                       <button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded flex-1 flex justify-center items-center gap-2 text-xs font-bold"><Save size={14}/> Save</button>
//                       <button onClick={() => setIsEditing(false)} className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded w-10 flex justify-center items-center"><X size={14}/></button>
//                   </div>
//               </div>
//           ) : (
//              <div className="text-xs text-gray-400 mb-4 flex flex-col gap-1 ml-8">
//                  <span className="flex items-center gap-1"><Calendar size={12}/> Start: {start.toLocaleDateString()}</span>
//                  <span className="flex items-center gap-1"><Clock size={12}/> Target: {end.toLocaleDateString()}</span>
//              </div>
//           )}

//           {!isEditing && hasTask && !isFullyComplete && (
//             <div className="bg-gray-900/60 p-3 rounded border border-gray-700 shadow-inner ml-8">
//                 <div className="flex justify-between items-center text-xs text-gray-300 mb-1">
//                     <span>{hasSyllabus ? 'Completed Lectures:' : `Completed ${subject.taskName}:`}</span>
//                     <span className="font-bold text-blue-400">{subject.taskCompleted} / {subject.taskTotal}</span>
//                 </div>
//                 <div className="w-full h-1.5 bg-gray-700 rounded-full mb-3 overflow-hidden">
//                     <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${taskProgress}%` }}></div>
//                 </div>
                
//                 {hasSyllabus ? (
//                     <button onClick={onOpenDetail} className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors">
//                         <FileText size={14} /> Open Checklist
//                     </button>
//                 ) : (
//                     <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
//                         <span className="text-xs text-gray-500 whitespace-nowrap">Today I did:</span>
//                         <input type="number" value={addAmount} placeholder="0" onChange={(e) => setAddAmount(e.target.value)} className="bg-gray-800 border border-gray-600 rounded w-16 px-2 py-1 text-sm text-center focus:border-blue-500 outline-none" />
//                         <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded"><Plus size={16} /></button>
//                     </form>
//                 )}
//             </div>
//           )}
//         </div>

//         {/* Pace / Time Center - 4 columns */}
//         <div className="lg:col-span-4 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-700/50 pb-4 lg:pb-0 px-4">
//             {isFullyComplete ? (
//                  <div className="text-green-500 font-bold text-3xl flex items-center gap-3 tracking-widest"><CheckCircle size={36} /> DONE</div>
//             ) : hasSyllabus && !isEnded ? (
//                 <div className="text-center w-full max-w-xs">
//                     <div className="text-sm text-gray-400 uppercase tracking-widest mb-1 border-b border-gray-700 pb-1">Time Tracking</div>
//                     <div className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-2 my-2">
//                         <Clock size={28} /> {hrsLeft} <span className="text-sm text-gray-500 uppercase tracking-widest mt-2">hrs left</span>
//                     </div>
//                     <div className="text-xs text-gray-400 flex justify-between px-2">
//                         <span>Pace: {dailyRate} / day</span>
//                         <span>{remainingTasks} Vids Left</span>
//                     </div>
//                 </div>
//             ) : hasTask && !hasSyllabus && !isEnded ? (
//                  <div className="text-center">
//                     <div className="text-sm text-gray-400 uppercase tracking-widest mb-1">Required Pace</div>
//                     <div className="text-5xl font-bold text-white flex items-end justify-center gap-2 leading-none">
//                         {dailyRate}<span className="text-lg text-blue-400 font-medium mb-1">/day</span>
//                     </div>
//                 </div>
//             ) : isEnded && remainingTasks > 0 ? (
//                 <div className="text-red-500 font-bold text-2xl flex items-center gap-2"><AlertCircle /> TIME UP</div>
//             ) : (
//                 <div className="text-gray-600 font-bold text-xl flex flex-col items-center">
//                     <PlayCircle size={32} className="mb-2"/> <span>TRACKING TIME</span>
//                 </div>
//             )}
//         </div>

//         {/* Days Countdown Right - 3 columns */}
//         <div className="lg:col-span-3 flex flex-col items-center justify-center relative">
//              <div className="text-center flex flex-col items-center justify-center">
//                 {isEnded && !isFullyComplete ? (
//                     <div className={`text-4xl font-bold ${statusColor} tracking-wider`}>ENDED</div>
//                 ) : isFullyComplete ? (
//                     <div className={`text-4xl font-bold ${statusColor} tracking-wider`}>FINISHED</div>
//                 ) : (
//                     <>
//                         <div className={`text-6xl font-bold ${statusColor}`}>{displayValue}</div>
//                         <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">{displayLabel}</div>
//                         <div className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-gray-900/60 border border-gray-700 ${statusColor}`}>
//                             STATUS: {statusText}
//                         </div>
//                     </>
//                 )}
//             </div>
            
//             <button onClick={() => onDelete(subject.id)} className="absolute top-0 right-0 lg:top-1 lg:-right-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2" title="Delete Tracker">
//                 <Trash2 size={20} />
//             </button>
//         </div>

//       </div>
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Clock, AlertCircle, CheckCircle, Activity, Calendar, PlayCircle, Edit2, Save, X, List, ChevronLeft, ChevronDown, ChevronRight, CheckSquare, Square, FileText, GripVertical, Database, LogOut, User as UserIcon } from 'lucide-react';
import { authUser, logout, checkAuth, getSubjects, saveSubjects } from './actions';

export default function GateTracker() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Custom Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState("");

  // Drag & Drop Refs
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [activeSubjectId, setActiveSubjectId] = useState(null);

  // Form States
  const [newSubject, setNewSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [trackMode, setTrackMode] = useState("manual"); 
  const [taskName, setTaskName] = useState(""); 
  const [taskTotal, setTaskTotal] = useState(""); 
  const [syllabusInput, setSyllabusInput] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date());

  // --- Initialize & Fetch Data ---
  useEffect(() => {
    async function loadData() {
      const authData = await checkAuth();
      setIsAuthenticated(authData.isAuthenticated);
      setUsername(authData.username || "");

      if (authData.isAuthenticated) {
        const data = await getSubjects();
        setSubjects(data || []);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const saveToDB = async (updatedSubjects) => {
    setSubjects(updatedSubjects); // Optimistic UI update
    if (!isAuthenticated) return;
    await saveSubjects(updatedSubjects);
  };

  // --- Auth Handlers ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const formData = new FormData(e.target);
    formData.append('mode', authMode);
    
    const result = await authUser(formData);
    if (result.error) {
        setAuthError(result.error);
    } else {
        setShowAuthModal(false);
        window.location.reload(); 
    }
  };

  const handleLogout = async () => {
      await logout();
      window.location.reload();
  };

  const handleMigrate = () => {
      const localData = localStorage.getItem("gate_subjects_v5");
      if (localData) {
          const parsedData = JSON.parse(localData);
          saveToDB(parsedData);
          alert("Successfully migrated local data to the database!");
      } else {
          alert("No local data found under 'gate_subjects_v5'.");
      }
  };

  // --- Clock ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Drag & Drop Logic ---
  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    let _subjects = [...subjects];
    const draggedItemContent = _subjects.splice(dragItem.current, 1)[0];
    _subjects.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    saveToDB(_subjects);
  };

  // --- Parsing Logic for Syllabus ---
  const parseSyllabus = (text) => {
    const lines = text.split('\n');
    const modules = [];
    let currentModule = null;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line || line.startsWith('===')) continue;

      if (!line.startsWith('-')) {
        currentModule = { id: `mod_${Date.now()}_${i}`, title: line, lectures: [], isExpanded: false };
        modules.push(currentModule);
      } else {
        const timeMatch = line.match(/\[Timing:\s*([^\]]+)\]/i) || line.match(/\[Time:\s*([^\]]+)\]/i);
        let durationMin = 0;
        let cleanTitle = line.replace(/^-?\s*/, ''); 
        
        if (timeMatch) {
          const timeStr = timeMatch[1].trim();
          if (timeStr.toUpperCase() !== 'NULL') {
             const parts = timeStr.split(':');
             if (parts.length >= 2) durationMin = parseInt(parts[0], 10);
             else durationMin = parseInt(timeStr, 10) || 0;
          }
          cleanTitle = cleanTitle.replace(/\[Timing:\s*([^\]]+)\]/i, '').replace(/\[Time:\s*([^\]]+)\]/i, '').trim();
        }

        if (!currentModule) {
            currentModule = { id: `mod_general_${Date.now()}_${i}`, title: "General Lectures", lectures: [], isExpanded: false };
            modules.push(currentModule);
        }

        currentModule.lectures.push({
          id: `lec_${Date.now()}_${i}`,
          title: cleanTitle,
          durationMin: durationMin,
          isCompleted: false
        });
      }
    }
    return modules;
  };

  // --- Actions ---
  const addSubject = (e) => {
    e.preventDefault();
    if (!newSubject) return;

    let startDate = customStartDate ? new Date(customStartDate) : new Date();
    let endDate;
    let durationDays;

    if (customEndDate) {
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
      durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); 
    } else if (duration) {
      durationDays = parseFloat(duration);
      endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    } else {
        alert("Please provide either a Duration (Days) or an End Date.");
        return;
    }

    let modules = [];
    let finalTaskTotal = 0;
    let finalTaskName = "Tasks";

    if (trackMode === "syllabus" && syllabusInput.trim()) {
        modules = parseSyllabus(syllabusInput);
        finalTaskTotal = modules.reduce((acc, mod) => acc + mod.lectures.length, 0);
        finalTaskName = "Lectures";
    } else if (trackMode === "manual" && taskTotal) {
        finalTaskTotal = parseInt(taskTotal || 0);
        finalTaskName = taskName || "Tasks";
    }

    const newEntry = {
      id: Date.now(),
      title: newSubject,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: durationDays,
      taskName: finalTaskName,
      taskTotal: finalTaskTotal,
      taskCompleted: 0,
      isManuallyCompleted: false,
      modules: modules
    };

    saveToDB([...subjects, newEntry]);
    
    setNewSubject(""); setDuration(""); setCustomStartDate(""); setCustomEndDate("");
    setTrackMode("manual"); setTaskName(""); setTaskTotal(""); setSyllabusInput("");
  };

  const deleteSubject = (id) => {
    saveToDB(subjects.filter((s) => s.id !== id));
    if (activeSubjectId === id) setActiveSubjectId(null);
  };

  const updateSubject = (id, newStartIso, newEndIso, newTaskTotal, isManuallyCompleted) => {
    const updated = subjects.map(s => {
        if (s.id === id) {
            const start = new Date(newStartIso);
            const end = new Date(newEndIso);
            end.setHours(23, 59, 59, 999);
            return {
                ...s,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                durationDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
                taskTotal: newTaskTotal !== undefined ? Math.max(s.taskCompleted, parseInt(newTaskTotal || 0)) : s.taskTotal,
                isManuallyCompleted: isManuallyCompleted
            };
        }
        return s;
    });
    saveToDB(updated);
  };

  const addToProgress = (id, amountToAdd) => {
    const val = parseInt(amountToAdd);
    if (isNaN(val) || val === 0) return;
    const updated = subjects.map(s => {
        if (s.id === id) {
            return { ...s, taskCompleted: Math.min((s.taskCompleted || 0) + val, s.taskTotal) }; 
        }
        return s;
    });
    saveToDB(updated);
  };

  // --- SYLLABUS ACTIONS ---
  const toggleLecture = (subjectId, moduleId, lectureId) => {
    const updated = subjects.map(s => {
        if (s.id !== subjectId) return s;
        const newModules = s.modules.map(m => {
            if (m.id !== moduleId) return m;
            return {
                ...m,
                lectures: m.lectures.map(l => l.id === lectureId ? { ...l, isCompleted: !l.isCompleted } : l)
            };
        });
        const newCompletedCount = newModules.reduce((acc, m) => acc + m.lectures.filter(l => l.isCompleted).length, 0);
        return { ...s, modules: newModules, taskCompleted: newCompletedCount };
    });
    saveToDB(updated);
  };

  // NEW: Master Checkbox for entire module
  const toggleModuleComplete = (subjectId, moduleId) => {
    const updated = subjects.map(s => {
        if (s.id !== subjectId) return s;
        const newModules = s.modules.map(m => {
            if (m.id !== moduleId) return m;
            const allCompleted = m.lectures.length > 0 && m.lectures.every(l => l.isCompleted);
            return {
                ...m,
                lectures: m.lectures.map(l => ({ ...l, isCompleted: !allCompleted })) // Toggle all opposite of current collective state
            };
        });
        const newCompletedCount = newModules.reduce((acc, m) => acc + m.lectures.filter(l => l.isCompleted).length, 0);
        return { ...s, modules: newModules, taskCompleted: newCompletedCount };
    });
    saveToDB(updated);
  };

  const toggleModuleExpand = (subjectId, moduleId) => {
    const updated = subjects.map(s => {
        if (s.id !== subjectId) return s;
        const newModules = s.modules.map(m => 
            m.id === moduleId ? { ...m, isExpanded: !m.isExpanded } : m
        );
        return { ...s, modules: newModules };
    });
    saveToDB(updated);
  };

  const deleteModule = (subjectId, moduleId) => {
    if (!window.confirm("Are you sure you want to delete this entire module?")) return;
    const updated = subjects.map(s => {
        if (s.id !== subjectId) return s;
        const newModules = s.modules.filter(m => m.id !== moduleId);
        const newTaskTotal = newModules.reduce((acc, m) => acc + m.lectures.length, 0);
        const newTaskCompleted = newModules.reduce((acc, m) => acc + m.lectures.filter(l => l.isCompleted).length, 0);
        return { ...s, modules: newModules, taskTotal: newTaskTotal, taskCompleted: newTaskCompleted };
    });
    saveToDB(updated);
  };

  const deleteLecture = (subjectId, moduleId, lectureId) => {
    const updated = subjects.map(s => {
        if (s.id !== subjectId) return s;
        const newModules = s.modules.map(m => {
            if (m.id !== moduleId) return m;
            return { ...m, lectures: m.lectures.filter(l => l.id !== lectureId) };
        });
        const newTaskTotal = newModules.reduce((acc, m) => acc + m.lectures.length, 0);
        const newTaskCompleted = newModules.reduce((acc, m) => acc + m.lectures.filter(l => l.isCompleted).length, 0);
        return { ...s, modules: newModules, taskTotal: newTaskTotal, taskCompleted: newTaskCompleted };
    });
    saveToDB(updated);
  };

  // NEW: Add Custom Module
  const addModule = (subjectId, title) => {
      const updated = subjects.map(s => {
          if (s.id !== subjectId) return s;
          const newModule = { id: `mod_${Date.now()}`, title, lectures: [], isExpanded: true };
          return { ...s, modules: [...s.modules, newModule] };
      });
      saveToDB(updated);
  };

  // NEW: Add Custom Lecture
  const addLecture = (subjectId, moduleId, title, durationMin) => {
      const updated = subjects.map(s => {
          if (s.id !== subjectId) return s;
          const newModules = s.modules.map(m => {
              if (m.id !== moduleId) return m;
              const newLecture = { id: `lec_${Date.now()}`, title, durationMin: parseInt(durationMin) || 0, isCompleted: false };
              return { ...m, lectures: [...m.lectures, newLecture] };
          });
          const newTaskTotal = newModules.reduce((acc, m) => acc + m.lectures.length, 0);
          return { ...s, modules: newModules, taskTotal: newTaskTotal };
      });
      saveToDB(updated);
  };


  // --- RENDER DETAIL VIEW ---
  if (activeSubjectId) {
      const subject = subjects.find(s => s.id === activeSubjectId);
      if (!subject) return null;
      return (
        <SyllabusDetailView 
          subject={subject} 
          onBack={() => setActiveSubjectId(null)} 
          onToggleLecture={toggleLecture} 
          onToggleModuleComplete={toggleModuleComplete}
          onToggleExpand={toggleModuleExpand}
          onDeleteModule={deleteModule}
          onDeleteLecture={deleteLecture}
          onAddModule={addModule}
          onAddLecture={addLecture}
        />
      );
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-mono flex flex-col">
      
      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg w-full max-w-sm shadow-2xl relative">
                <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">
                    {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                    <input type="text" name="username" placeholder="Username" required className="bg-gray-700 border border-gray-600 rounded px-3 py-2 outline-none focus:border-blue-500 text-white" />
                    <input type="password" name="password" placeholder="Password" required className="bg-gray-700 border border-gray-600 rounded px-3 py-2 outline-none focus:border-blue-500 text-white" />
                    {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition-colors mt-2">
                        {authMode === 'login' ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm text-gray-400">
                    {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-blue-400 hover:underline">
                        {authMode === 'login' ? 'Sign Up' : 'Login'}
                    </button>
                </div>
            </div>
        </div>
      )}

      <header className="p-4 bg-gray-800 border-b border-gray-700 shadow-lg z-20">
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <Activity /> GATE CSE TRACKER
            </h1>
            
            <div className="flex items-center gap-4">
                {!isAuthenticated ? (
                    <button onClick={() => setShowAuthModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded font-bold transition-colors flex items-center gap-2 text-sm">
                        <UserIcon size={16}/> Log In
                    </button>
                ) : (
                    <>
                        <button onClick={handleMigrate} className="flex items-center gap-2 text-xs bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 border border-yellow-500/50 px-3 py-1.5 rounded transition-colors" title="Move local storage data to cloud">
                            <Database size={14} /> Migrate Local Data
                        </button>
                        <div className="flex items-center gap-3 bg-gray-700/50 px-3 py-1.5 rounded border border-gray-600">
                            <span className="text-sm font-bold text-gray-300">Hi, {username}</span>
                            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors" title="Logout">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>

        {isAuthenticated && (
            <form onSubmit={addSubject} className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4 items-end bg-gray-800/50">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">Subject Name</label>
                        <input required type="text" placeholder="e.g. DBMS" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-48 outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">Start Date (Optional)</label>
                        <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-36 outline-none text-sm text-gray-300 focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-xs ${customEndDate ? 'text-gray-600' : 'text-gray-400'}`}>Days Duration</label>
                        <input type="number" placeholder="15" value={duration} disabled={!!customEndDate} onChange={(e) => setDuration(e.target.value)} className={`bg-gray-700 border border-gray-600 rounded px-3 py-2 w-24 outline-none ${customEndDate ? 'opacity-30' : ''}`} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-bold px-2">OR</div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-xs ${duration ? 'text-gray-600' : 'text-gray-400'}`}>End Date</label>
                        <input type="date" value={customEndDate} disabled={!!duration} onChange={(e) => setCustomEndDate(e.target.value)} className={`bg-gray-700 border border-gray-600 rounded px-3 py-2 w-36 outline-none text-sm text-gray-300 ${duration ? 'opacity-30' : ''}`} />
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-700 pt-3">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">Task Tracking Setup:</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="trackMode" checked={trackMode === "none"} onChange={() => setTrackMode("none")} className="text-blue-500 bg-gray-700" />
                            <span className="text-sm text-gray-300">None</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="trackMode" checked={trackMode === "manual"} onChange={() => setTrackMode("manual")} className="text-blue-500 bg-gray-700" />
                            <span className="text-sm text-gray-300">Manual Numbers</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="trackMode" checked={trackMode === "syllabus"} onChange={() => setTrackMode("syllabus")} className="text-blue-500 bg-gray-700" />
                            <span className="text-sm text-gray-300 text-blue-400 font-semibold">Paste Syllabus (Auto-Todo)</span>
                        </label>
                    </div>

                    {trackMode === "manual" && (
                        <div className="flex gap-2 items-center">
                            <input type="text" placeholder="Unit (e.g. PYQs)" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 w-40 text-sm outline-none focus:border-blue-500" />
                            <input type="number" placeholder="Total (e.g. 150)" value={taskTotal} onChange={(e) => setTaskTotal(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 w-32 text-sm outline-none focus:border-blue-500" />
                        </div>
                    )}

                    {trackMode === "syllabus" && (
                        <div className="flex flex-col gap-2">
                            <textarea 
                                placeholder="Paste your syllabus here... (e.g., - Lecture 1 - Title [Timing: 30:00])" 
                                value={syllabusInput} 
                                onChange={(e) => setSyllabusInput(e.target.value)} 
                                className="bg-gray-700/50 border border-gray-600 rounded p-3 w-full h-32 text-sm outline-none focus:border-blue-500 resize-y font-mono"
                            />
                        </div>
                    )}

                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded flex items-center justify-center gap-2 transition-colors text-sm w-48 mt-2">
                        <Plus size={16} /> Add Tracker
                    </button>
                </div>
            </form>
        )}
      </header>

      <main className="flex-grow overflow-y-auto pb-20 p-4">
        {isLoading ? (
             <div className="h-full flex items-center justify-center text-gray-500 text-xl">Loading Data...</div>
        ) : !isAuthenticated ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                <Clock size={64} className="opacity-50" />
                <p className="text-xl">Please log in to view your tracker.</p>
                <button onClick={() => setShowAuthModal(true)} className="bg-blue-600/20 text-blue-400 border border-blue-500/50 px-6 py-2 rounded font-bold hover:bg-blue-600/40 transition-colors">
                    Log In
                </button>
            </div>
        ) : subjects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
            <Clock size={64} className="mb-4" />
            <p className="text-xl">No active subjects.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {subjects.map((subject, index) => (
              <div 
                key={subject.id}
                draggable
                onDragStart={() => dragItem.current = index}
                onDragEnter={() => dragOverItem.current = index}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                className="cursor-move"
              >
                  <SubjectStrip 
                    subject={subject} 
                    currentTime={currentTime} 
                    onDelete={deleteSubject}
                    onAddToProgress={addToProgress}
                    onUpdate={updateSubject}
                    onOpenDetail={() => setActiveSubjectId(subject.id)}
                  />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENT: DETAIL VIEW ---
function SyllabusDetailView({ subject, onBack, onToggleLecture, onToggleExpand, onDeleteModule, onDeleteLecture, onToggleModuleComplete, onAddModule, onAddLecture }) {
    // Local state for inline additions
    const [addingModule, setAddingModule] = useState(false);
    const [newModTitle, setNewModTitle] = useState("");
    const [addingLectureTo, setAddingLectureTo] = useState(null);
    const [newLecTitle, setNewLecTitle] = useState("");
    const [newLecDuration, setNewLecDuration] = useState("");

    let totalMins = 0; let completedMins = 0;
    subject.modules.forEach(m => {
        m.lectures.forEach(l => {
            totalMins += l.durationMin;
            if (l.isCompleted) completedMins += l.durationMin;
        });
    });

    const isFullyComplete = subject.taskTotal > 0 && subject.taskCompleted >= subject.taskTotal;
    const progressPerc = subject.taskTotal > 0 ? (subject.taskCompleted / subject.taskTotal) * 100 : 0;
    const hrsTotal = (totalMins / 60).toFixed(1);
    const hrsLeft = ((totalMins - completedMins) / 60).toFixed(1);

    const submitAddModule = () => {
        if (!newModTitle.trim()) return;
        onAddModule(subject.id, newModTitle);
        setNewModTitle("");
        setAddingModule(false);
    };

    const submitAddLecture = (moduleId) => {
        if (!newLecTitle.trim()) return;
        onAddLecture(subject.id, moduleId, newLecTitle, newLecDuration);
        setNewLecTitle("");
        setNewLecDuration("");
        setAddingLectureTo(null);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-mono flex flex-col">
            <div className="sticky top-0 z-30 bg-gray-800 border-b border-gray-700 shadow-xl p-4">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
                    <ChevronLeft size={20} /> Back to Dashboard
                </button>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{subject.title}</h1>
                        <div className="flex gap-4 text-sm text-gray-400">
                            <span><List size={14} className="inline mr-1"/> {subject.taskCompleted} / {subject.taskTotal} Topics</span>
                            <span><Clock size={14} className="inline mr-1"/> {hrsLeft} hrs remaining (of {hrsTotal} hrs)</span>
                        </div>
                    </div>
                    {isFullyComplete && <div className="text-green-500 font-bold border border-green-500 px-3 py-1 rounded">ALL COMPLETED</div>}
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progressPerc}%` }}></div>
                </div>
            </div>

            <div className="flex-grow p-4 overflow-y-auto max-w-5xl mx-auto w-full">
                {subject.modules.map((mod) => {
                    const modCompleted = mod.lectures.filter(l => l.isCompleted).length;
                    const allLecturesCompleted = mod.lectures.length > 0 && modCompleted === mod.lectures.length;

                    return (
                        <div key={mod.id} className="mb-8 bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden transition-all">
                            {/* MODULE HEADER */}
                            <div 
                                className="bg-gray-800 p-3 border-b border-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-700/80 transition-colors group"
                                onClick={() => onToggleExpand(subject.id, mod.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center text-gray-400">
                                        {mod.isExpanded ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                                    </div>
                                    
                                    {/* MASTER CHECKBOX */}
                                    <div 
                                        className="mt-0.5 transition-transform active:scale-90" 
                                        onClick={(e) => { e.stopPropagation(); onToggleModuleComplete(subject.id, mod.id); }}
                                    >
                                        {allLecturesCompleted ? <CheckSquare className="text-green-500" size={20} /> : <Square className="text-gray-400 hover:text-blue-400" size={20} />}
                                    </div>
                                    
                                    <h2 className="font-bold text-lg text-blue-300 select-none ml-1">{mod.title}</h2>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-500 font-bold bg-gray-900 px-2 py-1 rounded">
                                        {modCompleted}/{mod.lectures.length}
                                    </span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteModule(subject.id, mod.id); }} 
                                        className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete entire module"
                                    >
                                        <X size={18}/>
                                    </button>
                                </div>
                            </div>
                            
                            {/* LECTURES LIST */}
                            {mod.isExpanded && (
                                <div className="divide-y divide-gray-700/50">
                                    {mod.lectures.map(lecture => (
                                        <div key={lecture.id} className={`flex items-center gap-4 p-3 group hover:bg-gray-700/40 transition-colors ${lecture.isCompleted ? 'opacity-60 bg-gray-800/20' : ''}`}>
                                            <label className="flex items-start gap-4 flex-grow cursor-pointer pl-2">
                                                <div className="mt-1">
                                                    <input type="checkbox" checked={lecture.isCompleted} onChange={() => onToggleLecture(subject.id, mod.id, lecture.id)} className="sr-only" />
                                                    {lecture.isCompleted ? <CheckSquare className="text-green-500" size={20} /> : <Square className="text-gray-500" size={20} />}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className={`text-sm ${lecture.isCompleted ? 'line-through text-gray-500' : 'text-gray-200'}`}>{lecture.title}</p>
                                                </div>
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <div className="text-xs text-gray-500 font-mono bg-gray-900/50 px-2 py-1 rounded whitespace-nowrap">
                                                    {lecture.durationMin > 0 ? `${lecture.durationMin} mins` : 'No Time'}
                                                </div>
                                                <button 
                                                    onClick={() => onDeleteLecture(subject.id, mod.id, lecture.id)} 
                                                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                    title="Delete this lecture"
                                                >
                                                    <X size={16}/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* ADD LECTURE ROW */}
                                    <div className="p-3 bg-gray-800/20">
                                        {addingLectureTo === mod.id ? (
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="Topic Name..." value={newLecTitle} onChange={(e) => setNewLecTitle(e.target.value)} className="bg-gray-700 text-sm p-1.5 rounded flex-grow outline-none border border-gray-600 focus:border-blue-500" autoFocus />
                                                <input type="number" placeholder="Mins (opt)" value={newLecDuration} onChange={(e) => setNewLecDuration(e.target.value)} className="bg-gray-700 text-sm p-1.5 rounded w-24 outline-none border border-gray-600 focus:border-blue-500" />
                                                <button onClick={() => submitAddLecture(mod.id)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded text-sm font-bold">Add</button>
                                                <button onClick={() => setAddingLectureTo(null)} className="bg-gray-600 hover:bg-gray-500 text-white px-2 rounded"><X size={16}/></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setAddingLectureTo(mod.id)} className="text-sm text-gray-500 hover:text-blue-400 flex items-center gap-1 transition-colors pl-8">
                                                <Plus size={16} /> Add Topic
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* ADD MODULE SECTION */}
                <div className="mb-12 border border-dashed border-gray-600 rounded-lg p-4 bg-gray-800/10 text-center">
                    {addingModule ? (
                        <div className="flex gap-2 max-w-md mx-auto">
                            <input type="text" placeholder="Module/Chapter Name..." value={newModTitle} onChange={(e) => setNewModTitle(e.target.value)} className="bg-gray-700 text-sm p-2 rounded flex-grow outline-none border border-gray-600 focus:border-blue-500" autoFocus />
                            <button onClick={submitAddModule} className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded font-bold">Add</button>
                            <button onClick={() => setAddingModule(false)} className="bg-gray-600 hover:bg-gray-500 text-white px-3 rounded"><X size={18}/></button>
                        </div>
                    ) : (
                        <button onClick={() => setAddingModule(true)} className="text-gray-400 hover:text-blue-400 flex items-center justify-center gap-2 w-full transition-colors font-bold">
                            <Plus size={20} /> Add New Module / Chapter
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: DASHBOARD STRIP ---
function SubjectStrip({ subject, currentTime, onDelete, onAddToProgress, onUpdate, onOpenDetail }) {
  const [addAmount, setAddAmount] = useState(""); 
  const [isEditing, setIsEditing] = useState(false);
  
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");
  const [tempTaskTotal, setTempTaskTotal] = useState("");
  const [tempIsCompleted, setTempIsCompleted] = useState(false);

  const start = new Date(subject.startDate);
  const end = new Date(subject.endDate);
  const timeElapsed = currentTime - start;
  const timeLeft = end - currentTime;
  const totalDuration = end - start;

  const isBeforeStart = timeElapsed < 0;
  const isEnded = timeLeft <= 0 && !isBeforeStart;
  const isRunning = !isBeforeStart && !isEnded;
  const isFullyComplete = subject.isManuallyCompleted || (subject.taskTotal > 0 && subject.taskCompleted >= subject.taskTotal);

  const daysToStart = Math.ceil(Math.abs(timeElapsed) / (1000 * 60 * 60 * 24));
  const daysRunningLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

  let statusText = ""; let statusColor = ""; let displayValue = 0; let displayLabel = "";

  if (isFullyComplete) { statusText = "Completed"; statusColor = "text-green-500"; displayValue = 0; displayLabel = "Finished"; } 
  else if (isBeforeStart) { statusText = "Upcoming"; statusColor = "text-orange-500"; displayValue = daysToStart; displayLabel = "Days to Start"; } 
  else if (isEnded) { statusText = "Ended"; statusColor = "text-red-500"; displayValue = 0; displayLabel = "Days Left"; } 
  else { statusText = "Running"; statusColor = "text-green-500"; displayValue = daysRunningLeft; displayLabel = "Days Left"; }

  let progress = isFullyComplete || isEnded ? 100 : isRunning ? Math.min(100, Math.max(0, (timeElapsed / totalDuration) * 100)) : 0;

  const hasTask = subject.taskTotal > 0;
  const hasSyllabus = subject.modules && subject.modules.length > 0;
  const remainingTasks = Math.max(0, subject.taskTotal - subject.taskCompleted);
  
  const activeDaysForPace = isBeforeStart ? (totalDuration / (1000 * 60 * 60 * 24)) : Math.max(0, timeLeft / (1000 * 60 * 60 * 24));
  const dailyRate = hasTask ? (remainingTasks / Math.max(0.5, activeDaysForPace)).toFixed(1) : 0;
  const taskProgress = hasTask ? (subject.taskCompleted / subject.taskTotal) * 100 : 0;

  let totalMins = 0; let completedMins = 0;
  if (hasSyllabus) {
      subject.modules.forEach(m => {
          m.lectures.forEach(l => { totalMins += l.durationMin; if (l.isCompleted) completedMins += l.durationMin; });
      });
  }
  const hrsLeft = ((totalMins - completedMins) / 60).toFixed(1);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if(!addAmount) return;
    onAddToProgress(subject.id, addAmount);
    setAddAmount(""); 
  };

  const startEditing = () => {
    setTempStart(new Date(subject.startDate).toISOString().split('T')[0]);
    setTempEnd(new Date(subject.endDate).toISOString().split('T')[0]);
    setTempTaskTotal(subject.taskTotal);
    setTempIsCompleted(subject.isManuallyCompleted || false);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if(tempStart && tempEnd) {
        onUpdate(subject.id, tempStart, tempEnd, tempTaskTotal, tempIsCompleted);
        setIsEditing(false);
    }
  };

  return (
    <div className="relative w-full border border-gray-700 flex flex-col rounded-lg bg-gray-800/40 hover:bg-gray-800 transition-colors group overflow-hidden">
      
      {/* Background Time Progress */}
      <div className="absolute top-0 left-0 h-full bg-blue-900/10 pointer-events-none transition-all duration-1000" style={{ width: `${progress}%` }} />
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-700">
        <div className={`h-full transition-all duration-1000 ${isFullyComplete ? 'bg-green-500' : isEnded ? 'bg-red-500' : isBeforeStart ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }} />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 items-center w-full">
        <div className="lg:col-span-5 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-700/50 pb-4 lg:pb-0 lg:pr-6">
          <div className="flex justify-between items-start mb-2">
             <div className="flex items-center gap-3">
                 <GripVertical className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing" size={20} />
                 <h2 className={`text-2xl font-bold truncate flex items-center gap-2 cursor-pointer ${isFullyComplete ? 'text-green-400' : 'text-white hover:text-blue-300 transition-colors'}`} onClick={hasSyllabus ? onOpenDetail : undefined} title={subject.title}>
                   {subject.title} {isFullyComplete && <CheckCircle size={20} />}
                 </h2>
             </div>
             {!isEditing && (
                 <button onClick={startEditing} className="text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Edit2 size={16} />
                 </button>
             )}
          </div>

          {isEditing ? (
              <div className="flex flex-col gap-3 my-2 bg-gray-900/90 p-3 rounded-lg border border-gray-600 shadow-xl z-50">
                  <div className="flex gap-3">
                    <div className="flex flex-col gap-1 w-1/2">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase">Start</label>
                        <input type="date" value={tempStart} onChange={(e) => setTempStart(e.target.value)} className="bg-gray-800 text-xs p-1.5 rounded outline-none border border-gray-600 focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col gap-1 w-1/2">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase">End</label>
                        <input type="date" value={tempEnd} onChange={(e) => setTempEnd(e.target.value)} className="bg-gray-800 text-xs p-1.5 rounded outline-none border border-gray-600 focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1 pt-2 border-t border-gray-700">
                      <button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded flex-1 flex justify-center items-center gap-2 text-xs font-bold"><Save size={14}/> Save</button>
                      <button onClick={() => setIsEditing(false)} className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded w-10 flex justify-center items-center"><X size={14}/></button>
                  </div>
              </div>
          ) : (
             <div className="text-xs text-gray-400 mb-4 flex flex-col gap-1 ml-8">
                 <span className="flex items-center gap-1"><Calendar size={12}/> Start: {start.toLocaleDateString()}</span>
                 <span className="flex items-center gap-1"><Clock size={12}/> Target: {end.toLocaleDateString()}</span>
             </div>
          )}

          {!isEditing && hasTask && !isFullyComplete && (
            <div className="bg-gray-900/60 p-3 rounded border border-gray-700 shadow-inner ml-8">
                <div className="flex justify-between items-center text-xs text-gray-300 mb-1">
                    <span>{hasSyllabus ? 'Completed Topics:' : `Completed ${subject.taskName}:`}</span>
                    <span className="font-bold text-blue-400">{subject.taskCompleted} / {subject.taskTotal}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full mb-3 overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${taskProgress}%` }}></div>
                </div>
                
                {hasSyllabus ? (
                    <button onClick={onOpenDetail} className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                        <FileText size={14} /> Open Checklist
                    </button>
                ) : (
                    <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">Today I did:</span>
                        <input type="number" value={addAmount} placeholder="0" onChange={(e) => setAddAmount(e.target.value)} className="bg-gray-800 border border-gray-600 rounded w-16 px-2 py-1 text-sm text-center focus:border-blue-500 outline-none" />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded"><Plus size={16} /></button>
                    </form>
                )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-700/50 pb-4 lg:pb-0 px-4">
            {isFullyComplete ? (
                 <div className="text-green-500 font-bold text-3xl flex items-center gap-3 tracking-widest"><CheckCircle size={36} /> DONE</div>
            ) : hasSyllabus && !isEnded ? (
                <div className="text-center w-full max-w-xs">
                    <div className="text-sm text-gray-400 uppercase tracking-widest mb-1 border-b border-gray-700 pb-1">Time Tracking</div>
                    <div className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-2 my-2">
                        <Clock size={28} /> {hrsLeft} <span className="text-sm text-gray-500 uppercase tracking-widest mt-2">hrs left</span>
                    </div>
                    <div className="text-xs text-gray-400 flex justify-between px-2">
                        <span>Pace: {dailyRate} / day</span>
                        <span>{remainingTasks} Topics Left</span>
                    </div>
                </div>
            ) : hasTask && !hasSyllabus && !isEnded ? (
                 <div className="text-center">
                    <div className="text-sm text-gray-400 uppercase tracking-widest mb-1">Required Pace</div>
                    <div className="text-5xl font-bold text-white flex items-end justify-center gap-2 leading-none">
                        {dailyRate}<span className="text-lg text-blue-400 font-medium mb-1">/day</span>
                    </div>
                </div>
            ) : isEnded && remainingTasks > 0 ? (
                <div className="text-red-500 font-bold text-2xl flex items-center gap-2"><AlertCircle /> TIME UP</div>
            ) : (
                <div className="text-gray-600 font-bold text-xl flex flex-col items-center">
                    <PlayCircle size={32} className="mb-2"/> <span>TRACKING TIME</span>
                </div>
            )}
        </div>

        <div className="lg:col-span-3 flex flex-col items-center justify-center relative">
             <div className="text-center flex flex-col items-center justify-center">
                {isEnded && !isFullyComplete ? (
                    <div className={`text-4xl font-bold ${statusColor} tracking-wider`}>ENDED</div>
                ) : isFullyComplete ? (
                    <div className={`text-4xl font-bold ${statusColor} tracking-wider`}>FINISHED</div>
                ) : (
                    <>
                        <div className={`text-6xl font-bold ${statusColor}`}>{displayValue}</div>
                        <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">{displayLabel}</div>
                        <div className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-gray-900/60 border border-gray-700 ${statusColor}`}>
                            STATUS: {statusText}
                        </div>
                    </>
                )}
            </div>
            
            <button onClick={() => onDelete(subject.id)} className="absolute top-0 right-0 lg:top-1 lg:-right-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2" title="Delete Tracker">
                <Trash2 size={20} />
            </button>
        </div>

      </div>
    </div>
  );
}
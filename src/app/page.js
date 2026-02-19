"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Clock, AlertCircle, CheckCircle, Activity, Calendar, PlayCircle, Edit2, Save, X } from 'lucide-react';

export default function GateTracker() {
  const [subjects, setSubjects] = useState([]);
  
  // --- Form States ---
  const [newSubject, setNewSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  // Task States
  const [hasTask, setHasTask] = useState(false);
  const [taskName, setTaskName] = useState(""); // e.g. "Videos"
  const [taskTotal, setTaskTotal] = useState(""); // e.g. 50

  const [currentTime, setCurrentTime] = useState(new Date());

  // --- Load/Save ---
  useEffect(() => {
    const saved = localStorage.getItem("gate_subjects_v4");
    if (saved) setSubjects(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("gate_subjects_v4", JSON.stringify(subjects));
  }, [subjects]);

  // --- Clock ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Add Subject Logic ---
  const addSubject = (e) => {
    e.preventDefault();
    if (!newSubject) return;

    let startDate = new Date(); // Default to NOW
    let endDate;
    let durationDays;

    if (customStartDate) {
        startDate = new Date(customStartDate);
    }

    if (customEndDate) {
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
      
      const diffTime = endDate - startDate;
      durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    } 
    else if (duration) {
      durationDays = parseFloat(duration);
      endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    } 
    else {
        alert("Please provide either a Duration (Days) or an End Date.");
        return;
    }

    const newEntry = {
      id: Date.now(),
      title: newSubject,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: durationDays,
      taskName: hasTask ? (taskName || "Tasks") : null,
      taskTotal: hasTask ? parseInt(taskTotal || 0) : 0,
      taskCompleted: 0,
      isManuallyCompleted: false // NEW FLAG
    };

    setSubjects([...subjects, newEntry]);
    
    // Reset Form
    setNewSubject("");
    setDuration("");
    setCustomStartDate("");
    setCustomEndDate("");
    setHasTask(false);
    setTaskName("");
    setTaskTotal("");
  };

  const deleteSubject = (id) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  // --- Update Logic ---
  const updateSubject = (id, newStartIso, newEndIso, newTaskTotal, isManuallyCompleted) => {
    const updated = subjects.map(s => {
        if (s.id === id) {
            const start = new Date(newStartIso);
            const end = new Date(newEndIso);
            end.setHours(23, 59, 59, 999);

            const diffTime = end - start;
            const newDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                ...s,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                durationDays: newDuration,
                taskTotal: newTaskTotal !== undefined ? Math.max(s.taskCompleted, parseInt(newTaskTotal || 0)) : s.taskTotal,
                isManuallyCompleted: isManuallyCompleted
            };
        }
        return s;
    });
    setSubjects(updated);
  };

  const addToProgress = (id, amountToAdd) => {
    const val = parseInt(amountToAdd);
    if (isNaN(val) || val === 0) return;

    const updated = subjects.map(s => {
        if (s.id === id) {
            const newTotal = (s.taskCompleted || 0) + val;
            return { ...s, taskCompleted: Math.min(newTotal, s.taskTotal) }; 
        }
        return s;
    });
    setSubjects(updated);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-mono flex flex-col">
      {/* --- HEADER --- */}
      <header className="p-4 bg-gray-800 border-b border-gray-700 shadow-lg z-20">
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <Activity /> GATE CSE TRACKER
            </h1>
        </div>

        <form onSubmit={addSubject} className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 items-end bg-gray-800/50">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Subject Name</label>
                    <input type="text" placeholder="e.g. DBMS" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-48 outline-none focus:border-blue-500" />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Start Date (Optional)</label>
                    <input 
                        type="date" 
                        value={customStartDate} 
                        onChange={(e) => setCustomStartDate(e.target.value)} 
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-36 outline-none text-sm text-gray-300 focus:border-blue-500"
                    />
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

            <div className="flex flex-wrap gap-4 items-center border-t border-gray-700 pt-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={hasTask} onChange={(e) => setHasTask(e.target.checked)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-600" />
                    <span className="text-sm text-gray-300">Add Task Goal?</span>
                </label>

                {hasTask && (
                    <>
                        <input type="text" placeholder="Unit (e.g. Videos)" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-1 w-40 text-sm outline-none focus:border-blue-500" />
                        <input type="number" placeholder="Total (e.g. 50)" value={taskTotal} onChange={(e) => setTaskTotal(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-1 w-32 text-sm outline-none focus:border-blue-500" />
                    </>
                )}

                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-1.5 rounded flex items-center gap-2 transition-colors ml-auto text-sm">
                    <Plus size={16} /> Add Tracker
                </button>
            </div>
        </form>
      </header>

      {/* --- STRIPS --- */}
      <main className="flex-grow overflow-y-auto pb-20">
        {subjects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
            <Clock size={64} className="mb-4" />
            <p className="text-xl">No active subjects.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {subjects.map((subject) => (
              <SubjectStrip 
                key={subject.id} 
                subject={subject} 
                currentTime={currentTime} 
                onDelete={deleteSubject}
                onAddToProgress={addToProgress}
                onUpdate={updateSubject}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENT ---
function SubjectStrip({ subject, currentTime, onDelete, onAddToProgress, onUpdate }) {
  const [addAmount, setAddAmount] = useState(""); 
  
  // -- Edit Mode States --
  const [isEditing, setIsEditing] = useState(false);
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");
  const [tempTaskTotal, setTempTaskTotal] = useState("");
  const [tempIsCompleted, setTempIsCompleted] = useState(false);

  const start = new Date(subject.startDate);
  const end = new Date(subject.endDate);
  const now = currentTime;

  const totalDuration = end - start;
  const timeElapsed = now - start;
  const timeLeft = end - now;

  // --- Dynamic Status Calculations ---
  const isBeforeStart = timeElapsed < 0;
  const isEnded = timeLeft <= 0 && !isBeforeStart;
  const isRunning = !isBeforeStart && !isEnded;
  const isFullyComplete = subject.isManuallyCompleted || (subject.taskTotal > 0 && subject.taskCompleted >= subject.taskTotal);

  const daysToStart = Math.ceil(Math.abs(timeElapsed) / (1000 * 60 * 60 * 24));
  const daysRunningLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

  let statusText = "";
  let statusColor = "";
  let displayValue = 0;
  let displayLabel = "";

  if (isFullyComplete) {
      statusText = "Completed";
      statusColor = "text-green-500";
      displayValue = 0;
      displayLabel = "Finished";
  } else if (isBeforeStart) {
      statusText = "Upcoming";
      statusColor = "text-orange-500";
      displayValue = daysToStart;
      displayLabel = "Days to Start";
  } else if (isEnded) {
      statusText = "Ended";
      statusColor = "text-red-500";
      displayValue = 0;
      displayLabel = "Days Left";
  } else {
      statusText = "Running";
      statusColor = "text-green-500";
      displayValue = daysRunningLeft;
      displayLabel = "Days Left";
  }

  // Visual Progress Bar (Background)
  let progress = 0;
  if (isFullyComplete || isEnded) progress = 100;
  else if (isRunning) progress = Math.min(100, Math.max(0, (timeElapsed / totalDuration) * 100));

  // Task Math
  const hasTask = subject.taskTotal > 0;
  const remainingTasks = Math.max(0, subject.taskTotal - subject.taskCompleted);
  
  // Pace Calculation
  const activeDaysForPace = isBeforeStart 
        ? (totalDuration / (1000 * 60 * 60 * 24)) 
        : Math.max(0, timeLeft / (1000 * 60 * 60 * 24));
        
  const dailyRate = hasTask ? (remainingTasks / Math.max(0.5, activeDaysForPace)).toFixed(1) : 0;
  const taskProgress = hasTask ? (subject.taskCompleted / subject.taskTotal) * 100 : 0;

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
    <div className="relative w-full h-[20vh] min-h-[170px] border-b border-gray-700 flex bg-gray-800/40 hover:bg-gray-800 transition-colors group overflow-hidden">
      
      {/* Background Time Progress */}
      <div 
        className="absolute top-0 left-0 h-full bg-blue-900/10 pointer-events-none transition-all duration-1000"
        style={{ width: `${progress}%` }}
      />
      
      {/* Bottom Line Indicator */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
        <div 
          className={`h-full transition-all duration-1000 ${isFullyComplete ? 'bg-green-500' : isEnded ? 'bg-red-500' : isBeforeStart ? 'bg-orange-500' : 'bg-green-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative z-10 flex w-full h-full">
        
        {/* SECTION 1: Info & Task Input */}
        <div className="w-[35%] flex flex-col justify-center px-6 border-r border-gray-700/50">
          <div className="flex justify-between items-start">
             <h2 className={`text-2xl font-bold truncate mb-1 ${isFullyComplete ? 'text-green-400' : 'text-white'}`} title={subject.title}>
               {subject.title} {isFullyComplete && <CheckCircle className="inline ml-2" size={20} />}
             </h2>
             {!isEditing && (
                 <button onClick={startEditing} className="text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Edit Dates and Tasks">
                     <Edit2 size={16} />
                 </button>
             )}
          </div>

          {/* EDIT PANEL */}
          {isEditing ? (
              <div className="flex flex-col gap-3 my-2 bg-gray-900/90 p-3 rounded-lg border border-gray-600 shadow-xl z-50">
                  <div className="flex gap-3">
                    <div className="flex flex-col gap-1 w-1/2">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Start Date</label>
                        <input type="date" value={tempStart} onChange={(e) => setTempStart(e.target.value)} className="bg-gray-800 text-xs p-1.5 rounded outline-none border border-gray-600 focus:border-blue-500 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1 w-1/2">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">End Date</label>
                        <input type="date" value={tempEnd} onChange={(e) => setTempEnd(e.target.value)} className="bg-gray-800 text-xs p-1.5 rounded outline-none border border-gray-600 focus:border-blue-500 transition-colors" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-3">
                      {hasTask && (
                          <div className="flex flex-col gap-1 flex-grow">
                              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total Goal ({subject.taskName})</label>
                              <input type="number" value={tempTaskTotal} onChange={(e) => setTempTaskTotal(e.target.value)} className="bg-gray-800 text-xs p-1.5 rounded outline-none border border-gray-600 focus:border-blue-500 transition-colors w-full" />
                          </div>
                      )}
                      
                      {/* TOGGLE SWITCH */}
                      <div className="flex flex-col gap-1 items-end justify-center mt-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={tempIsCompleted} onChange={e => setTempIsCompleted(e.target.checked)} />
                            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                            <span className="ml-2 text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Complete</span>
                          </label>
                      </div>
                  </div>

                  <div className="flex gap-2 mt-1 pt-2 border-t border-gray-700">
                      <button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded flex-1 flex justify-center items-center gap-2 text-xs font-bold transition-colors"><Save size={14}/> Save Changes</button>
                      <button onClick={() => setIsEditing(false)} className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded w-10 flex justify-center items-center transition-colors"><X size={14}/></button>
                  </div>
              </div>
          ) : (
             <div className="text-xs text-gray-400 mb-4 flex flex-col gap-1">
                 <span className="flex items-center gap-1"><Calendar size={12}/> Start: {start.toLocaleDateString()}</span>
                 <span className="flex items-center gap-1"><Clock size={12}/> Target: {end.toLocaleDateString()}</span>
             </div>
          )}

          {/* Task Control Area */}
          {!isEditing && hasTask && !isFullyComplete ? (
            <div className="bg-gray-900/60 p-3 rounded border border-gray-700 shadow-inner">
                <div className="flex justify-between items-center text-xs text-gray-300 mb-1">
                    <span>Completed {subject.taskName}:</span>
                    <span className="font-bold text-blue-400">{subject.taskCompleted} / {subject.taskTotal}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full mb-3 overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${taskProgress}%` }}></div>
                </div>
                
                <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Today I did:</span>
                    <input 
                        type="number" 
                        value={addAmount}
                        placeholder="0"
                        onChange={(e) => setAddAmount(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded w-16 px-2 py-1 text-sm text-center focus:border-blue-500 outline-none"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded transition-colors" title="Add to total">
                        <Plus size={16} />
                    </button>
                </form>
            </div>
          ) : !isEditing && !hasTask && !isFullyComplete && (
            <div className="text-sm text-gray-500 italic">No counting task set.</div>
          )}
        </div>

        {/* SECTION 2: The "Pace" (Center) */}
        <div className="flex-grow flex flex-col items-center justify-center border-r border-gray-700/50 px-4">
            {isFullyComplete ? (
                 <div className="text-green-500 font-bold text-3xl flex items-center gap-3 tracking-widest"><CheckCircle size={36} /> DONE</div>
            ) : hasTask && !isEnded && remainingTasks > 0 ? (
                <div className="text-center">
                    <div className="text-sm text-gray-400 uppercase tracking-widest mb-1">Required Pace</div>
                    <div className="text-5xl font-bold text-white flex items-end justify-center gap-2 leading-none">
                        {dailyRate}
                        <span className="text-lg text-blue-400 font-medium mb-1">/day</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                        To finish {remainingTasks} {subject.taskName} on time
                    </div>
                </div>
            ) : isEnded && remainingTasks > 0 ? (
                <div className="text-red-500 font-bold text-2xl flex items-center gap-2"><AlertCircle /> TIME UP</div>
            ) : (
                <div className="text-gray-600 font-bold text-xl flex flex-col items-center">
                    <PlayCircle size={32} className="mb-2"/>
                    <span>TRACKING TIME</span>
                </div>
            )}
        </div>

        {/* SECTION 3: Time Countdown (Right) */}
        <div className="w-[20%] flex flex-col items-center justify-center relative bg-gray-800/20">
             <div className="text-center flex flex-col items-center justify-center">
                {isEnded && !isFullyComplete ? (
                    <div className={`text-4xl font-bold ${statusColor} tracking-wider`}>ENDED</div>
                ) : isFullyComplete ? (
                    <div className={`text-4xl font-bold ${statusColor} tracking-wider`}>FINISHED</div>
                ) : (
                    <>
                        <div className={`text-6xl font-bold ${statusColor}`}>
                            {displayValue}
                        </div>
                        <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                            {displayLabel}
                        </div>
                        <div className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-gray-900/60 border border-gray-700 ${statusColor}`}>
                            STATUS: {statusText}
                        </div>
                    </>
                )}
            </div>
            
            <button 
                onClick={() => onDelete(subject.id)}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Tracker"
            >
                <Trash2 size={20} />
            </button>
        </div>

      </div>
    </div>
  );
}
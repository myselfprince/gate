"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Clock, AlertCircle, CheckCircle, Activity, Calendar, PlayCircle } from 'lucide-react';

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
    const saved = localStorage.getItem("gate_subjects_v3");
    if (saved) setSubjects(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("gate_subjects_v3", JSON.stringify(subjects));
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

    // 1. Handle Start Date (If user provided one, use it. Otherwise use Today)
    if (customStartDate) {
        startDate = new Date(customStartDate);
    }

    // 2. Handle End Date / Duration
    if (customEndDate) {
      // User gave End Date
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999); // End of that day
      
      // Calculate duration based on Start and End
      const diffTime = endDate - startDate;
      durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    } 
    else if (duration) {
      // User gave Duration
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
      // Task Data
      taskName: hasTask ? (taskName || "Tasks") : null,
      taskTotal: hasTask ? parseInt(taskTotal || 0) : 0,
      taskCompleted: 0
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

  // Logic to ADD to existing total (Total = Old + New)
  const addToProgress = (id, amountToAdd) => {
    const val = parseInt(amountToAdd);
    if (isNaN(val) || val === 0) return;

    const updated = subjects.map(s => {
        if (s.id === id) {
            const newTotal = (s.taskCompleted || 0) + val;
            return { ...s, taskCompleted: Math.min(newTotal, s.taskTotal) }; // Cap at max
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
            {/* Top Row: Dates & Name */}
            <div className="flex flex-wrap gap-4 items-end bg-gray-800/50">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Subject Name</label>
                    <input type="text" placeholder="e.g. DBMS" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-48 outline-none focus:border-blue-500" />
                </div>

                {/* Start Date (Restored) */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Start Date (Optional)</label>
                    <input 
                        type="date" 
                        value={customStartDate} 
                        onChange={(e) => setCustomStartDate(e.target.value)} 
                        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-36 outline-none text-sm text-gray-300 focus:border-blue-500"
                    />
                </div>
                
                {/* Duration OR End Date */}
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

            {/* Bottom Row: Task Details */}
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
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENT ---
function SubjectStrip({ subject, currentTime, onDelete, onAddToProgress }) {
  const [addAmount, setAddAmount] = useState(""); // Local state for the input box
  
  const start = new Date(subject.startDate);
  const end = new Date(subject.endDate);
  const now = currentTime;

  const totalDuration = end - start;
  const timeElapsed = now - start;
  const timeLeft = end - now;

  // Time Calcs
  const progress = Math.min(100, Math.max(0, (timeElapsed / totalDuration) * 100));
  const isExpired = timeLeft <= 0;
  const daysLeft = Math.max(0, timeLeft / (1000 * 60 * 60 * 24)); 
  const daysDisplay = Math.floor(daysLeft);
  
  // Task Math
  const hasTask = subject.taskTotal > 0;
  const remainingTasks = Math.max(0, subject.taskTotal - subject.taskCompleted);
  // Pace: (Remaining Tasks) / (Remaining Days)
  const dailyRate = hasTask ? (remainingTasks / Math.max(0.5, daysLeft)).toFixed(1) : 0;
  const taskProgress = hasTask ? (subject.taskCompleted / subject.taskTotal) * 100 : 0;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if(!addAmount) return;
    onAddToProgress(subject.id, addAmount);
    setAddAmount(""); // Clear input after adding
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
          className={`h-full transition-all duration-1000 ${isExpired ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative z-10 flex w-full h-full">
        
        {/* SECTION 1: Info & Task Input */}
        <div className="w-[35%] flex flex-col justify-center px-6 border-r border-gray-700/50">
          <h2 className="text-2xl font-bold text-white truncate mb-1" title={subject.title}>
            {subject.title}
          </h2>
          <div className="text-xs text-gray-400 mb-4 flex gap-3">
             <span className="flex items-center gap-1"><Calendar size={12}/> Start: {start.toLocaleDateString()}</span>
             <span className="flex items-center gap-1"><Clock size={12}/> Target: {end.toLocaleDateString()}</span>
          </div>

          {/* Task Control Area */}
          {hasTask ? (
            <div className="bg-gray-900/60 p-3 rounded border border-gray-700 shadow-inner">
                {/* Progress Bar */}
                <div className="flex justify-between items-center text-xs text-gray-300 mb-1">
                    <span>Completed {subject.taskName}:</span>
                    <span className="font-bold text-blue-400">{subject.taskCompleted} / {subject.taskTotal}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full mb-3 overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${taskProgress}%` }}></div>
                </div>
                
                {/* ADD BUTTON Logic */}
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
          ) : (
            <div className="text-sm text-gray-500 italic">No counting task set.</div>
          )}
        </div>

        {/* SECTION 2: The "Pace" (Center) */}
        <div className="flex-grow flex flex-col items-center justify-center border-r border-gray-700/50 px-4">
            {hasTask && !isExpired && remainingTasks > 0 ? (
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
            ) : isExpired && remainingTasks > 0 ? (
                <div className="text-red-500 font-bold text-2xl flex items-center gap-2"><AlertCircle /> TIME UP</div>
            ) : remainingTasks <= 0 && hasTask ? (
                 <div className="text-green-500 font-bold text-2xl flex items-center gap-2"><CheckCircle /> COMPLETE</div>
            ) : (
                <div className="text-gray-600 font-bold text-xl flex flex-col items-center">
                    <PlayCircle size={32} className="mb-2"/>
                    <span>TRACKING TIME</span>
                </div>
            )}
        </div>

        {/* SECTION 3: Time Countdown (Right) */}
        <div className="w-[20%] flex flex-col items-center justify-center relative bg-gray-800/20">
             <div className="text-center">
                <div className={`text-6xl font-bold ${daysDisplay < 3 ? 'text-red-400' : 'text-blue-400'}`}>
                    {daysDisplay}
                </div>
                <div className="text-xs uppercase tracking-widest text-gray-500">Days Left</div>
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
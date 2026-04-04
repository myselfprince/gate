// // src/app/page.js
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trash2, Plus, Clock, AlertCircle, CheckCircle, Activity, Calendar,
  PlayCircle, Edit2, Save, X, List, ChevronLeft, ChevronDown, ChevronRight,
  CheckSquare, Square, FileText, GripVertical, Database, LogOut,
  User as UserIcon, Target, Copy, Check, Flame, Pencil, Minus, Maximize2,
  BookOpen, Bookmark, Layers, Link as LinkIcon, ExternalLink
} from 'lucide-react';
import {
  authUser, logout, checkAuth, getSubjects, saveSubjects,
  getTemplates, saveTemplate, deleteTemplate,
} from './actions';

// ============================================================
// TEMPLATES BROWSER MODAL
// ============================================================
function TemplatesModal({ templates, onUse, onDelete, onClose, username }) {
  const [search, setSearch] = useState('');
  const filtered = templates.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.coaching || '').toLowerCase().includes(search.toLowerCase()) ||
    t.subjectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Bookmark size={18} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">Saved Templates</h2>
            <span className="text-xs bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded-full">{templates.length}</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded transition-colors"><X size={18} /></button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-800">
          <input
            type="text"
            placeholder="Search by subject, coaching..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-200 placeholder-gray-600"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <Layers size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No templates found.</p>
              <p className="text-xs mt-1 text-gray-700">Save a subject as a template from the dashboard.</p>
            </div>
          ) : (
            filtered.map(t => {
              const totalLectures = (t.modules || []).reduce((a, m) => a + (m.lectures?.length || 0), 0);
              const totalMins = (t.modules || []).reduce((a, m) =>
                a + (m.lectures || []).reduce((b, l) => b + (l.durationMin || 0), 0), 0);
              const hrsTotal = (totalMins / 60).toFixed(1);

              return (
                <div key={t._id} className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 flex items-start justify-between gap-4 hover:border-blue-500/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-white text-sm">{t.title}</h3>
                      {t.coaching && (
                        <span className="text-[10px] bg-purple-500/20 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full font-bold">{t.coaching}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Subject: <span className="text-gray-400">{t.subjectName}</span></p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-600 font-mono">
                      <span><Layers size={10} className="inline mr-1" />{t.modules?.length || 0} modules</span>
                      <span><List size={10} className="inline mr-1" />{totalLectures} lectures</span>
                      {totalMins > 0 && <span><Clock size={10} className="inline mr-1" />{hrsTotal} hrs</span>}
                      <span className="ml-auto">by {t.createdBy}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => onUse(t)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
                    >
                      Use This
                    </button>
                    {(t.createdBy === username) && (
                      <button
                        onClick={() => onDelete(t._id)}
                        className="text-gray-600 hover:text-red-400 text-xs px-3 py-1.5 rounded border border-gray-700 hover:border-red-500/40 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-800 text-center text-xs text-gray-700">
          Templates are shared globally — anyone using this site can browse and use them.
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SAVE TEMPLATE DIALOG
// ============================================================
function SaveTemplateDialog({ subject, onSave, onClose }) {
  const defaultTitle = [subject.title, subject.coaching].filter(Boolean).join(' — ');
  const [title, setTitle] = useState(defaultTitle);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-sm shadow-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <Bookmark size={18} className="text-blue-400" />
          <h2 className="text-base font-bold text-white">Save as Template</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          This will save <span className="text-gray-300 font-semibold">{subject.title}</span>'s full checklist as a reusable template.
          Completion status is reset so anyone loading it starts fresh.
        </p>
        <div className="flex flex-col gap-1 mb-5">
          <label className="text-xs text-gray-400 uppercase tracking-wider">Template Name</label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-white"
            placeholder="e.g. TOC — Go Classes"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { if (title.trim()) onSave(title.trim()); }}
            disabled={!title.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Bookmark size={14} /> Save Template
          </button>
          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


// ============================================================
// FLOATING DRAGGABLE TODAY'S GOAL WIDGET
// ============================================================
function FloatingGoalWidget({
  subject, onToggleLecture, onCompleteAllTodayGoals, onClearTodayGoals, onToggleTodayGoal,
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [posReady, setPosReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [copied, setCopied] = useState(false);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef(null);

  useEffect(() => {
    const x = Math.max(16, window.innerWidth - 400);
    const y = 90;
    setPos({ x, y });
    setPosReady(true);
  }, []);

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    const onMouseMove = (ev) => {
      if (!dragging.current) return;
      const w = widgetRef.current?.offsetWidth || 380;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - w, ev.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 48, ev.clientY - dragOffset.current.y)),
      });
    };
    const onMouseUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [pos]);

  const onTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    dragging.current = true;
    dragOffset.current = { x: touch.clientX - pos.x, y: touch.clientY - pos.y };
    const onTouchMove = (ev) => {
      if (!dragging.current) return;
      const t = ev.touches[0];
      const w = widgetRef.current?.offsetWidth || 380;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - w, t.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 48, t.clientY - dragOffset.current.y)),
      });
    };
    const onTouchEnd = () => {
      dragging.current = false;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  }, [pos]);

  const goalLectures = [];
  (subject?.modules || []).forEach(m => {
    m.lectures.forEach(l => { if (l.isTodayGoal) goalLectures.push({ ...l, moduleId: m.id }); });
  });

  const totalMins  = goalLectures.reduce((a, l) => a + (l.durationMin || 0), 0);
  const doneMins   = goalLectures.filter(l => l.isCompleted).reduce((a, l) => a + (l.durationMin || 0), 0);
  const doneCount  = goalLectures.filter(l => l.isCompleted).length;
  const allDone    = goalLectures.length > 0 && doneCount === goalLectures.length;
  const progressPct = goalLectures.length > 0 ? (doneCount / goalLectures.length) * 100 : 0;

  const fmt = (m) => {
    if (m <= 0) return '0m';
    const h = Math.floor(m / 60), mn = m % 60;
    if (h > 0 && mn > 0) return `${h}h ${mn}m`;
    if (h > 0) return `${h}h`;
    return `${mn} mins`;
  };

  const handleCopy = () => {
    if (!goalLectures.length) return;
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
    const text = [
      `📅 Today's Goal — ${subject.title}  [${today}]`,
      `─────────────────────────────────`,
      ...goalLectures.map((l, i) => {
        const t = l.durationMin > 0 ? ` (${fmt(l.durationMin)})` : ' (No time)';
        return `${l.isCompleted ? '✅' : '⬜'} ${i + 1}. ${l.title}${t}`;
      }),
      `─────────────────────────────────`,
      `Total: ${fmt(totalMins)} | ${doneCount}/${goalLectures.length} done`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!posReady) return null;

  if (minimized) {
    return (
      <div ref={widgetRef} style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999, touchAction: 'none' }} className="select-none">
        <div
          onMouseDown={onMouseDown} onTouchStart={onTouchStart}
          className="flex items-center gap-2 bg-gray-900 border-2 border-orange-500/70 rounded-full px-4 py-2 shadow-2xl shadow-orange-900/40 cursor-grab active:cursor-grabbing"
          style={{ backdropFilter: 'blur(16px)' }}
        >
          <Flame size={15} className="text-orange-400 shrink-0" />
          <span className="text-xs font-bold text-orange-300 whitespace-nowrap font-mono">
            {goalLectures.length > 0 ? `${doneCount}/${goalLectures.length} · ${fmt(totalMins)}` : 'No Goals'}
          </span>
          {allDone && <CheckCircle size={13} className="text-green-400 shrink-0" />}
          <button onMouseDown={e => e.stopPropagation()} onClick={() => setMinimized(false)} className="text-gray-400 hover:text-white ml-1 transition-colors" title="Expand">
            <Maximize2 size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999, width: 370, touchAction: 'none',
        boxShadow: allDone ? '0 8px 40px rgba(34,197,94,0.18), 0 2px 8px rgba(0,0,0,0.6)' : '0 8px 40px rgba(249,115,22,0.18), 0 2px 8px rgba(0,0,0,0.6)',
      }}
      className={`select-none rounded-xl overflow-hidden border-2 ${allDone ? 'border-green-500/60' : 'border-orange-500/60'}`}
    >
      <div
        onMouseDown={onMouseDown} onTouchStart={onTouchStart}
        className="flex items-center justify-between px-3 py-2.5 cursor-grab active:cursor-grabbing"
        style={{ background: allDone ? 'rgba(10,30,18,0.98)' : 'rgba(22,10,3,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical size={13} className="text-gray-600 shrink-0" />
          <Flame size={15} className={allDone ? 'text-green-400 shrink-0' : 'text-orange-400 shrink-0'} />
          <span className={`font-bold text-xs tracking-widest uppercase ${allDone ? 'text-green-300' : 'text-orange-300'}`}>Today's Goal</span>
          {goalLectures.length > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${allDone ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-orange-500/20 border-orange-500/40 text-orange-400'}`}>
              {allDone ? '✓ All Done' : `${goalLectures.length} videos`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {goalLectures.length > 0 && <span className="text-[11px] text-gray-400 font-mono mr-1.5">{fmt(totalMins)}</span>}
          <button onMouseDown={e => e.stopPropagation()} onClick={() => setCollapsed(c => !c)} className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-colors" title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? <ChevronDown size={14} /> : <Minus size={14} />}
          </button>
          <button onMouseDown={e => e.stopPropagation()} onClick={() => setMinimized(true)} className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-colors" title="Minimise to pill">
            <X size={14} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ background: 'rgba(10,10,14,0.98)', backdropFilter: 'blur(20px)' }}>
          {goalLectures.length === 0 ? (
            <div className="py-8 text-center px-4">
              <Target size={26} className="mx-auto mb-2 text-gray-700" />
              <p className="text-xs text-gray-500">No goals set yet.</p>
              <p className="text-[11px] text-gray-700 mt-1">Click <span className="text-orange-500">🎯</span> on any lecture to add it here.</p>
            </div>
          ) : (
            <>
              <div className="max-h-52 overflow-y-auto overscroll-contain" style={{ scrollbarWidth: 'thin', scrollbarColor: '#f9731620 transparent' }}>
                {goalLectures.map((l, i) => (
                  <div key={l.id} className={`flex items-center gap-2 px-3 py-2 transition-colors border-b border-gray-800/60 ${l.isCompleted ? 'opacity-45' : 'hover:bg-orange-950/30'}`}>
                    <span className="text-[10px] text-gray-700 w-4 text-right shrink-0 font-mono">{i + 1}</span>
                    <button onMouseDown={e => e.stopPropagation()} onClick={() => onToggleLecture(subject.id, l.moduleId, l.id)} className="shrink-0 transition-transform active:scale-90">
                      {l.isCompleted ? <CheckSquare size={15} className="text-green-500" /> : <Square size={15} className="text-orange-500 hover:text-orange-300 transition-colors" />}
                    </button>
                    <span className={`text-xs flex-grow leading-snug ${l.isCompleted ? 'line-through text-gray-600' : 'text-gray-200'}`}>{l.title}</span>
                    <span className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded ${l.durationMin > 0 ? 'text-orange-400/70 bg-orange-950/40' : 'text-gray-700 border border-dashed border-gray-800'}`}>
                      {l.durationMin > 0 ? fmt(l.durationMin) : '—'}
                    </span>
                    <button onMouseDown={e => e.stopPropagation()} onClick={() => onToggleTodayGoal(subject.id, l.moduleId, l.id)} className="shrink-0 text-gray-800 hover:text-red-500 transition-colors p-0.5" title="Remove from today's goal">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-3 pt-2 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex justify-between text-[10px] text-gray-600 mb-1.5 font-mono">
                  <span>{doneCount}/{goalLectures.length} done</span>
                  <span>{fmt(doneMins)} / {fmt(totalMins)}</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className={`h-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${progressPct}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2.5 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {!allDone && (
                  <button onMouseDown={e => e.stopPropagation()} onClick={() => onCompleteAllTodayGoals(subject.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold transition-colors border border-orange-500/40 text-orange-300 hover:bg-orange-900/30" style={{ background: 'rgba(249,115,22,0.1)' }}>
                    <CheckSquare size={12} /> Mark All Done
                  </button>
                )}
                <button onMouseDown={e => e.stopPropagation()} onClick={handleCopy} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-bold transition-colors border ${copied ? 'border-green-500/40 text-green-400' : 'border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600'}`} style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)' }}>
                  {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
                <button onMouseDown={e => e.stopPropagation()} onClick={() => onClearTodayGoals(subject.id)} className="ml-auto flex items-center gap-1 text-[10px] text-gray-700 hover:text-red-400 transition-colors px-2 py-1.5 rounded hover:bg-red-950/30">
                  <X size={11} /> Clear all
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}


// ============================================================
// MAIN: GATE TRACKER
// ============================================================
export default function GateTracker() {
  const [subjects, setSubjects]               = useState([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername]               = useState("");
  const [showAuthModal, setShowAuthModal]     = useState(false);
  const [authMode, setAuthMode]               = useState('login');
  const [authError, setAuthError]             = useState("");

  // ── Templates state ──
  const [templates, setTemplates]               = useState([]);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [savingTemplateSubject, setSavingTemplateSubject] = useState(null); // subject being saved
  const [selectedTemplate, setSelectedTemplate] = useState(null); // template chosen to pre-fill form

  const dragItem     = useRef(null);
  const dragOverItem = useRef(null);
  const [activeSubjectId, setActiveSubjectId] = useState(null);

  const [newSubject,      setNewSubject]      = useState("");
  const [coaching,        setCoaching]        = useState("");
  const [duration,        setDuration]        = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate,   setCustomEndDate]   = useState("");
  const [trackMode,       setTrackMode]       = useState("manual");
  const [taskName,        setTaskName]        = useState("");
  const [taskTotal,       setTaskTotal]       = useState("");
  const [syllabusInput,   setSyllabusInput]   = useState("");
  const [currentTime,     setCurrentTime]     = useState(new Date());

  useEffect(() => {
    async function loadData() {
      const authData = await checkAuth();
      setIsAuthenticated(authData.isAuthenticated);
      setUsername(authData.username || "");
      if (authData.isAuthenticated) {
        const [data, tmpl] = await Promise.all([getSubjects(), getTemplates()]);
        setSubjects(data || []);
        setTemplates(tmpl || []);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const saveToDB = async (updatedSubjects) => {
    setSubjects(updatedSubjects);
    if (!isAuthenticated) return;
    await saveSubjects(updatedSubjects);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const formData = new FormData(e.target);
    formData.append('mode', authMode);
    const result = await authUser(formData);
    if (result.error) { setAuthError(result.error); }
    else { setShowAuthModal(false); window.location.reload(); }
  };

  const handleLogout = async () => { await logout(); window.location.reload(); };

  const handleMigrate = () => {
    const localData = localStorage.getItem("gate_subjects_v5");
    if (localData) {
      saveToDB(JSON.parse(localData));
      alert("Successfully migrated local data to the database!");
    } else {
      alert("No local data found under 'gate_subjects_v5'.");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    let _s = [...subjects];
    const item = _s.splice(dragItem.current, 1)[0];
    _s.splice(dragOverItem.current, 0, item);
    dragItem.current = null; dragOverItem.current = null;
    saveToDB(_s);
  };

  // ── Template: save ──
  const handleSaveAsTemplate = async (subject, templateTitle) => {
    const result = await saveTemplate({
      title:       templateTitle,
      subjectName: subject.title,
      coaching:    subject.coaching || '',
      modules:     subject.modules  || [],
    });
    if (result.success) {
      const updated = await getTemplates();
      setTemplates(updated || []);
      alert(`Template "${templateTitle}" saved! Your friends can now load it from the Templates panel.`);
    }
    setSavingTemplateSubject(null);
  };

  // ── Template: delete ──
  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm("Delete this template?")) return;
    await deleteTemplate(templateId);
    setTemplates(prev => prev.filter(t => t._id !== templateId));
  };

  // ── Template: use (pre-fill form) ──
  const handleUseTemplate = (template) => {
    setNewSubject(template.subjectName || '');
    setCoaching(template.coaching || '');
    setSelectedTemplate(template);
    setTrackMode('syllabus'); // shows the syllabus section; we bypass parsing
    setSyllabusInput(''); // clear any old text
    setShowTemplatesModal(false);
    // Scroll to top so user sees the pre-filled form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Syllabus parser (unchanged) ──
 const parseSyllabus = (text) => {
  const lines = text.split('\n');
  const modules = [];
  let currentModule = null;

  // ── Detect Go Classes tab-separated format ──────────────────────────────────
  // Go Classes exports look like: "ondemand_video\tTitle 199:00\t"
  // Module headers either start with \t or use "label_important\t..."
  const isGoClassesFormat = lines.some(l => {
    return /^(ondemand_video|live_tv|picture_as_pdf|description|label_important)\t/.test(l.trim())
        || /^\t/.test(l);  // raw line starts with a tab → module header
  });

  if (isGoClassesFormat) {
    for (let i = 0; i < lines.length; i++) {
      const raw  = lines[i];       // keep raw so we can detect a leading \t
      const line = raw.trim();
      if (!line) continue;

      const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) continue;

      const icon    = parts[0];
      const content = parts[1] || '';

      // ── Module header ──────────────────────────────────────────────────────
      //  • raw line starts with \t  →  the tab-stripped text IS the title
      //  • icon === 'label_important'  →  content is the title
      const isModuleLine =
        raw.startsWith('\t') ||
        icon === 'label_important' ||
        /^Module\s+\d+/i.test(icon);

      if (isModuleLine) {
        const title = (icon === 'label_important') ? content : icon;
        if (!title) continue;
        currentModule = {
          id: `mod_${Date.now()}_${i}`,
          title,
          lectures: [],
          isExpanded: false,
        };
        modules.push(currentModule);
        continue;
      }

      // ── Video lectures only (skip PDFs / description / PYQ sheets) ─────────
      if (icon === 'ondemand_video' || icon === 'live_tv') {
        if (!currentModule) {
          currentModule = {
            id: `mod_general_${Date.now()}_${i}`,
            title: 'General',
            lectures: [],
            isExpanded: false,
          };
          modules.push(currentModule);
        }

        let title       = content;
        let durationMin = 0;

        // Duration pattern at end of title: "199:00"  "21:00"  "166:00"
        // Format is MM:SS where MM can be > 60 — we just want the minute count
        const durMatch = title.match(/\s+(\d+):(\d{2})\s*$/);
        if (durMatch) {
          durationMin = parseInt(durMatch[1], 10);
          title       = title.replace(durMatch[0], '').trim();
        }

        currentModule.lectures.push({
          id:          `lec_${Date.now()}_${i}_${Math.random()}`,
          title,
          durationMin,
          isCompleted:  false,
          isTodayGoal:  false,
          link:         '',
        });
      }
      // picture_as_pdf / description → silently skipped (notes, PYQ sheets)
    }

  } else {
    // ── Original dash-based format ───────────────────────────────────────────
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line || line.startsWith('===')) continue;

      if (!line.startsWith('-')) {
        currentModule = {
          id: `mod_${Date.now()}_${i}`,
          title: line,
          lectures: [],
          isExpanded: false,
        };
        modules.push(currentModule);
      } else {
        const timeMatch =
          line.match(/\[Timing:\s*([^\]]+)\]/i) ||
          line.match(/\[Time:\s*([^\]]+)\]/i);
        let durationMin = 0;
        let cleanTitle  = line.replace(/^-?\s*/, '');

        if (timeMatch) {
          const timeStr = timeMatch[1].trim();
          if (timeStr.toUpperCase() !== 'NULL') {
            const parts = timeStr.split(':');
            if (parts.length >= 2) durationMin = parseInt(parts[0], 10);
            else durationMin = parseInt(timeStr, 10) || 0;
          }
          cleanTitle = cleanTitle
            .replace(/\[Timing:\s*([^\]]+)\]/i, '')
            .replace(/\[Time:\s*([^\]]+)\]/i, '')
            .trim();
        }

        if (!currentModule) {
          currentModule = {
            id: `mod_general_${Date.now()}_${i}`,
            title: 'General Lectures',
            lectures: [],
            isExpanded: false,
          };
          modules.push(currentModule);
        }

        currentModule.lectures.push({
          id:          `lec_${Date.now()}_${i}`,
          title:       cleanTitle,
          durationMin,
          isCompleted:  false,
          isTodayGoal:  false,
          link:         '',
        });
      }
    }
  }

  return modules;
};

  // ── Add subject ──
  const addSubject = (e) => {
    e.preventDefault();
    if (!newSubject) return;

    let startDate = customStartDate ? new Date(customStartDate) : new Date();
    let endDate, durationDays;
    if (customEndDate) {
      endDate = new Date(customEndDate); endDate.setHours(23, 59, 59, 999);
      durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    } else if (duration) {
      durationDays = parseFloat(duration);
      endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    } else { alert("Please provide either a Duration (Days) or an End Date."); return; }

    let modules = [], finalTaskTotal = 0, finalTaskName = "Tasks";

    if (selectedTemplate) {
      // ── Load modules straight from the template (already cleaned) ──
      modules = selectedTemplate.modules.map(m => ({
        ...m,
        id: `mod_${Date.now()}_${Math.random()}`,
        isExpanded: false,
        lectures: (m.lectures || []).map(l => ({
          ...l,
          id: `lec_${Date.now()}_${Math.random()}`,
          isCompleted: false,
          isTodayGoal: false,
          link: l.link || "",
        })),
      }));
      finalTaskTotal = modules.reduce((acc, mod) => acc + mod.lectures.length, 0);
      finalTaskName  = "Lectures";
    } else if (trackMode === "syllabus" && syllabusInput.trim()) {
      modules        = parseSyllabus(syllabusInput);
      finalTaskTotal = modules.reduce((acc, mod) => acc + mod.lectures.length, 0);
      finalTaskName  = "Lectures";
    } else if (trackMode === "manual" && taskTotal) {
      finalTaskTotal = parseInt(taskTotal || 0);
      finalTaskName  = taskName || "Tasks";
    }

    saveToDB([...subjects, {
      id: Date.now(),
      title:        newSubject,
      coaching:     coaching || '',           // ← NEW field
      startDate:    startDate.toISOString(),
      endDate:      endDate.toISOString(),
      durationDays,
      taskName:     finalTaskName,
      taskTotal:    finalTaskTotal,
      taskCompleted: 0,
      isManuallyCompleted: false,
      modules,
    }]);

    // Reset form
    setNewSubject(""); setCoaching(""); setDuration("");
    setCustomStartDate(""); setCustomEndDate("");
    setTrackMode("manual"); setTaskName(""); setTaskTotal(""); setSyllabusInput("");
    setSelectedTemplate(null);
  };

  const deleteSubject = (id) => { saveToDB(subjects.filter(s => s.id !== id)); if (activeSubjectId === id) setActiveSubjectId(null); };

  const updateSubject = (id, newStartIso, newEndIso, newTaskTotal, isManuallyCompleted) => {
    saveToDB(subjects.map(s => {
      if (s.id !== id) return s;
      const start = new Date(newStartIso), end = new Date(newEndIso);
      end.setHours(23, 59, 59, 999);
      return { ...s, startDate: start.toISOString(), endDate: end.toISOString(), durationDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24)), taskTotal: newTaskTotal !== undefined ? Math.max(s.taskCompleted, parseInt(newTaskTotal || 0)) : s.taskTotal, isManuallyCompleted };
    }));
  };

  const addToProgress = (id, amountToAdd) => {
    const val = parseInt(amountToAdd);
    if (isNaN(val) || val === 0) return;
    saveToDB(subjects.map(s => s.id === id ? { ...s, taskCompleted: Math.min((s.taskCompleted || 0) + val, s.taskTotal) } : s));
  };

  const toggleLecture = (subjectId, moduleId, lectureId) => {
    const updated = subjects.map(s => {
      if (s.id !== subjectId) return s;
      const newModules = s.modules.map(m => {
        if (m.id !== moduleId) return m;
        return { ...m, lectures: m.lectures.map(l => l.id === lectureId ? { ...l, isCompleted: !l.isCompleted } : l) };
      });
      return { ...s, modules: newModules, taskCompleted: newModules.reduce((acc, m) => acc + m.lectures.filter(l => l.isCompleted).length, 0) };
    });
    saveToDB(updated);
  };

  const toggleModuleComplete = (subjectId, moduleId) => {
    const updated = subjects.map(s => {
      if (s.id !== subjectId) return s;
      const newModules = s.modules.map(m => {
        if (m.id !== moduleId) return m;
        const allCompleted = m.lectures.length > 0 && m.lectures.every(l => l.isCompleted);
        return { ...m, lectures: m.lectures.map(l => ({ ...l, isCompleted: !allCompleted })) };
      });
      return { ...s, modules: newModules, taskCompleted: newModules.reduce((acc, m) => acc + m.lectures.filter(l => l.isCompleted).length, 0) };
    });
    saveToDB(updated);
  };

  const toggleModuleExpand = (subjectId, moduleId) => {
    saveToDB(subjects.map(s => s.id !== subjectId ? s : { ...s, modules: s.modules.map(m => m.id === moduleId ? { ...m, isExpanded: !m.isExpanded } : m) }));
  };

  const deleteModule = (subjectId, moduleId) => {
    if (!window.confirm("Delete this entire module?")) return;
    saveToDB(subjects.map(s => {
      if (s.id !== subjectId) return s;
      const newModules = s.modules.filter(m => m.id !== moduleId);
      return { ...s, modules: newModules, taskTotal: newModules.reduce((a, m) => a + m.lectures.length, 0), taskCompleted: newModules.reduce((a, m) => a + m.lectures.filter(l => l.isCompleted).length, 0) };
    }));
  };

  const deleteLecture = (subjectId, moduleId, lectureId) => {
    saveToDB(subjects.map(s => {
      if (s.id !== subjectId) return s;
      const newModules = s.modules.map(m => m.id !== moduleId ? m : { ...m, lectures: m.lectures.filter(l => l.id !== lectureId) });
      return { ...s, modules: newModules, taskTotal: newModules.reduce((a, m) => a + m.lectures.length, 0), taskCompleted: newModules.reduce((a, m) => a + m.lectures.filter(l => l.isCompleted).length, 0) };
    }));
  };

  const addModule  = (subjectId, title) => {
    saveToDB(subjects.map(s => s.id !== subjectId ? s : { ...s, modules: [...s.modules, { id: `mod_${Date.now()}`, title, lectures: [], isExpanded: true }] }));
  };

  const addLecture = (subjectId, moduleId, title, durationMin, insertIndex = null) => {
    saveToDB(subjects.map(s => {
      if (s.id !== subjectId) return s;
      const newModules = s.modules.map(m => {
        if (m.id !== moduleId) return m;
        const newLec = {
          id: `lec_${Date.now()}_${Math.random()}`,
          title,
          durationMin: parseInt(durationMin) || 0,
          isCompleted: false,
          isTodayGoal: false,
          link: ""
        };
        const updatedLectures = [...m.lectures];
        if (insertIndex !== null && insertIndex >= 0) {
          updatedLectures.splice(insertIndex, 0, newLec);
        } else {
          updatedLectures.push(newLec);
        }
        return { ...m, lectures: updatedLectures };
      });
      return { ...s, modules: newModules, taskTotal: newModules.reduce((a, m) => a + m.lectures.length, 0) };
    }));
  };

  const toggleTodayGoal = (subjectId, moduleId, lectureId) => {
    saveToDB(subjects.map(s => {
      if (s.id !== subjectId) return s;
      return { ...s, modules: s.modules.map(m => m.id !== moduleId ? m : { ...m, lectures: m.lectures.map(l => l.id === lectureId ? { ...l, isTodayGoal: !l.isTodayGoal } : l) }) };
    }));
  };

  const completeAllTodayGoals = (subjectId) => {
    saveToDB(subjects.map(s => {
      if (s.id !== subjectId) return s;
      const newModules = s.modules.map(m => ({ ...m, lectures: m.lectures.map(l => l.isTodayGoal ? { ...l, isCompleted: true } : l) }));
      return { ...s, modules: newModules, taskCompleted: newModules.reduce((a, m) => a + m.lectures.filter(l => l.isCompleted).length, 0) };
    }));
  };

  const clearTodayGoals = (subjectId) => {
    saveToDB(subjects.map(s => s.id !== subjectId ? s : { ...s, modules: s.modules.map(m => ({ ...m, lectures: m.lectures.map(l => ({ ...l, isTodayGoal: false })) })) }));
  };

  const updateLectureDuration = (subjectId, moduleId, lectureId, newDuration) => {
    saveToDB(subjects.map(s => {
      if (s.id !== subjectId) return s;
      return { ...s, modules: s.modules.map(m => m.id !== moduleId ? m : { ...m, lectures: m.lectures.map(l => l.id === lectureId ? { ...l, durationMin: parseInt(newDuration) || 0 } : l) }) };
    }));
  };

  const updateLectureLink = (subjectId, moduleId, lectureId, newLink) => {
    saveToDB(subjects.map(s => {
      if (s.id !== subjectId) return s;
      return { ...s, modules: s.modules.map(m => m.id !== moduleId ? m : { ...m, lectures: m.lectures.map(l => l.id === lectureId ? { ...l, link: newLink } : l) }) };
    }));
  };

  // ── DETAIL VIEW ──
  if (activeSubjectId) {
    const subject = subjects.find(s => s.id === activeSubjectId);
    if (!subject) return null;
    return (
      <>
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
          onToggleTodayGoal={toggleTodayGoal}
          onUpdateLectureDuration={updateLectureDuration}
          onUpdateLectureLink={updateLectureLink}
          onSaveAsTemplate={() => setSavingTemplateSubject(subject)}
        />
        <FloatingGoalWidget
          subject={subject}
          onToggleLecture={toggleLecture}
          onCompleteAllTodayGoals={completeAllTodayGoals}
          onClearTodayGoals={clearTodayGoals}
          onToggleTodayGoal={toggleTodayGoal}
        />
        {savingTemplateSubject && (
          <SaveTemplateDialog
            subject={savingTemplateSubject}
            onSave={(title) => handleSaveAsTemplate(savingTemplateSubject, title)}
            onClose={() => setSavingTemplateSubject(null)}
          />
        )}
      </>
    );
  }

  // ── DASHBOARD ──
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-mono flex flex-col">

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <input type="text"     name="username" placeholder="Username" required className="bg-gray-700 border border-gray-600 rounded px-3 py-2 outline-none focus:border-blue-500 text-white" />
              <input type="password" name="password" placeholder="Password" required className="bg-gray-700 border border-gray-600 rounded px-3 py-2 outline-none focus:border-blue-500 text-white" />
              {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition-colors mt-2">{authMode === 'login' ? 'Login' : 'Sign Up'}</button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-400">
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-blue-400 hover:underline">{authMode === 'login' ? 'Sign Up' : 'Login'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <TemplatesModal
          templates={templates}
          username={username}
          onUse={handleUseTemplate}
          onDelete={handleDeleteTemplate}
          onClose={() => setShowTemplatesModal(false)}
        />
      )}

      {/* Save-as-template dialog (from dashboard) */}
      {savingTemplateSubject && (
        <SaveTemplateDialog
          subject={savingTemplateSubject}
          onSave={(title) => handleSaveAsTemplate(savingTemplateSubject, title)}
          onClose={() => setSavingTemplateSubject(null)}
        />
      )}

      {/* ── HEADER ── */}
      <header className="p-4 bg-gray-800 border-b border-gray-700 shadow-lg z-20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2"><Activity /> GATE CSE TRACKER</h1>
          <div className="flex items-center gap-3">
            {/* Templates button — always visible when authenticated */}
            {isAuthenticated && (
              <button
                onClick={() => setShowTemplatesModal(true)}
                className="flex items-center gap-2 text-xs bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/50 px-3 py-1.5 rounded transition-colors font-bold"
              >
                <Bookmark size={14} /> Templates {templates.length > 0 && <span className="bg-purple-500/30 px-1.5 rounded-full">{templates.length}</span>}
              </button>
            )}
            {!isAuthenticated ? (
              <button onClick={() => setShowAuthModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded font-bold transition-colors flex items-center gap-2 text-sm"><UserIcon size={16} /> Log In</button>
            ) : (
              <>
                <button onClick={handleMigrate} className="flex items-center gap-2 text-xs bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 border border-yellow-500/50 px-3 py-1.5 rounded transition-colors"><Database size={14} /> Migrate Local Data</button>
                <div className="flex items-center gap-3 bg-gray-700/50 px-3 py-1.5 rounded border border-gray-600">
                  <span className="text-sm font-bold text-gray-300">Hi, {username}</span>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors"><LogOut size={16} /></button>
                </div>
              </>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <form onSubmit={addSubject} className="flex flex-col gap-4">

            {/* ── Template banner (shown when a template is pre-selected) ── */}
            {selectedTemplate && (
              <div className="flex items-center gap-3 bg-purple-900/30 border border-purple-500/40 rounded-lg px-4 py-2.5 text-sm">
                <Bookmark size={15} className="text-purple-400 shrink-0" />
                <span className="text-purple-300 font-bold">Using template:</span>
                <span className="text-purple-200">{selectedTemplate.title}</span>
                {selectedTemplate.coaching && <span className="text-xs bg-purple-500/20 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full">{selectedTemplate.coaching}</span>}
                <button type="button" onClick={() => { setSelectedTemplate(null); setSyllabusInput(''); setNewSubject(''); setCoaching(''); }} className="ml-auto text-gray-500 hover:text-red-400 transition-colors">
                  <X size={15} />
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-4 items-end bg-gray-800/50">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Subject Name</label>
                <input required type="text" placeholder="e.g. DBMS" value={newSubject} onChange={e => setNewSubject(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-48 outline-none focus:border-blue-500" />
              </div>
              {/* ── NEW: Coaching / Resource field ── */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Coaching / Resource</label>
                <input type="text" placeholder="e.g. Go Classes" value={coaching} onChange={e => setCoaching(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-36 outline-none focus:border-purple-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Start Date (Optional)</label>
                <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-36 outline-none text-sm text-gray-300 focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-xs ${customEndDate ? 'text-gray-600' : 'text-gray-400'}`}>Days Duration</label>
                <input type="number" placeholder="15" value={duration} disabled={!!customEndDate} onChange={e => setDuration(e.target.value)} className={`bg-gray-700 border border-gray-600 rounded px-3 py-2 w-24 outline-none ${customEndDate ? 'opacity-30' : ''}`} />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-bold px-2">OR</div>
              <div className="flex flex-col gap-1">
                <label className={`text-xs ${duration ? 'text-gray-600' : 'text-gray-400'}`}>End Date</label>
                <input type="date" value={customEndDate} disabled={!!duration} onChange={e => setCustomEndDate(e.target.value)} className={`bg-gray-700 border border-gray-600 rounded px-3 py-2 w-36 outline-none text-sm text-gray-300 ${duration ? 'opacity-30' : ''}`} />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-700 pt-3">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-gray-400">Task Tracking Setup:</span>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="trackMode" checked={trackMode === "none"}    onChange={() => { setTrackMode("none");    setSelectedTemplate(null); }} /><span className="text-sm text-gray-300">None</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="trackMode" checked={trackMode === "manual"}  onChange={() => { setTrackMode("manual");  setSelectedTemplate(null); }} /><span className="text-sm text-gray-300">Manual Numbers</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="trackMode" checked={trackMode === "syllabus"} onChange={() => setTrackMode("syllabus")} /><span className="text-sm text-blue-400 font-semibold">Paste Syllabus</span></label>
                {/* Quick shortcut to open templates browser */}
                <button type="button" onClick={() => setShowTemplatesModal(true)} className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-500/60 px-2.5 py-1 rounded transition-colors ml-auto">
                  <Bookmark size={12} /> Load from Template
                </button>
              </div>

              {trackMode === "manual" && !selectedTemplate && (
                <div className="flex gap-2 items-center">
                  <input type="text"   placeholder="Unit (e.g. PYQs)"     value={taskName}  onChange={e => setTaskName(e.target.value)}  className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 w-40 text-sm outline-none focus:border-blue-500" />
                  <input type="number" placeholder="Total (e.g. 150)"     value={taskTotal} onChange={e => setTaskTotal(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 w-32 text-sm outline-none focus:border-blue-500" />
                </div>
              )}

              {trackMode === "syllabus" && !selectedTemplate && (
                <textarea placeholder="Paste syllabus... (- Lecture Title [Timing: 30:00])" value={syllabusInput} onChange={e => setSyllabusInput(e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded p-3 w-full h-32 text-sm outline-none focus:border-blue-500 resize-y font-mono" />
              )}

              {selectedTemplate && (
                <p className="text-xs text-gray-500 italic">
                  {selectedTemplate.modules?.length} modules · {selectedTemplate.modules?.reduce((a, m) => a + (m.lectures?.length || 0), 0)} lectures will be loaded from template.
                </p>
              )}

              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded flex items-center justify-center gap-2 transition-colors text-sm w-48 mt-2"><Plus size={16} /> Add Tracker</button>
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
            <button onClick={() => setShowAuthModal(true)} className="bg-blue-600/20 text-blue-400 border border-blue-500/50 px-6 py-2 rounded font-bold hover:bg-blue-600/40 transition-colors">Log In</button>
          </div>
        ) : subjects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
            <Clock size={64} className="mb-4" />
            <p className="text-xl">No active subjects.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {subjects.map((subject, index) => (
              <div key={subject.id} draggable onDragStart={() => dragItem.current = index} onDragEnter={() => dragOverItem.current = index} onDragEnd={handleSort} onDragOver={e => e.preventDefault()} className="cursor-move">
                <SubjectStrip
                  subject={subject}
                  currentTime={currentTime}
                  onDelete={deleteSubject}
                  onAddToProgress={addToProgress}
                  onUpdate={updateSubject}
                  onOpenDetail={() => setActiveSubjectId(subject.id)}
                  onSaveAsTemplate={() => setSavingTemplateSubject(subject)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


// ============================================================
// SUB-COMPONENT: DETAIL VIEW
// ============================================================
function SyllabusDetailView({
  subject, onBack,
  onToggleLecture, onToggleExpand, onDeleteModule, onDeleteLecture,
  onToggleModuleComplete, onAddModule, onAddLecture,
  onToggleTodayGoal, onUpdateLectureDuration, onUpdateLectureLink, onSaveAsTemplate,
}) {
  const [addingModule,     setAddingModule]    = useState(false);
  const [newModTitle,      setNewModTitle]     = useState("");
  const [addLecForm,       setAddLecForm]      = useState({ moduleId: null, index: null });
  const [newLecTitle,      setNewLecTitle]     = useState("");
  const [newLecDuration,   setNewLecDuration]  = useState("");

  let totalMins = 0, completedMins = 0;
  subject.modules.forEach(m => m.lectures.forEach(l => { totalMins += l.durationMin; if (l.isCompleted) completedMins += l.durationMin; }));

  const isFullyComplete = subject.taskTotal > 0 && subject.taskCompleted >= subject.taskTotal;
  const progressPerc    = subject.taskTotal > 0 ? (subject.taskCompleted / subject.taskTotal) * 100 : 0;
  const hrsTotal        = (totalMins / 60).toFixed(1);
  const hrsLeft         = ((totalMins - completedMins) / 60).toFixed(1);
  const goalCount       = subject.modules.reduce((a, m) => a + m.lectures.filter(l => l.isTodayGoal).length, 0);
  const goalDoneCount   = subject.modules.reduce((a, m) => a + m.lectures.filter(l => l.isTodayGoal && l.isCompleted).length, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-mono flex flex-col">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-30 bg-gray-800 border-b border-gray-700 shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={20} /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            {/* Save as Template button */}
            <button
              onClick={onSaveAsTemplate}
              className="flex items-center gap-1.5 text-xs bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/40 px-3 py-1.5 rounded transition-colors font-bold"
              title="Save this subject's checklist as a reusable template"
            >
              <Bookmark size={13} /> Save as Template
            </button>
            {goalCount > 0 && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${goalDoneCount === goalCount ? 'bg-green-900/30 border-green-500/40 text-green-400' : 'bg-orange-900/30 border-orange-500/40 text-orange-300'}`}>
                <Flame size={13} />
                Today: {goalDoneCount}/{goalCount}
                {goalDoneCount === goalCount && <CheckCircle size={13} />}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{subject.title}</h1>
            {/* Show coaching badge in detail view */}
            {subject.coaching && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-500/20 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full font-bold mb-2">
                <BookOpen size={10} /> {subject.coaching}
              </span>
            )}
            <div className="flex gap-4 text-sm text-gray-400">
              <span><List size={14} className="inline mr-1" />{subject.taskCompleted} / {subject.taskTotal} Topics</span>
              <span><Clock size={14} className="inline mr-1" />{hrsLeft} hrs remaining (of {hrsTotal} hrs)</span>
            </div>
          </div>
          {isFullyComplete && <div className="text-green-500 font-bold border border-green-500 px-3 py-1 rounded">ALL COMPLETED</div>}
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progressPerc}%` }}></div>
        </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto max-w-5xl mx-auto w-full pb-24">
        {subject.modules.map(mod => {
          const modCompleted = mod.lectures.filter(l => l.isCompleted).length;
          const allLecturesCompleted = mod.lectures.length > 0 && modCompleted === mod.lectures.length;
          const modGoalCount = mod.lectures.filter(l => l.isTodayGoal).length;

          return (
            <div key={mod.id} className="mb-8 bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden">
              <div
                className="bg-gray-800 p-3 border-b border-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-700/80 transition-colors group"
                onClick={() => onToggleExpand(subject.id, mod.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-gray-400">{mod.isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
                  <div className="mt-0.5" onClick={e => { e.stopPropagation(); onToggleModuleComplete(subject.id, mod.id); }}>
                    {allLecturesCompleted ? <CheckSquare className="text-green-500" size={20} /> : <Square className="text-gray-400 hover:text-blue-400" size={20} />}
                  </div>
                  <h2 className="font-bold text-lg text-blue-300 select-none ml-1">{mod.title}</h2>
                  {modGoalCount > 0 && <span className="text-[10px] bg-orange-500/20 border border-orange-500/40 text-orange-400 px-1.5 py-0.5 rounded-full font-bold">🎯 {modGoalCount}</span>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 font-bold bg-gray-900 px-2 py-1 rounded">{modCompleted}/{mod.lectures.length}</span>
                  <button onClick={e => { e.stopPropagation(); onDeleteModule(subject.id, mod.id); }} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={18} /></button>
                </div>
              </div>

              {mod.isExpanded && (
                <div className="divide-y divide-gray-700/50">
                  {mod.lectures.map((lecture, idx) => (
                    <React.Fragment key={lecture.id}>
                      <LectureRow
                        lecture={lecture}
                        subjectId={subject.id}
                        moduleId={mod.id}
                        onToggleLecture={onToggleLecture}
                        onToggleTodayGoal={onToggleTodayGoal}
                        onDeleteLecture={onDeleteLecture}
                        onUpdateLectureDuration={onUpdateLectureDuration}
                        onUpdateLectureLink={onUpdateLectureLink}
                        onInsertBelow={() => setAddLecForm({ moduleId: mod.id, index: idx + 1 })}
                      />
                      {addLecForm.moduleId === mod.id && addLecForm.index === idx + 1 && (
                        <div className="p-3 bg-gray-800/40 ml-6 border-l-2 border-blue-500/50 flex gap-2 transition-all">
                          <input autoFocus type="text" placeholder="Topic Name..." value={newLecTitle} onChange={e => setNewLecTitle(e.target.value)} className="bg-gray-700 text-sm p-1.5 rounded flex-grow outline-none border border-gray-600 focus:border-blue-500" />
                          <input type="number" placeholder="Mins" value={newLecDuration} onChange={e => setNewLecDuration(e.target.value)} className="bg-gray-700 text-sm p-1.5 rounded w-20 outline-none border border-gray-600 focus:border-blue-500" />
                          <button onClick={() => { if (!newLecTitle.trim()) return; onAddLecture(subject.id, mod.id, newLecTitle, newLecDuration, idx + 1); setNewLecTitle(""); setNewLecDuration(""); setAddLecForm({ moduleId: null, index: null }); }} className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded text-sm font-bold">Insert Here</button>
                          <button onClick={() => setAddLecForm({ moduleId: null, index: null })} className="bg-gray-600 hover:bg-gray-500 text-white px-2 rounded"><X size={16} /></button>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                  <div className="p-3 bg-gray-800/20">
                    {addLecForm.moduleId === mod.id && addLecForm.index === null ? (
                      <div className="flex gap-2">
                        <input type="text" placeholder="Topic Name..." value={newLecTitle} onChange={e => setNewLecTitle(e.target.value)} className="bg-gray-700 text-sm p-1.5 rounded flex-grow outline-none border border-gray-600 focus:border-blue-500" autoFocus />
                        <input type="number" placeholder="Mins" value={newLecDuration} onChange={e => setNewLecDuration(e.target.value)} className="bg-gray-700 text-sm p-1.5 rounded w-20 outline-none border border-gray-600 focus:border-blue-500" />
                        <button onClick={() => { if (!newLecTitle.trim()) return; onAddLecture(subject.id, mod.id, newLecTitle, newLecDuration, null); setNewLecTitle(""); setNewLecDuration(""); setAddLecForm({ moduleId: null, index: null }); }} className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded text-sm font-bold">Add</button>
                        <button onClick={() => setAddLecForm({ moduleId: null, index: null })} className="bg-gray-600 hover:bg-gray-500 text-white px-2 rounded"><X size={16} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setAddLecForm({ moduleId: mod.id, index: null })} className="text-sm text-gray-500 hover:text-blue-400 flex items-center gap-1 transition-colors pl-8"><Plus size={16} /> Add Topic</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="mb-12 border border-dashed border-gray-600 rounded-lg p-4 bg-gray-800/10 text-center">
          {addingModule ? (
            <div className="flex gap-2 max-w-md mx-auto">
              <input type="text" placeholder="Module/Chapter Name..." value={newModTitle} onChange={e => setNewModTitle(e.target.value)} className="bg-gray-700 text-sm p-2 rounded flex-grow outline-none border border-gray-600 focus:border-blue-500" autoFocus />
              <button onClick={() => { if (!newModTitle.trim()) return; onAddModule(subject.id, newModTitle); setNewModTitle(""); setAddingModule(false); }} className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded font-bold">Add</button>
              <button onClick={() => setAddingModule(false)} className="bg-gray-600 hover:bg-gray-500 text-white px-3 rounded"><X size={18} /></button>
            </div>
          ) : (
            <button onClick={() => setAddingModule(true)} className="text-gray-400 hover:text-blue-400 flex items-center justify-center gap-2 w-full transition-colors font-bold"><Plus size={20} /> Add New Module / Chapter</button>
          )}
        </div>
      </div>
    </div>
  );
}


// ============================================================
// SUB-COMPONENT: SINGLE LECTURE ROW
// ============================================================
function LectureRow({ lecture, subjectId, moduleId, onToggleLecture, onToggleTodayGoal, onDeleteLecture, onUpdateLectureDuration, onUpdateLectureLink, onInsertBelow }) {
  const [editingDuration, setEditingDuration] = useState(false);
  const [draftDuration,   setDraftDuration]   = useState(String(lecture.durationMin || ''));
  const [editingLink,     setEditingLink]     = useState(false);
  const [draftLink,       setDraftLink]       = useState(lecture.link || '');

  const saveDuration = () => {
    onUpdateLectureDuration(subjectId, moduleId, lecture.id, draftDuration);
    setEditingDuration(false);
  };

  const saveLink = () => {
    let finalLink = draftLink.trim();
    if (finalLink && !finalLink.startsWith('http')) {
      finalLink = 'https://' + finalLink;
    }
    onUpdateLectureLink(subjectId, moduleId, lecture.id, finalLink);
    setEditingLink(false);
  };

  return (
    <div className={`flex items-center gap-2 p-3 group transition-colors ${
      lecture.isTodayGoal && !lecture.isCompleted ? 'bg-orange-900/15 border-l-2 border-orange-500/60' : lecture.isCompleted ? 'opacity-60 bg-gray-800/20' : 'hover:bg-gray-700/40'
    }`}>
      <label className="flex items-start gap-3 flex-grow cursor-pointer pl-2 min-w-0">
        <div className="mt-0.5 shrink-0">
          <input type="checkbox" checked={lecture.isCompleted} onChange={() => onToggleLecture(subjectId, moduleId, lecture.id)} className="sr-only" />
          {lecture.isCompleted ? <CheckSquare className="text-green-500" size={20} /> : <Square className="text-gray-500 hover:text-green-400 transition-colors" size={20} />}
        </div>
        <p className={`text-sm truncate ${lecture.isCompleted ? 'line-through text-gray-500' : lecture.isTodayGoal ? 'text-orange-200' : 'text-gray-200'}`}>
          {lecture.title}
        </p>
      </label>

      <div className="flex items-center gap-2 shrink-0">

        {/* ── Link Edit / View Logic ── */}
        {editingLink ? (
          <div className="flex items-center gap-1">
            <input 
              type="url" 
              value={draftLink} 
              onChange={e => setDraftLink(e.target.value)} 
              onBlur={saveLink} 
              onKeyDown={e => { if (e.key === 'Enter') saveLink(); if (e.key === 'Escape') { setDraftLink(lecture.link || ''); setEditingLink(false); } }} 
              autoFocus 
              placeholder="Paste URL..." 
              className="bg-gray-700 border border-blue-500/60 text-blue-300 text-xs rounded px-2 py-1 w-32 outline-none font-mono" 
            />
            <button onClick={saveLink} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
          </div>
        ) : lecture.link ? (
          <div className="flex items-center gap-1">
            <a href={lecture.link} target="_blank" rel="noreferrer" title="Open Link" className="text-blue-400 hover:text-blue-300 p-1 transition-colors">
              <ExternalLink size={16} />
            </a>
            <button onClick={() => setEditingLink(true)} title="Edit Link" className="text-gray-600 hover:text-gray-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit2 size={12} />
            </button>
          </div>
        ) : (
          <button onClick={() => setEditingLink(true)} title="Add URL / Link" className="text-gray-600 hover:text-blue-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <LinkIcon size={16} />
          </button>
        )}

        {/* ── Duration ── */}
        {editingDuration ? (
          <div className="flex items-center gap-1">
            <input type="number" value={draftDuration} onChange={e => setDraftDuration(e.target.value)} onBlur={saveDuration} onKeyDown={e => { if (e.key === 'Enter') saveDuration(); if (e.key === 'Escape') { setDraftDuration(String(lecture.durationMin || '')); setEditingDuration(false); } }} autoFocus placeholder="0" className="bg-gray-700 border border-orange-500/60 text-orange-300 text-xs rounded px-2 py-1 w-16 outline-none font-mono text-center" />
            <span className="text-xs text-gray-500">min</span>
            <button onClick={saveDuration} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
          </div>
        ) : (
          <button
            onClick={() => { setDraftDuration(String(lecture.durationMin || '')); setEditingDuration(true); }}
            title="Click to edit duration"
            className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded transition-colors group/dur ${
              lecture.durationMin > 0
                ? lecture.isTodayGoal ? 'text-orange-400 bg-orange-900/30 border border-orange-500/30 hover:bg-orange-900/50' : 'text-gray-500 bg-gray-900/50 hover:bg-gray-700 hover:text-gray-300'
                : 'text-red-400/60 bg-gray-900/30 hover:bg-gray-700 border border-dashed border-gray-600'
            }`}
          >
            {lecture.durationMin > 0 ? `${lecture.durationMin} mins` : 'No Time'}
            <Pencil size={10} className="opacity-0 group-hover/dur:opacity-70 transition-opacity ml-0.5" />
          </button>
        )}

        {/* ── Insert Below Control ── */}
        <button onClick={onInsertBelow} title="Insert new lecture below this one" className="text-gray-600 hover:text-green-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus size={16} />
        </button>

        <button onClick={() => onToggleTodayGoal(subjectId, moduleId, lecture.id)} title={lecture.isTodayGoal ? "Remove from today's goal" : "Add to today's goal"}
          className={`p-1 rounded transition-all active:scale-90 ${lecture.isTodayGoal ? 'text-orange-400 bg-orange-500/20 hover:bg-orange-500/30' : 'text-gray-600 hover:text-orange-400 opacity-0 group-hover:opacity-100'}`}>
          <Target size={16} />
        </button>

        <button onClick={() => onDeleteLecture(subjectId, moduleId, lecture.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"><X size={16} /></button>
      </div>
    </div>
  );
}


// ============================================================
// SUB-COMPONENT: DASHBOARD STRIP
// ============================================================
function SubjectStrip({ subject, currentTime, onDelete, onAddToProgress, onUpdate, onOpenDetail, onSaveAsTemplate }) {
  const [addAmount,       setAddAmount]       = useState("");
  const [isEditing,       setIsEditing]       = useState(false);
  const [tempStart,       setTempStart]       = useState("");
  const [tempEnd,         setTempEnd]         = useState("");
  const [tempTaskTotal,   setTempTaskTotal]   = useState("");
  const [tempIsCompleted, setTempIsCompleted] = useState(false);

  const start           = new Date(subject.startDate), end = new Date(subject.endDate);
  const timeElapsed     = currentTime - start, timeLeft = end - currentTime, totalDuration = end - start;
  const isBeforeStart   = timeElapsed < 0, isEnded = timeLeft <= 0 && !isBeforeStart, isRunning = !isBeforeStart && !isEnded;
  const isFullyComplete = subject.isManuallyCompleted || (subject.taskTotal > 0 && subject.taskCompleted >= subject.taskTotal);
  const daysToStart     = Math.ceil(Math.abs(timeElapsed) / (1000 * 60 * 60 * 24));
  const daysRunningLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

  let statusText = "", statusColor = "", displayValue = 0, displayLabel = "";
  if (isFullyComplete)  { statusText = "Completed"; statusColor = "text-green-500"; displayLabel = "Finished"; }
  else if (isBeforeStart) { statusText = "Upcoming";  statusColor = "text-orange-500"; displayValue = daysToStart;     displayLabel = "Days to Start"; }
  else if (isEnded)     { statusText = "Ended";     statusColor = "text-red-500";    displayLabel = "Days Left"; }
  else                  { statusText = "Running";   statusColor = "text-green-500";  displayValue = daysRunningLeft; displayLabel = "Days Left"; }

  const progress       = isFullyComplete || isEnded ? 100 : isRunning ? Math.min(100, Math.max(0, (timeElapsed / totalDuration) * 100)) : 0;
  const hasTask        = subject.taskTotal > 0, hasSyllabus = subject.modules && subject.modules.length > 0;
  const remainingTasks = Math.max(0, subject.taskTotal - subject.taskCompleted);
  const activeDaysForPace = isBeforeStart ? (totalDuration / (1000 * 60 * 60 * 24)) : Math.max(0, timeLeft / (1000 * 60 * 60 * 24));
  const dailyRate      = hasTask ? (remainingTasks / Math.max(0.5, activeDaysForPace)).toFixed(1) : 0;
  const taskProgress   = hasTask ? (subject.taskCompleted / subject.taskTotal) * 100 : 0;

  let totalMins = 0, completedMins = 0;
  if (hasSyllabus) subject.modules.forEach(m => m.lectures.forEach(l => { totalMins += l.durationMin; if (l.isCompleted) completedMins += l.durationMin; }));
  const hrsLeft = ((totalMins - completedMins) / 60).toFixed(1);

  const todayGoalCount     = hasSyllabus ? subject.modules.reduce((a, m) => a + m.lectures.filter(l => l.isTodayGoal).length, 0) : 0;
  const todayGoalDoneCount = hasSyllabus ? subject.modules.reduce((a, m) => a + m.lectures.filter(l => l.isTodayGoal && l.isCompleted).length, 0) : 0;

  const handleAddSubmit = (e) => { e.preventDefault(); if (!addAmount) return; onAddToProgress(subject.id, addAmount); setAddAmount(""); };

  const startEditing = () => {
    setTempStart(new Date(subject.startDate).toISOString().split('T')[0]);
    setTempEnd(new Date(subject.endDate).toISOString().split('T')[0]);
    setTempTaskTotal(subject.taskTotal);
    setTempIsCompleted(subject.isManuallyCompleted || false);
    setIsEditing(true);
  };

  return (
    <div className="relative w-full border border-gray-700 flex flex-col rounded-lg bg-gray-800/40 hover:bg-gray-800 transition-colors group overflow-hidden">
      <div className="absolute top-0 left-0 h-full bg-blue-900/10 pointer-events-none" style={{ width: `${progress}%` }} />
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-700">
        <div className={`h-full transition-all duration-1000 ${isFullyComplete ? 'bg-green-500' : isEnded ? 'bg-red-500' : isBeforeStart ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }} />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 items-center w-full">
        {/* ── LEFT COL ── */}
        <div className="lg:col-span-5 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-700/50 pb-4 lg:pb-0 lg:pr-6">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <GripVertical className="text-gray-600 hover:text-gray-400 cursor-grab" size={20} />
              <div>
                <h2
                  className={`text-2xl font-bold truncate flex items-center gap-2 ${isFullyComplete ? 'text-green-400' : hasSyllabus ? 'text-white hover:text-blue-300 transition-colors cursor-pointer' : 'text-white'}`}
                  onClick={hasSyllabus ? onOpenDetail : undefined}
                >
                  {subject.title} {isFullyComplete && <CheckCircle size={20} />}
                </h2>
                {/* ── Coaching badge ── */}
                {subject.coaching && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-purple-500/20 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full font-bold mt-0.5">
                    <BookOpen size={9} /> {subject.coaching}
                  </span>
                )}
                {todayGoalCount > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Flame size={12} className="text-orange-400" />
                    <span className="text-xs text-orange-400 font-bold">Today: {todayGoalDoneCount}/{todayGoalCount}{todayGoalDoneCount === todayGoalCount ? ' ✓' : ''}</span>
                  </div>
                )}
              </div>
            </div>
            {!isEditing && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Save as Template (only for syllabus subjects) */}
                {hasSyllabus && (
                  <button onClick={onSaveAsTemplate} title="Save as Template" className="text-gray-500 hover:text-purple-400 p-1 rounded transition-colors">
                    <Bookmark size={15} />
                  </button>
                )}
                <button onClick={startEditing} className="text-gray-500 hover:text-blue-400 p-1 rounded transition-colors"><Edit2 size={16} /></button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-3 my-2 bg-gray-900/90 p-3 rounded-lg border border-gray-600 shadow-xl z-50">
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 w-1/2"><label className="text-[10px] text-gray-400 uppercase">Start</label><input type="date" value={tempStart} onChange={e => setTempStart(e.target.value)} className="bg-gray-800 text-xs p-1.5 rounded outline-none border border-gray-600 focus:border-blue-500" /></div>
                <div className="flex flex-col gap-1 w-1/2"><label className="text-[10px] text-gray-400 uppercase">End</label>  <input type="date" value={tempEnd}   onChange={e => setTempEnd(e.target.value)}   className="bg-gray-800 text-xs p-1.5 rounded outline-none border border-gray-600 focus:border-blue-500" /></div>
              </div>
              <div className="flex gap-2 mt-1 pt-2 border-t border-gray-700">
                <button onClick={() => { if (tempStart && tempEnd) { onUpdate(subject.id, tempStart, tempEnd, tempTaskTotal, tempIsCompleted); setIsEditing(false); } }} className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded flex-1 flex justify-center items-center gap-2 text-xs font-bold"><Save size={14} /> Save</button>
                <button onClick={() => setIsEditing(false)} className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded w-10 flex justify-center items-center"><X size={14} /></button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400 mb-4 flex flex-col gap-1 ml-8">
              <span className="flex items-center gap-1"><Calendar size={12} /> Start: {start.toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> Target: {end.toLocaleDateString()}</span>
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
                <button onClick={onOpenDetail} className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors"><FileText size={14} /> Open Checklist</button>
              ) : (
                <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 whitespace-nowrap">Today I did:</span>
                  <input type="number" value={addAmount} placeholder="0" onChange={e => setAddAmount(e.target.value)} className="bg-gray-800 border border-gray-600 rounded w-16 px-2 py-1 text-sm text-center focus:border-blue-500 outline-none" />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded"><Plus size={16} /></button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* ── MIDDLE COL ── */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-700/50 pb-4 lg:pb-0 px-4">
          {isFullyComplete ? (
            <div className="text-green-500 font-bold text-3xl flex items-center gap-3 tracking-widest"><CheckCircle size={36} /> DONE</div>
          ) : hasSyllabus && !isEnded ? (
            <div className="text-center w-full max-w-xs">
              <div className="text-sm text-gray-400 uppercase tracking-widest mb-1 border-b border-gray-700 pb-1">Time Tracking</div>
              <div className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-2 my-2"><Clock size={28} /> {hrsLeft} <span className="text-sm text-gray-500 uppercase tracking-widest mt-2">hrs left</span></div>
              <div className="text-xs text-gray-400 flex justify-between px-2"><span>Pace: {dailyRate} / day</span><span>{remainingTasks} Topics Left</span></div>
            </div>
          ) : hasTask && !hasSyllabus && !isEnded ? (
            <div className="text-center">
              <div className="text-sm text-gray-400 uppercase tracking-widest mb-1">Required Pace</div>
              <div className="text-5xl font-bold text-white flex items-end justify-center gap-2 leading-none">{dailyRate}<span className="text-lg text-blue-400 font-medium mb-1">/day</span></div>
            </div>
          ) : isEnded && remainingTasks > 0 ? (
            <div className="text-red-500 font-bold text-2xl flex items-center gap-2"><AlertCircle /> TIME UP</div>
          ) : (
            <div className="text-gray-600 font-bold text-xl flex flex-col items-center"><PlayCircle size={32} className="mb-2" /> <span>TRACKING TIME</span></div>
          )}
        </div>

        {/* ── RIGHT COL ── */}
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
                <div className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-gray-900/60 border border-gray-700 ${statusColor}`}>STATUS: {statusText}</div>
              </>
            )}
          </div>
          <button onClick={() => onDelete(subject.id)} className="absolute top-0 right-0 lg:top-1 lg:-right-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2"><Trash2 size={20} /></button>
        </div>
      </div>
    </div>
  );
}
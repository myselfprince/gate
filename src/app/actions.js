// src/app/actions.js
'use server'

import connectDB, { User, Template } from '@/lib/db';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'default_secret_key_change_me';
const SECRET = new TextEncoder().encode(secretKey);

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.userId;
  } catch (e) {
    return null;
  }
}

// ── 1. REGISTER / LOGIN ───────────────────────────────────────────────────────
export async function authUser(formData) {
  await connectDB();
  const username = formData.get('username');
  const password  = formData.get('password');
  const mode      = formData.get('mode');

  let user = await User.findOne({ username });

  if (mode === 'register') {
    if (user) return { error: 'User already exists' };
    user = await User.create({ username, password, subjects: [] });
  } else {
    if (!user || user.password !== password) return { error: 'Invalid credentials' };
  }

  const token = await new SignJWT({ userId: user._id.toString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  });

  return { success: true };
}

// ── 2. LOGOUT ─────────────────────────────────────────────────────────────────
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

// ── 3. CHECK AUTH STATUS ──────────────────────────────────────────────────────
export async function checkAuth() {
  const userId = await getUserId();
  if (!userId) return { isAuthenticated: false };

  await connectDB();
  const user = await User.findById(userId);
  return { isAuthenticated: !!user, username: user?.username };
}

// ── 4. GET SUBJECTS ───────────────────────────────────────────────────────────
export async function getSubjects() {
  await connectDB();
  const userId = await getUserId();
  if (!userId) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  return JSON.parse(JSON.stringify(user.subjects || []));
}

// ── 5. SAVE / UPDATE SUBJECTS ─────────────────────────────────────────────────
export async function saveSubjects(subjects) {
  await connectDB();
  const userId = await getUserId();
  if (!userId) return { error: 'Not authenticated' };

  await User.findByIdAndUpdate(userId, { subjects });
  return { success: true };
}

// ── 6. GET ALL TEMPLATES (global — visible to every user) ─────────────────────
export async function getTemplates() {
  await connectDB();
  const templates = await Template.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(templates));
}

// ── 7. SAVE A NEW TEMPLATE ────────────────────────────────────────────────────
// Strips all completion / today-goal state before saving so the template is
// a clean "blank" checklist that anyone can load fresh.
export async function saveTemplate({ title, subjectName, coaching, modules }) {
  await connectDB();
  const userId = await getUserId();
  if (!userId) return { error: 'Not authenticated' };

  const user = await User.findById(userId);

  // Deep-clean: reset isCompleted + isTodayGoal on every lecture
  const cleanModules = (modules || []).map((m) => ({
    ...m,
    id: `mod_tmpl_${m.id}_${Date.now()}`,
    isExpanded: false,
    lectures: (m.lectures || []).map((l) => ({
      ...l,
      id: `lec_tmpl_${l.id}_${Date.now()}`,
      isCompleted: false,
      isTodayGoal: false,
    })),
  }));

  await Template.create({
    title:       title || subjectName,
    subjectName: subjectName || '',
    coaching:    coaching   || '',
    modules:     cleanModules,
    createdBy:   user?.username || 'anonymous',
  });

  return { success: true };
}

// ── 8. DELETE A TEMPLATE ──────────────────────────────────────────────────────
export async function deleteTemplate(templateId) {
  await connectDB();
  const userId = await getUserId();
  if (!userId) return { error: 'Not authenticated' };

  await Template.findByIdAndDelete(templateId);
  return { success: true };
}

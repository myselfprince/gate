// src/lib/db.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// User schema (unchanged)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subjects: { type: Array, default: [] }
});

export const User =
  mongoose.models.GateUser ||
  mongoose.model('GateUser', userSchema, 'gate_users');

// ── NEW: Template schema ──────────────────────────────────────────────────────
// Templates are GLOBAL — any logged-in user can browse and use them. 
// This lets you build a todo for a subject once, then share the site URL
// with a friend who can load the same template with one click.
const templateSchema = new mongoose.Schema({
  title:       { type: String, required: true },  // e.g. "TOC — Go Classes"
  subjectName: { type: String, required: true },  // default subject name on load
  coaching:    { type: String, default: '' },     // e.g. "Go Classes", "PW", "Love Babbar"
  modules:     { type: Array,  default: [] },     // full module+lecture tree, completions reset
  createdBy:   { type: String, default: 'anonymous' },
  createdAt:   { type: Date,   default: Date.now },
});

export const Template =
  mongoose.models.GateTemplate ||
  mongoose.model('GateTemplate', templateSchema, 'gate_templates');

export default connectDB;

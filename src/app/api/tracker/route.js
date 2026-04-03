// src/app/api/tracker/route.js
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

// 1. Safer Connect Function
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  
  // Check if the environment variable is actually loaded
  if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing. Check your .env.local file and restart the server.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB Connected Successfully");
};

// 2. Define Schema
const TrackerSchema = new mongoose.Schema({
  userId: { type: String, default: 'my-gate-tracker' },
  subjects: { type: Array, default: [] }
}, { strict: false });

const TrackerData = mongoose.models.TrackerData || mongoose.model('TrackerData', TrackerSchema);

// 3. GET Method (with Error Handling)
export async function GET() {
  try {
    await connectDB();
    let data = await TrackerData.findOne({ userId: 'my-gate-tracker' });
    if (!data) {
      data = await TrackerData.create({ userId: 'my-gate-tracker', subjects: [] });
    }
    return NextResponse.json(data.subjects);
  } catch (error) {
    console.error("❌ GET API Error:", error.message);
    return NextResponse.json({ error: "Failed to load subjects", details: error.message }, { status: 500 });
  }
}

// 4. POST Method (with Error Handling)
export async function POST(req) {
  try {
    await connectDB();
    const { subjects } = await req.json();
    await TrackerData.findOneAndUpdate(
      { userId: 'my-gate-tracker' },
      { subjects },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ POST API Error:", error.message);
    return NextResponse.json({ error: "Failed to save subjects", details: error.message }, { status: 500 });
  }
}
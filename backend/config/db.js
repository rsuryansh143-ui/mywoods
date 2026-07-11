// ─────────────────────────────────────────────────────────────
//  config/db.js — MongoDB Atlas Connection
//
//  HOW IT WORKS:
//  mongoose.connect() opens a persistent connection pool to
//  MongoDB Atlas. Mongoose reuses this pool for every query —
//  you never need to call connect() again.
//
//  If the URI is wrong or Atlas is unreachable, the process
//  exits immediately with code 1 so you notice instantly.
// ─────────────────────────────────────────────────────────────

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `✅  MongoDB Connected: ${conn.connection.host} — DB: ${conn.connection.name}`
    );
  } catch (error) {
    console.error(`❌  MongoDB connection error: ${error.message}`);
    process.exit(1); // crash fast — don't run with no DB
  }
};

export default connectDB;

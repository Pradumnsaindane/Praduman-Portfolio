import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';

// Realistic starter projects. Edit these, or manage everything from /admin later.
const sampleProjects = [
  {
    title: 'Ledger',
    summary:
      'A double-entry budgeting app with envelope allocations, recurring rules, and a calm monthly review.',
    description:
      'Ledger started as a way to replace a spreadsheet I kept outgrowing. It models money the way accountants do — every rupee moves from one place to another — so the numbers always reconcile. The monthly review walks you through what changed and what to plan next.',
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'Chart.js'],
    role: 'Design & full-stack build',
    year: '2025',
    liveUrl: '',
    repoUrl: 'https://github.com/Pradumnsaindane',
    featured: true,
    order: 1,
  },
  {
    title: 'Relay',
    summary:
      'Realtime team chat with threads, presence, and message search — built to stay fast in busy channels.',
    description:
      'Relay is a small, focused chat app. The interesting work was keeping the UI responsive under load: optimistic sends, windowed message lists, and a WebSocket layer that reconnects gracefully. Search runs server-side with sensible pagination.',
    tech: ['React', 'Socket.IO', 'Express', 'MongoDB'],
    role: 'Full-stack build',
    year: '2024',
    liveUrl: '',
    repoUrl: 'https://github.com/Pradumnsaindane',
    featured: true,
    order: 2,
  },
  {
    title: 'Contrast',
    summary:
      'An accessibility tool that grades color pairs against WCAG and suggests the nearest passing shade.',
    description:
      'Contrast takes two colors and tells you, plainly, whether text will be readable — then nudges each color the smallest perceptual distance needed to pass AA or AAA. It’s the utility I wished I had while building the rest of these projects.',
    tech: ['JavaScript', 'Canvas', 'Color science'],
    role: 'Design & build',
    year: '2024',
    liveUrl: '',
    repoUrl: 'https://github.com/Pradumnsaindane',
    featured: false,
    order: 3,
  },
];

const run = async () => {
  try {
    await connectDB();

    // 1) Admin account
    const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'changeme12345';
    const name = process.env.ADMIN_NAME || 'Admin';

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`•  Admin already exists: ${email}`);
    } else {
      await User.create({ name, email, password });
      console.log(`✔  Admin created: ${email}`);
    }

    // 2) Sample projects (only if the collection is empty)
    const count = await Project.countDocuments();
    if (count === 0) {
      await Project.insertMany(sampleProjects);
      console.log(`✔  Inserted ${sampleProjects.length} sample projects`);
    } else {
      console.log(`•  Projects already present (${count}) — skipping sample insert`);
    }

    console.log('\n✔  Seed complete.\n');
  } catch (err) {
    console.error('✖  Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    process.exit(process.exitCode || 0);
  }
};

run();

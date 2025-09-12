const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  title: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  files: [{ url: String, name: String }], // if you store files externally, store URLs
  score: Number,
  createdAt: { type: Date, default: Date.now },
  // ... other fields you had in Supabase
});

module.exports = mongoose.model('Submission', SubmissionSchema);

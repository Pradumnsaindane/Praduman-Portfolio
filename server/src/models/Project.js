import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true, index: true },
    summary: {
      type: String,
      required: [true, 'A short summary is required'],
      trim: true,
      maxlength: [280, 'Summary should be under 280 characters'],
    },
    description: { type: String, default: '' },
    tech: { type: [String], default: [] },
    role: { type: String, default: '' }, // e.g. "Design & full-stack build"
    year: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    repoUrl: { type: String, default: '' },
    image: { type: String, default: '' }, // optional screenshot URL
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Derive a URL-safe slug from the title when one isn't supplied.
projectSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.model('Project', projectSchema);

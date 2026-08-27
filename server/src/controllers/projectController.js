import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';

const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(v);

// @route  GET /api/projects
// @access Public
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().sort({ featured: -1, order: 1, createdAt: -1 });
  res.json(projects);
});

// @route  GET /api/projects/:id   (accepts a Mongo id or a slug)
// @access Public
export const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findOne(isObjectId(id) ? { _id: id } : { slug: id });
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  res.json(project);
});

// @route  POST /api/projects
// @access Private
export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create(req.body);
  res.status(201).json(project);
});

// @route  PUT /api/projects/:id
// @access Private
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  res.json(project);
});

// @route  DELETE /api/projects/:id
// @access Private
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  res.json({ message: 'Project removed', id: req.params.id });
});

import axios from 'axios';
import { Project } from '@/types';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const checkHealth = async () => {
  try {
    const response = await api.get('/healthz');
    return response.status === 200;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

export const getProjectById = async (projectId: string): Promise<Project> => {
  const response = await api.get(`/projects/${projectId}`);
  const project = response.data;
  // Ensure the arrays are present, even if empty.
  project.lessonPlans = project.lessonPlans || [];
  project.worksheets = project.worksheets || [];
  project.parentUpdates = project.parentUpdates || [];
  return project;
};
export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects');
  // The backend returns _id, but the frontend expects id.
  return response.data.map((project: any) => {
    project.id = project._id;
    delete project._id;
    return project;
  });
};

export const createProject = async (project: { name: string }): Promise<Project> => {
  const response = await api.post('/projects', project);
  return response.data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}`);
};

// Add other API functions for lesson plans, worksheets, etc. as needed
export const generateLessonPlan = async (
 projectId: string,
 params: { subject: string; level: string; topic: string }
) => {
 const response = await api.post(
   `/projects/${projectId}/generate-lesson-plan`,
   params
 );
 return response.data;
};

export default api;
export const generateParentUpdates = async (
  projectId: string,
  csv_data: string
) => {
  const response = await api.post(
    `/projects/${projectId}/generate-parent-updates`,
    { csv_data }
  );
  return response.data;
};
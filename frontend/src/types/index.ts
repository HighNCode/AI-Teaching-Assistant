export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  lessonPlans?: LessonPlan[];
  worksheets?: Worksheet[];
  parentUpdates?: ParentUpdate[];
}

export interface LessonPlan {
  id: string;
  projectId: string;
  fileName: string;
  content: string;
  createdAt: string;
  exportFormat: string;
}

export interface Worksheet {
  id: string;
  projectId: string;
  fileName: string;
  content: string;
  createdAt: string;
  exportFormat: string;
}

export interface ParentUpdate {
  id: string;
  projectId: string;
  studentName: string;
  fileName: string;
  draftText: string;
  createdAt: string;
}
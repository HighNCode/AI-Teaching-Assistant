import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Project } from '@/types';
import { showSuccess, showError } from '@/lib/utils/toast.ts';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getProjects, createProject, deleteProject, checkHealth } from '@/services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    checkHealth().then(isHealthy => {
      if (!isHealthy) {
        showError('Backend is not responding. Please try again later.');
      }
    });
  }, []);

  useEffect(() => {
    if (user) {
      getProjects().then(setProjects).catch(() => {
        showError('Failed to fetch projects.');
      });
    }
  }, [user]);

  const handleCreateProject = async () => {
    if (!user) {
      showError('You must be logged in to create a project.');
      return;
    }
    if (!newProjectName.trim()) {
      showError('Project name cannot be empty.');
      return;
    }

    try {
      const newProject = await createProject({
        name: newProjectName.trim(),
      });
      setProjects([...projects, newProject]);
      showSuccess('Project created successfully!');
      setNewProjectName('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      showError('Failed to create project.');
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) {
      showError('No project selected for deletion.');
      return;
    }

    try {
      await deleteProject(projectToDelete);
      setProjects(projects.filter(p => p.id !== projectToDelete));
      showSuccess('Project deleted successfully!');
      setProjectToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      showError('Failed to delete project.');
    }
  };

  const confirmDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <CardDescription>
                Give your new teaching project a name.
              </CardDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projectName" className="text-right">
                  Project Name
                </Label>
                <Input
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., PSLE Math - Fractions"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">No projects yet. Create one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow relative">
              <Link to={`/project/${project.id}`} className="block p-6">
                <CardHeader className="p-0 pb-2">
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>Created: {new Date(project.createdAt).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <p className="text-sm text-muted-foreground">
                    Lesson Plans: {project.lessonPlans?.length || 0} | Worksheets: {project.worksheets?.length || 0} | Parent Updates: {project.parentUpdates?.length || 0}
                  </p>
                </CardContent>
              </Link>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => confirmDeleteProject(project.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your project and all its associated content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardPage;
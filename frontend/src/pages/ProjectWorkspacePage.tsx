import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileText, MessageSquareText, PlusCircle, Download, Copy, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Project, LessonPlan, Worksheet, ParentUpdate } from '@/types';
import { showSuccess, showError } from '@/lib/utils/toast.ts';
import LessonPlanGenerator from '@/components/LessonPlanGenerator';
import ParentUpdateGenerator from '@/components/ParentUpdateGenerator';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ReactMarkdown from 'react-markdown';
import { getProjectById } from '@/services/api';

const ProjectWorkspacePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLessonPlanDialogOpen, setIsLessonPlanDialogOpen] = useState(false);
  const [isParentUpdateDialogOpen, setIsParentUpdateDialogOpen] = useState(false);
  const [isViewContentDialogOpen, setIsViewContentDialogOpen] = useState(false);
  const [viewedContent, setViewedContent] = useState({ id: '', title: '', content: '', type: '' });
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const refreshProject = () => {
    if (projectId) {
      getProjectById(projectId)
        .then(setProject)
        .catch(() => showError('Failed to refresh project data.'));
    }
  };

  useEffect(() => {
    if (user && projectId) {
      refreshProject();
    } else if (!user) {
      navigate('/login');
    }
  }, [projectId, user, navigate]);

  const handleSaveLessonPlanAndWorksheet = (lessonPlan: LessonPlan, worksheet: Worksheet) => {
    if (project) {
      // TODO: Implement API call to save lesson plan and worksheet
      console.log('Saving lesson plan and worksheet...', lessonPlan, worksheet);
      showSuccess('Lesson Plan and Worksheet saved to project!');
      refreshProject(); // Refresh project data
    }
  };

  const handleSaveParentUpdates = (parentUpdates: ParentUpdate[]) => {
    if (project) {
      // TODO: Implement API call to save parent updates
      console.log('Saving parent updates...', parentUpdates);
      showSuccess('Parent Updates saved to project!');
      refreshProject(); // Refresh project data
    }
  };

  const handleViewContent = (id: string, title: string, content: string, type: string) => {
    setViewedContent({ id, title, content, type });
    setIsEditMode(false); // Default to view mode
    setIsViewContentDialogOpen(true);
  };

  const handleSaveEditedContent = () => {
    if (!project || !viewedContent.id || !viewedContent.type) {
      showError('Cannot save edited content: missing project or content details.');
      return;
    }
    // TODO: Implement API call to save edited content
    console.log('Saving edited content...', viewedContent);
    showSuccess('Content updated successfully!');
    setIsViewContentDialogOpen(false);
  };

  const handleDeleteItem = () => {
    if (!project || !itemToDelete) {
      showError('Cannot delete item: missing project or item details.');
      return;
    }
    // TODO: Implement API call to delete item
    console.log('Deleting item...', itemToDelete);
    showSuccess('Item deleted successfully!');
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const confirmDeleteItem = (id: string, type: string) => {
    setItemToDelete({ id, type });
    setIsDeleteDialogOpen(true);
  };

  const handleDownload = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess(`Downloaded ${fileName}`);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => showSuccess('Copied to clipboard!'))
      .catch(() => showError('Failed to copy. Please copy manually.'));
  };

  if (!project) {
    return <div className="text-center py-8">Loading project...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{project.name}</h1>
      </div>

      <Tabs defaultValue="lesson-plans" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lesson-plans">
            <FileText className="mr-2 h-4 w-4" /> Lesson Plans
          </TabsTrigger>
          <TabsTrigger value="worksheets">
            <FileText className="mr-2 h-4 w-4" /> Worksheets
          </TabsTrigger>
          <TabsTrigger value="parent-updates">
            <MessageSquareText className="mr-2 h-4 w-4" /> Parent Updates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lesson-plans" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Lesson Plans</CardTitle>
              <Dialog open={isLessonPlanDialogOpen} onOpenChange={setIsLessonPlanDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Generate New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Generate Lesson Plan & Worksheet</DialogTitle>
                    <DialogDescription>
                      Input details to generate new teaching materials.
                    </DialogDescription>
                  </DialogHeader>
                  {project && (
                   <LessonPlanGenerator
                     projectId={projectId}
                     onSave={handleSaveLessonPlanAndWorksheet}
                     onClose={() => setIsLessonPlanDialogOpen(false)}
                   />
                 )}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
              {project.lessonPlans.length === 0 ? (
                <p className="text-muted-foreground">No lesson plans yet. Generate one!</p>
              ) : (
                <div className="space-y-2">
                  {project.lessonPlans.map((lp) => (
                    <div key={lp.id} className="flex items-center justify-between rounded-md border p-3">
                      <span>{lp.fileName}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewContent(lp.id, lp.fileName, lp.content, 'lesson-plan')}>View/Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(lp.content, lp.fileName)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => confirmDeleteItem(lp.id, 'lesson-plan')}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="worksheets" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Worksheets</CardTitle>
              {/* The generate button for worksheets is handled by the LessonPlanGenerator dialog */}
              <Dialog open={isLessonPlanDialogOpen} onOpenChange={setIsLessonPlanDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Generate New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Generate Lesson Plan & Worksheet</DialogTitle>
                    <DialogDescription>
                      Input details to generate new teaching materials.
                    </DialogDescription>
                  </DialogHeader>
                  {project && (
                   <LessonPlanGenerator
                     projectId={projectId}
                     onSave={handleSaveLessonPlanAndWorksheet}
                     onClose={() => setIsLessonPlanDialogOpen(false)}
                   />
                 )}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
              {project.worksheets.length === 0 ? (
                <p className="text-muted-foreground">No worksheets yet. Generate one!</p>
              ) : (
                <div className="space-y-2">
                  {project.worksheets.map((ws) => (
                    <div key={ws.id} className="flex items-center justify-between rounded-md border p-3">
                      <span>{ws.fileName}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewContent(ws.id, ws.fileName, ws.content, 'worksheet')}>View/Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(ws.content, ws.fileName)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => confirmDeleteItem(ws.id, 'worksheet')}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parent-updates" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Parent Updates</CardTitle>
              <Dialog open={isParentUpdateDialogOpen} onOpenChange={setIsParentUpdateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Generate New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Generate Parent Updates</DialogTitle>
                    <DialogDescription>
                      Upload student data to generate personalized parent communication drafts.
                    </DialogDescription>
                  </DialogHeader>
                  <ParentUpdateGenerator
                    projectId={projectId}
                    onSave={handleSaveParentUpdates}
                    onClose={() => setIsParentUpdateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
              {project.parentUpdates.length === 0 ? (
                <p className="text-muted-foreground">No parent updates yet. Generate one!</p>
              ) : (
                <div className="space-y-2">
                  {project.parentUpdates.map((pu) => (
                    <div key={pu.id} className="flex items-center justify-between rounded-md border p-3">
                      <span>{pu.studentName} - {pu.fileName}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewContent(pu.id, pu.fileName, pu.draftText, 'parent-update')}>View/Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(pu.draftText)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => confirmDeleteItem(pu.id, 'parent-update')}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for viewing/editing content */}
      <Dialog open={isViewContentDialogOpen} onOpenChange={setIsViewContentDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewedContent.title}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Edit the content below.' : 'Review the generated content.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? (
                <>
                  <FileText className="mr-2 h-4 w-4" /> View Mode
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" /> Edit Mode
                </>
              )}
            </Button>
          </div>
          {isEditMode ? (
            <Textarea
              value={viewedContent.content}
              onChange={(e) => setViewedContent({ ...viewedContent, content: e.target.value })}
              rows={20}
              className="font-mono"
            />
          ) : (
            <div className="prose dark:prose-invert max-h-[60vh] overflow-y-auto p-4 border rounded-md">
              <ReactMarkdown>{viewedContent.content}</ReactMarkdown>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewContentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEditedContent} disabled={!isEditMode}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected item from your project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectWorkspacePage;
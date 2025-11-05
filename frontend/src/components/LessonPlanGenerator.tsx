import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { LessonPlan, Worksheet } from '@/types';
import { showSuccess, showError } from '@/lib/utils/toast.ts';
import { Download, Save } from 'lucide-react';
import { generateLessonPlan } from '@/services/api';

interface LessonPlanGeneratorProps {
  projectId: string;
  onSave: (lessonPlan: LessonPlan, worksheet: Worksheet) => void;
  onClose: () => void;
}

const LessonPlanGenerator = ({ projectId, onSave, onClose }: LessonPlanGeneratorProps) => {
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [generatedLessonPlanContent, setGeneratedLessonPlanContent] = useState('');
  const [generatedWorksheetContent, setGeneratedWorksheetContent] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!subject || !level || !topic) {
      showError('Please fill in all fields.');
      return;
    }
    try {
      const response = await generateLessonPlan(projectId, {
        subject,
        level,
        topic,
      });
      setGeneratedLessonPlanContent(response.lesson_plan.content);
      setGeneratedWorksheetContent(response.worksheet.content);
      setIsGenerated(true);
      showSuccess('Content generated successfully!');
    } catch (error) {
      showError('Failed to generate content. Please try again.');
    }
  };

  const handleSave = () => {
    if (!generatedLessonPlanContent || !generatedWorksheetContent) {
      showError('Please generate content before saving.');
      return;
    }

    const newLessonPlan: LessonPlan = {
      id: crypto.randomUUID(),
      projectId,
      fileName: `${subject}-${level}-${topic}-LessonPlan.md`,
      content: generatedLessonPlanContent,
      exportFormat: 'pdf', // Default for now
      createdAt: new Date().toISOString(),
    };

    const newWorksheet: Worksheet = {
      id: crypto.randomUUID(),
      projectId,
      fileName: `${subject}-${level}-${topic}-Worksheet.md`,
      content: generatedWorksheetContent,
      exportFormat: 'pdf', // Default for now
      createdAt: new Date().toISOString(),
    };

    onSave(newLessonPlan, newWorksheet);
    onClose();
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Math"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Input
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="e.g., PSLE"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Fractions"
          />
        </div>
      </div>

      <Button onClick={handleGenerate} className="w-full" disabled={isGenerated}>
        Generate Lesson Plan & Worksheet
      </Button>

      {isGenerated && (
        <div className="space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Generated Lesson Plan</h3>
            <Textarea
              value={generatedLessonPlanContent}
              onChange={(e) => setGeneratedLessonPlanContent(e.target.value)}
              rows={10}
              className="font-mono"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => handleDownload(generatedLessonPlanContent, `${subject}-${level}-${topic}-LessonPlan.md`)}
            >
              <Download className="mr-2 h-4 w-4" /> Download Lesson Plan
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Generated Worksheet</h3>
            <Textarea
              value={generatedWorksheetContent}
              onChange={(e) => setGeneratedWorksheetContent(e.target.value)}
              rows={10}
              className="font-mono"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => handleDownload(generatedWorksheetContent, `${subject}-${level}-${topic}-Worksheet.md`)}
            >
              <Download className="mr-2 h-4 w-4" /> Download Worksheet
            </Button>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button onClick={handleSave} disabled={!isGenerated}>
          <Save className="mr-2 h-4 w-4" /> Save to Project
        </Button>
      </DialogFooter>
    </div>
  );
};

export default LessonPlanGenerator;
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { ParentUpdate } from '@/types';
import { showSuccess, showError } from '@/lib/utils/toast.ts';
import { Upload } from 'lucide-react';
import { generateParentUpdates } from '@/services/api';

interface ParentUpdateGeneratorProps {
  projectId: string;
  onSave: (parentUpdates: ParentUpdate[]) => void;
  onClose: () => void;
}

const ParentUpdateGenerator = ({ projectId, onSave, onClose }: ParentUpdateGeneratorProps) => {
  const [studentDataInput, setStudentDataInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateAndSave = async () => {
    if (!projectId) {
      showError('Project ID is missing. Please try again.');
      return;
    }
    if (!studentDataInput.trim()) {
      showError('Please provide student performance data to generate updates.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await generateParentUpdates(projectId, studentDataInput);
      showSuccess('Parent updates generated and saved successfully!');
      onSave(response.updates);
      onClose();
    } catch (error) {
      showError('Failed to generate parent updates.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="studentData">Student Performance Data (CSV format)</Label>
        <Textarea
          id="studentData"
          value={studentDataInput}
          onChange={(e) => setStudentDataInput(e.target.value)}
          placeholder="e.g., Name,Subject,Score,Comments&#10;John,Math,85,Good progress in algebra&#10;Jane,Science,70,Needs to review concepts"
          rows={5}
          className="font-mono"
        />
        <p className="text-sm text-muted-foreground">
          Enter student data in CSV format (e.g., Name,Subject,Score,Comments).
        </p>
      </div>

      <DialogFooter>
        <Button onClick={handleGenerateAndSave} className="w-full" disabled={isLoading || !projectId}>
          {isLoading ? (
            'Generating...'
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Generate and Save Updates
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default ParentUpdateGenerator;
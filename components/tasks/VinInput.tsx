import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Id } from '@/convex/_generated/dataModel';

interface VinInputProps {
  onTaskCreated: (taskId: Id<'tasks'>) => void;
}

export function VinInput({ onTaskCreated }: VinInputProps) {
  const [vin, setVin] = useState('');
  const createTask = useMutation(api.tasks.createTask);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateTask = async () => {
    if (!vin || !user) return;
    try {
      const { taskId } = await createTask({ vin, userId: user.userId });
      onTaskCreated(taskId);
      setVin(''); // Clear the input
      toast({
        title: 'Task Created',
        description: `New task created with VIN: ${vin}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex space-x-2">
      <Input
        placeholder="Enter VIN"
        value={vin}
        onChange={(e) => setVin(e.target.value)}
      />
      <Button onClick={handleCreateTask}>Create Task</Button>
    </div>
  );
}
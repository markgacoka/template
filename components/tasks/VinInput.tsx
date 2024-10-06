import { useState } from 'react';
import { useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VinInputProps {
  onTaskCreated: (taskId: Id<'tasks'>) => void;
}

export function VinInput({ onTaskCreated }: VinInputProps) {
  const [vin, setVin] = useState('');
  const createTask = useMutation(api.tasks.createTask); 

  const handleCreateTask = async () => {
    if (!vin) return;
    const { taskId } = await createTask({ vin });
    onTaskCreated(taskId);
    setVin('');
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Enter VIN"
        value={vin}
        onChange={(e) => setVin(e.target.value)}
      />
      <Button onClick={handleCreateTask} className="w-full">Process VIN</Button>
    </div>
  );
}
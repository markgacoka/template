import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Id } from '@/convex/_generated/dataModel';

export function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const createPost = useMutation(api.posts.createPost);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreatePost = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a post.',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Title and content are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createPost({ 
        title, 
        content, 
        authorId: user.userId as Id<"users"> 
      });
      setTitle('');
      setContent('');
      toast({
        title: 'Post created!',
        description: 'Your new post has been successfully created.',
      });
    } catch (error) {
      toast({
        title: 'Error creating post',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        placeholder="Post Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button onClick={handleCreatePost} className="w-full">Create Post</Button>
    </div>
  );
}
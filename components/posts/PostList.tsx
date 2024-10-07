import { Id } from '@/convex/_generated/dataModel';

interface Post {
  _id: Id<"posts">;
  _creationTime: number;
  title: string;
  content: string;
  userId: Id<"users">;
}

interface PostListProps {
  posts: Post[] | undefined;
}

export function PostList({ posts }: PostListProps) {
    if (!posts) return null;

    return (
        <div className="space-y-3 overflow-y-auto">
            {posts.map((post: Post) => (
                <div key={post._id} className="p-3 border rounded-md">
                    <h3 className="font-bold text-lg mb-1">{post.title}</h3>
                    <p className="text-sm">{post.content}</p>
                </div>
            ))}
        </div>
    );
}
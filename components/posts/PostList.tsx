import { Id } from '@/convex/_generated/dataModel';

interface Post {
  _id: Id<"posts">;
  _creationTime: number;
  title: string;
  content: string;
  authorId: Id<"users">;
}

interface PostListProps {
  posts: Post[] | undefined;
}

export function PostList({ posts }: PostListProps) {
    if (!posts) return null;

    return (
        <div className="space-y-4 overflow-y-auto">
            {posts.map((post: Post) => (
                <div key={post._id} className="p-4 border rounded-md">
                    <h3 className="font-bold">{post.title}</h3>
                    <p>{post.content}</p>
                </div>
            ))}
        </div>
    );
}
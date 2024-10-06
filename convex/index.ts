import { mutation } from "@/convex/_generated/server";

export default mutation(async ({ db }) => {
    const tasks = await db.query("tasks").collect();
    for (const task of tasks) {
        if (task.lastProcessedIndex === undefined) {
            await db.patch(task._id, { lastProcessedIndex: -1 });
        }
    }
});
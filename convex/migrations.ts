import { internalMutation } from "./_generated/server";

export const addTimeTakenToTasks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    for (const task of tasks) {
      if (task.timeTaken === undefined) {
        await ctx.db.patch(task._id, { timeTaken: 0 });
      }
    }
  },
});
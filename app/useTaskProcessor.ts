import { useEffect, useCallback } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Id } from '../convex/_generated/dataModel'

export function useTaskProcessor(taskId: Id<'tasks'> | null) {
    const updateTaskProgress = useMutation(api.mutations.tasks.updateTaskProgress)
    const completeTask = useMutation(api.mutations.tasks.completeTask)
    const task = useQuery(api.queries.tasks.getTaskProgress, taskId ? { taskId } : 'skip')

    const processTask = useCallback(async () => {
        if (!taskId || !task || !task.vin) return

        const vin = task.vin
        for (let i = 0; i < vin.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            await updateTaskProgress({
                taskId,
                progress: ((i + 1) / vin.length) * 100,
                charIndex: i,
                processedChar: vin[i].toUpperCase(),
            })
        }

        await completeTask({
            taskId,
            result: `Processed VIN: ${vin.toUpperCase()}`,
        })
    }, [taskId, task, updateTaskProgress, completeTask])

    useEffect(() => {
        if (taskId && task && task.status === 'pending') {
            processTask()
        }
    }, [taskId, task, processTask])

    return { task }
}
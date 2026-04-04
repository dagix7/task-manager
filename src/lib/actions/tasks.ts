'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  TaskStatus,
} from '@/lib/types/task'

// Helper to get authenticated user
async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  return session.user
}

// Create a new task
export async function createTask(input: CreateTaskInput) {
  try {
    const user = await getAuthUser()
    const supabase = await createClient()

    // Validate input
    if (!input.title?.trim()) {
      throw new Error('Title is required')
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: user.id,
          title: input.title.trim(),
          description: input.description?.trim() || null,
          status: input.status || 'todo',
          priority: input.priority || 'medium',
          due_date: input.due_date || null,
          category: input.category?.trim() || null,
        },
      ])
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true, data: data as Task }
  } catch (error) {
    console.error('Create task error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task',
    }
  }
}

// Get all tasks for the current user
export async function getTasks(filters?: TaskFilters) {
  try {
    const user = await getAuthUser()
    const supabase = await createClient()

    let query = supabase.from('tasks').select('*').eq('user_id', user.id)

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters?.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority)
    }

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }

    if (filters?.overdue) {
      query = query.lt('due_date', new Date().toISOString()).eq('status', 'todo')
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: (data as Task[]) || [] }
  } catch (error) {
    console.error('Get tasks error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tasks',
      data: [],
    }
  }
}

// Get a single task
export async function getTask(id: string) {
  try {
    const user = await getAuthUser()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    if (!data) {
      throw new Error('Task not found')
    }

    return { success: true, data: data as Task }
  } catch (error) {
    console.error('Get task error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch task',
    }
  }
}

// Update a task
export async function updateTask(input: UpdateTaskInput) {
  try {
    const user = await getAuthUser()
    const supabase = await createClient()

    // Validate input
    if (!input.id) {
      throw new Error('Task ID is required')
    }

    // Build update object
    const updateData: any = {}

    if (input.title !== undefined) {
      if (!input.title.trim()) {
        throw new Error('Title cannot be empty')
      }
      updateData.title = input.title.trim()
    }

    if (input.description !== undefined) {
      updateData.description = input.description?.trim() || null
    }

    if (input.status !== undefined) {
      updateData.status = input.status
      // Set completed_at timestamp if marking as completed
      if (input.status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      } else {
        updateData.completed_at = null
      }
    }

    if (input.priority !== undefined) {
      updateData.priority = input.priority
    }

    if (input.due_date !== undefined) {
      updateData.due_date = input.due_date || null
    }

    if (input.category !== undefined) {
      updateData.category = input.category?.trim() || null
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      throw new Error('Task not found')
    }

    revalidatePath('/dashboard')
    return { success: true, data: data as Task }
  } catch (error) {
    console.error('Update task error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task',
    }
  }
}

// Delete a task
export async function deleteTask(id: string) {
  try {
    const user = await getAuthUser()
    const supabase = await createClient()

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Delete task error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete task',
    }
  }
}

// Toggle task status between todo and completed
export async function toggleTaskStatus(id: string) {
  try {
    const user = await getAuthUser()
    const supabase = await createClient()

    // Get current task
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) throw fetchError

    if (!currentTask) {
      throw new Error('Task not found')
    }

    // Toggle status
    const newStatus: TaskStatus =
      currentTask.status === 'completed' ? 'todo' : 'completed'

    const updateData: any = {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true, data: data as Task }
  } catch (error) {
    console.error('Toggle task status error:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to toggle task status',
    }
  }
}

// Get task statistics
export async function getTaskStats() {
  try {
    const user = await getAuthUser()
    const supabase = await createClient()

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status, due_date')
      .eq('user_id', user.id)

    if (error) throw error

    const total = tasks?.length || 0
    const completed = tasks?.filter((t) => t.status === 'completed').length || 0
    const inProgress =
      tasks?.filter((t) => t.status === 'in_progress').length || 0
    const todo = tasks?.filter((t) => t.status === 'todo').length || 0

    // Count overdue tasks
    const now = new Date().toISOString()
    const overdue =
      tasks?.filter(
        (t) =>
          t.due_date &&
          t.due_date < now &&
          t.status !== 'completed'
      ).length || 0

    return {
      success: true,
      data: {
        total,
        completed,
        inProgress,
        todo,
        overdue,
      },
    }
  } catch (error) {
    console.error('Get task stats error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
      data: {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        overdue: 0,
      },
    }
  }
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  category: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string
  category?: string
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string
}

export interface TaskFilters {
  status?: TaskStatus | 'all'
  priority?: TaskPriority | 'all'
  category?: string
  search?: string
  overdue?: boolean
}

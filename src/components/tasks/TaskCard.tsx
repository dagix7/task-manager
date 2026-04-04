'use client'

import { Task, TaskStatus, TaskPriority } from '@/lib/types/task'
import { Calendar, CheckCircle2, Circle, Clock, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface TaskCardProps {
  task: Task
  onToggleComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const statusConfig: Record<TaskStatus, { icon: React.ReactNode; label: string; color: string }> = {
  todo: {
    icon: <Circle className="h-5 w-5" />,
    label: 'To Do',
    color: 'text-gray-500',
  },
  in_progress: {
    icon: <Clock className="h-5 w-5" />,
    label: 'In Progress',
    color: 'text-blue-500',
  },
  completed: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    label: 'Completed',
    color: 'text-green-500',
  },
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: {
    label: 'Low',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  high: {
    label: 'High',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]

  // Check if task is overdue
  const isOverdue = task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'completed'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`mt-0.5 ${status.color} hover:opacity-70 transition-opacity`}
          >
            {status.icon}
          </button>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-lg font-semibold text-gray-900 ${
                task.status === 'completed' ? 'line-through text-gray-500' : ''
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priority.bgColor} ${priority.color}`}
        >
          {priority.label}
        </span>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-gray-500">
        {task.category && (
          <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700">
            {task.category}
          </span>
        )}

        {task.due_date && (
          <span className={`inline-flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
            {isOverdue && <AlertCircle className="h-4 w-4" />}
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(task.due_date), 'MMM d, yyyy')}
            </span>
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onEdit(task)}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit2 className="h-4 w-4" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  )
}

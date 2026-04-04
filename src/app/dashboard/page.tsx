'use client'

import { useEffect, useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskModal } from '@/components/tasks/TaskModal'
import { Task, CreateTaskInput, UpdateTaskInput } from '@/lib/types/task'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  getTaskStats,
} from '@/lib/actions/tasks'
import { useAuth } from '@/components/providers/AuthProvider'

export default function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    overdue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Load tasks and stats
  const loadData = async () => {
    setLoading(true)
    const [tasksResult, statsResult] = await Promise.all([getTasks(), getTaskStats()])

    if (tasksResult.success && tasksResult.data) {
      setTasks(tasksResult.data)
    }

    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle create/update task
  const handleSubmitTask = async (data: CreateTaskInput | UpdateTaskInput) => {
    setActionLoading(true)
    try {
      const isUpdate = 'id' in data
      const result = isUpdate
        ? await updateTask(data as UpdateTaskInput)
        : await createTask(data as CreateTaskInput)

      if (result.success) {
        await loadData()
        setModalOpen(false)
        setEditingTask(null)
      } else {
        throw new Error(result.error || 'Operation failed')
      }
    } catch (error) {
      console.error('Submit task error:', error)
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  // Handle toggle task completion
  const handleToggleComplete = async (id: string) => {
    const result = await toggleTaskStatus(id)
    if (result.success) {
      await loadData()
    }
  }

  // Handle delete task
  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    const result = await deleteTask(id)
    if (result.success) {
      await loadData()
    }
  }

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  // Handle create new task
  const handleCreateNew = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingTask(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">Manage your tasks efficiently</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">To Do</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todo}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-blue-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-red-600">Overdue</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.overdue}</p>
        </div>
      </div>

      {/* Task List */}
      <TaskList
        tasks={tasks}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        loading={loading}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        task={editingTask}
        onSubmit={handleSubmitTask}
        onClose={handleCloseModal}
        loading={actionLoading}
      />
    </div>
  )
}

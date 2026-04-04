'use client'

import { useEffect } from 'react'
import { Task, CreateTaskInput, UpdateTaskInput } from '@/lib/types/task'
import { TaskForm } from './TaskForm'

interface TaskModalProps {
  isOpen: boolean
  task?: Task | null
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>
  onClose: () => void
  loading?: boolean
}

export function TaskModal({ isOpen, task, onSubmit, onClose, loading }: TaskModalProps) {
  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <TaskForm
            task={task}
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

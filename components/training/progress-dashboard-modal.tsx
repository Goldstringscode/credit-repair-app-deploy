"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProgressDashboard } from "./progress-dashboard"

interface ProgressDashboardModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  courseId: string
}

export function ProgressDashboardModal({ 
  isOpen, 
  onClose, 
  userId, 
  courseId 
}: ProgressDashboardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Learning Progress Dashboard</DialogTitle>
        </DialogHeader>
        <ProgressDashboard 
          userId={userId} 
          courseId={courseId} 
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}


"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CertificatesViewer } from "./certificates-viewer"

interface CertificatesViewerModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  courseId: string
}

export function CertificatesViewerModal({ 
  isOpen, 
  onClose, 
  userId, 
  courseId 
}: CertificatesViewerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your Certificates & Achievements</DialogTitle>
        </DialogHeader>
        <CertificatesViewer 
          userId={userId} 
          courseId={courseId} 
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}


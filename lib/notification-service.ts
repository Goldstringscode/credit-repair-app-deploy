interface TrackingNotificationData {
  trackingNumber: string;
  recipient: string;
  letterSubject: string;
  status: string;
  location?: string;
  timestamp: string;
}

type AddNotificationCallback = (notification: any) => void;

export class NotificationService {
  private addNotificationCallback: AddNotificationCallback | null = null;

  // Method required by notification-context.tsx
  setAddNotificationCallback(callback: AddNotificationCallback): void {
    this.addNotificationCallback = callback;
    console.log('🔔 Notification callback registered');
  }

  // Method required by notification-context.tsx
  removeAddNotificationCallback(callback: AddNotificationCallback): void {
    if (this.addNotificationCallback === callback) {
      this.addNotificationCallback = null;
      console.log('🔔 Notification callback removed');
    }
  }

  // Method to add notifications to the UI
  addNotification(notification: any): void {
    if (this.addNotificationCallback) {
      this.addNotificationCallback(notification);
    } else {
      console.warn('No notification callback registered');
    }
  }

  async sendTrackingUpdate(data: TrackingNotificationData): Promise<void> {
    console.log('Tracking notification:', data);
    
    // Add notification to UI
    this.addNotification({
      id: `tracking-${data.trackingNumber}-${Date.now()}`,
      type: 'info',
      title: 'Tracking Update',
      message: `Your letter ${data.trackingNumber} is ${data.status.replace('_', ' ')}`,
      timestamp: new Date().toISOString(),
      data: data
    });
    
    // TODO: Implement actual email sending
  }

  async sendDeliveryNotification(data: TrackingNotificationData): Promise<void> {
    console.log('Delivery notification:', data);
    
    // Add notification to UI
    this.addNotification({
      id: `delivery-${data.trackingNumber}-${Date.now()}`,
      type: 'success',
      title: 'Letter Delivered!',
      message: `Your letter ${data.trackingNumber} has been delivered to ${data.recipient}`,
      timestamp: new Date().toISOString(),
      data: data
    });
    
    // TODO: Implement actual email sending
  }

  async notifyTaskCompleted(taskTitle: string, planName: string): Promise<void> {
    console.log('Task completed notification:', { taskTitle, planName });
    
    // Add notification to UI
    this.addNotification({
      id: `task-completed-${Date.now()}`,
      type: 'success',
      title: 'Task Completed!',
      message: `"${taskTitle}" in ${planName} has been completed successfully`,
      timestamp: new Date().toISOString(),
      data: { taskTitle, planName }
    });
    
    // TODO: Implement actual email sending
  }

  async notifyDisputeSubmitted(dispute: any): Promise<void> {
    console.log('Dispute submitted notification:', dispute);
    
    // Add notification to UI
    this.addNotification({
      id: `dispute-submitted-${Date.now()}`,
      type: 'success',
      title: 'Dispute Submitted!',
      message: `Your dispute for ${dispute.itemDescription || 'credit item'} has been submitted successfully`,
      timestamp: new Date().toISOString(),
      data: dispute
    });
    
    // TODO: Implement actual email sending
  }
}

export const notificationService = new NotificationService();
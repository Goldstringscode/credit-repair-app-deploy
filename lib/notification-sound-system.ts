export interface SoundSettings {
  enabled: boolean
  volume: number // 0-1
  categories: {
    success: boolean
    info: boolean
    warning: boolean
    error: boolean
    credit: boolean
    dispute: boolean
    training: boolean
    payment: boolean
    system: boolean
  }
  customSounds: {
    [category: string]: string // URL to custom sound file
  }
  vibration: boolean
  vibrationPattern: number[] // Pattern for vibration
}

export interface SoundFile {
  id: string
  name: string
  category: string
  url: string
  duration: number // seconds
  description: string
}

class NotificationSoundSystem {
  private settings: SoundSettings
  private audioContext: AudioContext | null = null
  private soundFiles: Map<string, SoundFile> = new Map()
  private isInitialized = false

  constructor() {
    this.settings = this.getDefaultSettings()
    this.initializeService()
  }

  private initializeService() {
    if (this.isInitialized) return

    this.loadSettings()
    this.initializeSoundFiles()
    this.initializeAudioContext()
    this.isInitialized = true
    console.log('🔊 Notification sound system initialized')
  }

  private getDefaultSettings(): SoundSettings {
    return {
      enabled: true,
      volume: 0.7,
      categories: {
        success: true,
        info: true,
        warning: true,
        error: true,
        credit: true,
        dispute: true,
        training: true,
        payment: true,
        system: true
      },
      customSounds: {},
      vibration: true,
      vibrationPattern: [200, 100, 200] // Default vibration pattern
    }
  }

  private initializeSoundFiles() {
    const soundFiles: SoundFile[] = [
      {
        id: 'success-default',
        name: 'Success',
        category: 'success',
        url: '/sounds/success.mp3',
        duration: 1.2,
        description: 'Gentle success chime'
      },
      {
        id: 'info-default',
        name: 'Information',
        category: 'info',
        url: '/sounds/info.mp3',
        duration: 0.8,
        description: 'Soft information tone'
      },
      {
        id: 'warning-default',
        name: 'Warning',
        category: 'warning',
        url: '/sounds/warning.mp3',
        duration: 1.5,
        description: 'Attention-grabbing warning sound'
      },
      {
        id: 'error-default',
        name: 'Error',
        category: 'error',
        url: '/sounds/error.mp3',
        duration: 2.0,
        description: 'Urgent error alert'
      },
      {
        id: 'credit-default',
        name: 'Credit Update',
        category: 'credit',
        url: '/sounds/credit.mp3',
        duration: 1.0,
        description: 'Credit score notification sound'
      },
      {
        id: 'dispute-default',
        name: 'Dispute Update',
        category: 'dispute',
        url: '/sounds/dispute.mp3',
        duration: 1.3,
        description: 'Dispute status update sound'
      },
      {
        id: 'training-default',
        name: 'Training Complete',
        category: 'training',
        url: '/sounds/training.mp3',
        duration: 1.8,
        description: 'Training completion celebration'
      },
      {
        id: 'payment-default',
        name: 'Payment',
        category: 'payment',
        url: '/sounds/payment.mp3',
        duration: 1.1,
        description: 'Payment confirmation sound'
      },
      {
        id: 'system-default',
        name: 'System',
        category: 'system',
        url: '/sounds/system.mp3',
        duration: 0.9,
        description: 'System notification sound'
      },
      // Additional success sounds
      {
        id: 'success-bell',
        name: 'Success Bell',
        category: 'success',
        url: '/sounds/success-bell.mp3',
        duration: 2.0,
        description: 'Classic bell success sound'
      },
      {
        id: 'success-chord',
        name: 'Success Chord',
        category: 'success',
        url: '/sounds/success-chord.mp3',
        duration: 1.8,
        description: 'Harmonious success chord'
      },
      // Additional info sounds
      {
        id: 'info-soft',
        name: 'Soft Info',
        category: 'info',
        url: '/sounds/info-soft.mp3',
        duration: 0.6,
        description: 'Very gentle information sound'
      },
      {
        id: 'info-notification',
        name: 'Notification Ping',
        category: 'info',
        url: '/sounds/notification-ping.mp3',
        duration: 1.0,
        description: 'Modern notification ping'
      },
      // Additional warning sounds
      {
        id: 'warning-beep',
        name: 'Warning Beep',
        category: 'warning',
        url: '/sounds/warning-beep.mp3',
        duration: 1.2,
        description: 'Urgent warning beep'
      },
      {
        id: 'warning-chime',
        name: 'Warning Chime',
        category: 'warning',
        url: '/sounds/warning-chime.mp3',
        duration: 2.0,
        description: 'Melodic warning chime'
      },
      // Additional error sounds
      {
        id: 'error-buzz',
        name: 'Error Buzz',
        category: 'error',
        url: '/sounds/error-buzz.mp3',
        duration: 2.5,
        description: 'Harsh error buzz'
      },
      {
        id: 'error-alarm',
        name: 'Error Alarm',
        category: 'error',
        url: '/sounds/error-alarm.mp3',
        duration: 2.2,
        description: 'Critical error alarm'
      },
      // Additional credit sounds
      {
        id: 'credit-rise',
        name: 'Credit Rise',
        category: 'credit',
        url: '/sounds/credit-rise.mp3',
        duration: 1.8,
        description: 'Ascending credit score sound'
      },
      {
        id: 'credit-drop',
        name: 'Credit Drop',
        category: 'credit',
        url: '/sounds/credit-drop.mp3',
        duration: 1.6,
        description: 'Descending credit score sound'
      },
      // Additional dispute sounds
      {
        id: 'dispute-resolved',
        name: 'Dispute Resolved',
        category: 'dispute',
        url: '/sounds/dispute-resolved.mp3',
        duration: 2.0,
        description: 'Victory sound for resolved disputes'
      },
      {
        id: 'dispute-submitted',
        name: 'Dispute Submitted',
        category: 'dispute',
        url: '/sounds/dispute-submitted.mp3',
        duration: 1.5,
        description: 'Confirmation for submitted disputes'
      },
      // Additional training sounds
      {
        id: 'training-lesson',
        name: 'Lesson Complete',
        category: 'training',
        url: '/sounds/lesson-complete.mp3',
        duration: 1.4,
        description: 'Lesson completion celebration'
      },
      {
        id: 'training-milestone',
        name: 'Milestone Achieved',
        category: 'training',
        url: '/sounds/milestone.mp3',
        duration: 1.6,
        description: 'Major milestone achievement'
      },
      // Additional payment sounds
      {
        id: 'payment-success',
        name: 'Payment Success',
        category: 'payment',
        url: '/sounds/payment-success.mp3',
        duration: 1.5,
        description: 'Successful payment processing'
      },
      {
        id: 'payment-failed',
        name: 'Payment Failed',
        category: 'payment',
        url: '/sounds/payment-failed.mp3',
        duration: 1.8,
        description: 'Payment processing failed'
      },
      // Additional system sounds
      {
        id: 'system-maintenance',
        name: 'System Maintenance',
        category: 'system',
        url: '/sounds/maintenance.mp3',
        duration: 1.6,
        description: 'System maintenance notification'
      },
      {
        id: 'system-update',
        name: 'System Update',
        category: 'system',
        url: '/sounds/update.mp3',
        duration: 1.3,
        description: 'System update available'
      }
    ]

    soundFiles.forEach(sound => {
      this.soundFiles.set(sound.id, sound)
    })

    console.log(`🔊 Initialized ${soundFiles.length} sound files`)
  }

  private initializeAudioContext() {
    if (typeof window === 'undefined') return

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('Failed to initialize audio context:', error)
    }
  }

  private loadSettings() {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('notification-sound-settings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Failed to load sound settings:', error)
    }
  }

  private saveSettings() {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('notification-sound-settings', JSON.stringify(this.settings))
    } catch (error) {
      console.warn('Failed to save sound settings:', error)
    }
  }

  /**
   * Play sound by category
   */
  async playSoundByCategory(category: string): Promise<void> {
    if (!this.settings.enabled) return
    if (!this.settings.categories[category as keyof typeof this.settings.categories]) return

    try {
      // Play system sound if available
      await this.playSystemSound(category)
      
      // Trigger vibration if enabled
      if (this.settings.vibration && 'vibrate' in navigator) {
        navigator.vibrate(this.settings.vibrationPattern)
      }
    } catch (error) {
      console.warn(`Failed to play sound for category ${category}:`, error)
    }
  }

  /**
   * Play a specific sound file
   */
  async playSoundFile(soundId: string): Promise<void> {
    if (!this.settings.enabled) return

    const soundFile = this.soundFiles.get(soundId)
    if (!soundFile) {
      console.warn(`Sound file not found: ${soundId}`)
      return
    }

    try {
      await this.playAudioFile(soundFile.url)
    } catch (error) {
      console.warn(`Failed to play sound file ${soundId}:`, error)
    }
  }

  /**
   * Play system sound for category
   */
  private async playSystemSound(category: string): Promise<void> {
    // Try to find a custom sound first
    const customSound = this.settings.customSounds[category]
    if (customSound) {
      await this.playAudioFile(customSound)
      return
    }

    // Fall back to default sound for category
    const defaultSound = Array.from(this.soundFiles.values())
      .find(sound => sound.category === category)
    
    if (defaultSound) {
      await this.playAudioFile(defaultSound.url)
    } else {
      // Fall back to generic notification sound
      await this.playGenericNotificationSound()
    }
  }

  /**
   * Play audio file
   */
  private async playAudioFile(url: string): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      // Create audio element
      const audio = new Audio(url)
      audio.volume = this.settings.volume
      
      // Play the sound
      await audio.play()
    } catch (error) {
      console.warn(`Failed to play audio file ${url}:`, error)
      // Fall back to system beep
      await this.playSystemBeep()
    }
  }

  /**
   * Play generic notification sound
   */
  private async playGenericNotificationSound(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      // Use Web Audio API to generate a simple notification sound
      if (this.audioContext) {
        await this.generateNotificationTone()
      } else {
        // Fall back to system beep
        await this.playSystemBeep()
      }
    } catch (error) {
      console.warn('Failed to play generic notification sound:', error)
    }
  }

  /**
   * Generate notification tone using Web Audio API
   */
  private async generateNotificationTone(): Promise<void> {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Create a pleasant notification tone
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.3, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.3)
  }

  /**
   * Play system beep (fallback)
   */
  private async playSystemBeep(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      // Try to use the system beep
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
      audio.volume = this.settings.volume * 0.5
      await audio.play()
    } catch (error) {
      console.warn('Failed to play system beep:', error)
    }
  }

  /**
   * Get current settings
   */
  getSettings(): SoundSettings {
    return { ...this.settings }
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<SoundSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    console.log('🔊 Sound settings updated')
  }

  /**
   * Enable/disable sound system
   */
  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled
    this.saveSettings()
    console.log(`🔊 Sound system ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Set volume
   */
  setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(1, volume))
    this.saveSettings()
    console.log(`🔊 Volume set to ${this.settings.volume}`)
  }

  /**
   * Enable/disable category
   */
  setCategoryEnabled(category: string, enabled: boolean): void {
    if (category in this.settings.categories) {
      this.settings.categories[category as keyof typeof this.settings.categories] = enabled
      this.saveSettings()
      console.log(`🔊 Category ${category} ${enabled ? 'enabled' : 'disabled'}`)
    }
  }

  /**
   * Set custom sound for category
   */
  setCustomSound(category: string, soundUrl: string): void {
    this.settings.customSounds[category] = soundUrl
    this.saveSettings()
    console.log(`🔊 Custom sound set for category ${category}`)
  }

  /**
   * Remove custom sound for category
   */
  removeCustomSound(category: string): void {
    delete this.settings.customSounds[category]
    this.saveSettings()
    console.log(`🔊 Custom sound removed for category ${category}`)
  }

  /**
   * Enable/disable vibration
   */
  setVibrationEnabled(enabled: boolean): void {
    this.settings.vibration = enabled
    this.saveSettings()
    console.log(`🔊 Vibration ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Set vibration pattern
   */
  setVibrationPattern(pattern: number[]): void {
    this.settings.vibrationPattern = pattern
    this.saveSettings()
    console.log('🔊 Vibration pattern updated')
  }

  /**
   * Get available sound files
   */
  getAvailableSounds(): SoundFile[] {
    return Array.from(this.soundFiles.values())
  }

  /**
   * Get sounds by category
   */
  getSoundsByCategory(category: string): SoundFile[] {
    return Array.from(this.soundFiles.values())
      .filter(sound => sound.category === category)
  }

  /**
   * Test sound
   */
  async testSound(category: string): Promise<void> {
    console.log(`🔊 Testing sound for category: ${category}`)
    await this.playSoundByCategory(category)
  }

  /**
   * Test vibration
   */
  testVibration(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(this.settings.vibrationPattern)
      console.log('🔊 Testing vibration pattern')
    } else {
      console.warn('Vibration not supported on this device')
    }
  }

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    this.settings = this.getDefaultSettings()
    this.saveSettings()
    console.log('🔊 Sound settings reset to defaults')
  }

  /**
   * Get sound system status
   */
  getStatus(): {
    enabled: boolean
    audioContextAvailable: boolean
    vibrationSupported: boolean
    volume: number
    activeCategories: string[]
  } {
    return {
      enabled: this.settings.enabled,
      audioContextAvailable: this.audioContext !== null,
      vibrationSupported: 'vibrate' in navigator,
      volume: this.settings.volume,
      activeCategories: Object.entries(this.settings.categories)
        .filter(([_, enabled]) => enabled)
        .map(([category, _]) => category)
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    console.log('🔊 Sound system cleaned up')
  }
}

export const notificationSoundSystem = new NotificationSoundSystem()
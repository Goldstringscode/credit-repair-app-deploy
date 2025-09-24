import { NextRequest, NextResponse } from 'next/server'

interface NotificationPreferences {
  userId: string
  sound: {
    enabled: boolean
    volume: number
    categories: {
      [category: string]: boolean
    }
    quietHours: {
      enabled: boolean
      start: string
      end: string
    }
  }
  push: {
    enabled: boolean
    categories: {
      [category: string]: boolean
    }
  }
  email: {
    enabled: boolean
    categories: {
      [category: string]: boolean
    }
    frequency: 'immediate' | 'daily' | 'weekly'
  }
  sms: {
    enabled: boolean
    categories: {
      [category: string]: boolean
    }
    phoneNumber?: string
  }
  general: {
    frequency: 'low' | 'medium' | 'high'
    priority: 'low' | 'medium' | 'high'
    autoExpire: number // minutes
    showInApp: boolean
    showInBell: boolean
  }
  categories: {
    [category: string]: {
      enabled: boolean
      priority: 'low' | 'medium' | 'high'
      sound: boolean
      push: boolean
      email: boolean
      sms: boolean
    }
  }
}

// Mock storage - in real app, use database
const preferencesStore = new Map<string, NotificationPreferences>()

const defaultPreferences: NotificationPreferences = {
  userId: '',
  sound: {
    enabled: true,
    volume: 0.7,
    categories: {
      credit: true,
      training: true,
      system: true,
      payment: true,
      milestone: true,
      alert: true,
      dispute: true,
      fcra: true,
      mail: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  },
  push: {
    enabled: true,
    categories: {
      credit: true,
      training: false,
      system: false,
      payment: true,
      milestone: true,
      alert: true,
      dispute: true,
      fcra: false,
      mail: false
    }
  },
  email: {
    enabled: true,
    categories: {
      credit: true,
      training: false,
      system: false,
      payment: true,
      milestone: true,
      alert: true,
      dispute: true,
      fcra: true,
      mail: true
    },
    frequency: 'immediate'
  },
  sms: {
    enabled: false,
    categories: {
      credit: false,
      training: false,
      system: false,
      payment: false,
      milestone: false,
      alert: true,
      dispute: true,
      fcra: false,
      mail: false
    }
  },
  general: {
    frequency: 'medium',
    priority: 'medium',
    autoExpire: 60,
    showInApp: true,
    showInBell: true
  },
  categories: {
    credit: {
      enabled: true,
      priority: 'high',
      sound: true,
      push: true,
      email: true,
      sms: false
    },
    training: {
      enabled: true,
      priority: 'medium',
      sound: true,
      push: false,
      email: false,
      sms: false
    },
    system: {
      enabled: true,
      priority: 'low',
      sound: false,
      push: false,
      email: false,
      sms: false
    },
    payment: {
      enabled: true,
      priority: 'high',
      sound: true,
      push: true,
      email: true,
      sms: false
    },
    milestone: {
      enabled: true,
      priority: 'high',
      sound: true,
      push: true,
      email: true,
      sms: false
    },
    alert: {
      enabled: true,
      priority: 'high',
      sound: true,
      push: true,
      email: true,
      sms: true
    },
    dispute: {
      enabled: true,
      priority: 'high',
      sound: true,
      push: true,
      email: true,
      sms: true
    },
    fcra: {
      enabled: true,
      priority: 'high',
      sound: true,
      push: false,
      email: true,
      sms: false
    },
    mail: {
      enabled: true,
      priority: 'medium',
      sound: true,
      push: false,
      email: true,
      sms: false
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || '550e8400-e29b-41d4-a716-446655440000'

    let preferences = preferencesStore.get(userId)
    if (!preferences) {
      preferences = { ...defaultPreferences, userId }
      preferencesStore.set(userId, preferences)
    }

    return NextResponse.json({
      success: true,
      preferences
    })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, preferences } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Merge with existing preferences
    const existingPreferences = preferencesStore.get(userId) || { ...defaultPreferences, userId }
    const updatedPreferences = { ...existingPreferences, ...preferences }
    
    preferencesStore.set(userId, updatedPreferences)

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: updatedPreferences
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, section, key, value } = body

    if (!userId || !section || !key) {
      return NextResponse.json(
        { success: false, error: 'User ID, section, and key are required' },
        { status: 400 }
      )
    }

    const existingPreferences = preferencesStore.get(userId) || { ...defaultPreferences, userId }
    
    // Update specific preference
    if (existingPreferences[section as keyof NotificationPreferences]) {
      (existingPreferences[section as keyof NotificationPreferences] as any)[key] = value
    }
    
    preferencesStore.set(userId, existingPreferences)

    return NextResponse.json({
      success: true,
      message: 'Preference updated successfully',
      preferences: existingPreferences
    })
  } catch (error) {
    console.error('Error updating specific preference:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update preference' },
      { status: 500 }
    )
  }
}

























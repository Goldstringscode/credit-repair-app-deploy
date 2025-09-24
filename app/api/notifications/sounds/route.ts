import { NextRequest, NextResponse } from 'next/server'
import { notificationSoundSystem } from '@/lib/notification-sound-system'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'

    switch (action) {
      case 'list':
        const sounds = notificationSoundSystem.getAllSounds()
        return NextResponse.json({
          success: true,
          sounds
        })

      case 'settings':
        const settings = notificationSoundSystem.getSettings()
        return NextResponse.json({
          success: true,
          settings
        })

      case 'categories':
        const categories = notificationSoundSystem.getSoundCategories()
        return NextResponse.json({
          success: true,
          categories
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error with sound system request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process sound system request' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, soundId, category, settings } = body

    switch (action) {
      case 'play':
        if (!soundId) {
          return NextResponse.json(
            { success: false, error: 'Sound ID is required' },
            { status: 400 }
          )
        }

        const played = await notificationSoundSystem.playSound(soundId)
        return NextResponse.json({
          success: played,
          message: played ? 'Sound played successfully' : 'Failed to play sound'
        })

      case 'play-by-category':
        if (!category) {
          return NextResponse.json(
            { success: false, error: 'Category is required' },
            { status: 400 }
          )
        }

        const categoryPlayed = await notificationSoundSystem.playSoundByCategory(category)
        return NextResponse.json({
          success: categoryPlayed,
          message: categoryPlayed ? 'Category sound played successfully' : 'Failed to play category sound'
        })

      case 'update-settings':
        if (!settings) {
          return NextResponse.json(
            { success: false, error: 'Settings are required' },
            { status: 400 }
          )
        }

        notificationSoundSystem.updateSettings(settings)
        return NextResponse.json({
          success: true,
          message: 'Sound settings updated successfully'
        })

      case 'test-sound':
        const testSoundId = soundId || 'success-default'
        const testPlayed = await notificationSoundSystem.playSound(testSoundId)
        
        return NextResponse.json({
          success: testPlayed,
          message: testPlayed ? 'Test sound played successfully' : 'Failed to play test sound',
          soundId: testSoundId
        })

      case 'stop-all':
        notificationSoundSystem.stopAllSounds()
        return NextResponse.json({
          success: true,
          message: 'All sounds stopped'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error with sound system action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process sound system action' },
      { status: 500 }
    )
  }
}

























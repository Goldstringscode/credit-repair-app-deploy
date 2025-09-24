"use client"

import { useParams, useRouter } from "next/navigation"
import { PlaylistPlayer } from "@/components/playlist/playlist-player"
import { getPlaylistById } from "@/lib/playlist-system"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"

export default function PlaylistPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const playlistId = params.playlistId as string

  const playlist = getPlaylistById(playlistId)

  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Playlist Not Found</h1>
            <p className="text-gray-600 mb-6">The playlist you're looking for doesn't exist or has been removed.</p>
            <Link href="/mlm/training/playlists">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Playlists
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleVideoComplete = (videoId: string) => {
    console.log(`Video ${videoId} completed`)
  }

  const handlePlaylistComplete = () => {
    console.log(`Playlist ${playlist.title} completed`)
    // Could redirect to certificate page or next playlist
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PlaylistPlayer
        playlist={playlist}
        onVideoComplete={handleVideoComplete}
        onPlaylistComplete={handlePlaylistComplete}
      />
    </div>
  )
}

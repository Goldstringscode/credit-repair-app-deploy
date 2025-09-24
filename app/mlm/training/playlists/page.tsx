"use client"
import { useRouter } from "next/navigation"
import { PlaylistManager } from "@/components/playlist/playlist-manager"
import type { Playlist } from "@/lib/playlist-system"

export default function PlaylistsPage() {
  const router = useRouter()

  const handlePlaylistSelect = (playlist: Playlist) => {
    router.push(`/mlm/training/playlists/${playlist.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PlaylistManager onPlaylistSelect={handlePlaylistSelect} />
    </div>
  )
}

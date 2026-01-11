import { BadgeCheck, X } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"

const StoryViewer = ({ viewStory, setViewStory }) => {
  const [progress, setProgress] = useState(0)
  const videoRef = useRef(null)

  useEffect(() => {
    if (!viewStory) return

    let timer = null
    let progressInterval = null

    // IMAGE & TEXT STORY (10s)
    if (viewStory.media_type !== "video") {
      setProgress(0)
      const duration = 10000
      const step = 100
      let elapsed = 0

      progressInterval = setInterval(() => {
        elapsed += step
        setProgress((elapsed / duration) * 100)
        if (elapsed >= duration) clearInterval(progressInterval)
      }, step)

      timer = setTimeout(() => {
        setViewStory(null)
      }, duration)
    }

    return () => {
      if (timer) clearTimeout(timer)
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [viewStory])

  const handleClose = () => {
    setViewStory(null)
  }

  if (!viewStory) return null

  const renderContent = () => {
    switch (viewStory.media_type) {
      case "image":
        return (
          <img
            src={viewStory.media_url}
            alt="story"
            className="max-w-full max-h-screen object-contain"
          />
        )

      case "video":
        return (
          <video
            ref={videoRef}
            src={viewStory.media_url}
            className="max-h-screen max-w-full"
            autoPlay
            controls
            onTimeUpdate={() => {
              if (!videoRef.current) return
              const { currentTime, duration } = videoRef.current
              setProgress((currentTime / duration) * 100)
            }}
            onEnded={() => setViewStory(null)}
          />
        )

      case "text":
        return (
          <div className="w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center">
            {viewStory.content}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      className="fixed inset-0 h-screen bg-black/90 z-[110] flex items-center justify-center"
      style={{
        background:
          viewStory.media_type === "text"
            ? viewStory.background_color
            : "#000000"
      }}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-600">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* User Info */}
      <div className="absolute top-4 left-4 flex items-center gap-3 px-4 py-2 backdrop-blur rounded bg-black/50">
        <img
          src={viewStory.user?.profile_picture}
          alt="user"
          className="size-7 sm:size-8 rounded-full object-cover border border-white"
        />
        <div className="text-white font-medium flex items-center gap-1.5">
          <span>{viewStory.user?.full_name}</span>
          <BadgeCheck size={18} />
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white"
      >
        <X className="w-8 h-8 hover:scale-110 transition cursor-pointer" />
      </button>

      {/* Content */}
      <div className="max-w-[90vw] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  )
}

export default StoryViewer

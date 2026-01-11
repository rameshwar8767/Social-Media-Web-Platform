import React, { useEffect, useState } from 'react'
import { dummyStoriesData } from '../assets/assets'
import { Plus } from 'lucide-react'
import moment from 'moment'
import StoryModel from './StoryModel'
import StoryViewer from './StoryViewer'

const StoriesBar = () => {
  const [stories, setStories] = useState([])
  const [showModel, setShowModel] = useState(false)
  const [viewStory, setViewStory] = useState(null) // ✅ FIXED

  // Fetch stories (later replace with API)
  const fetchStories = () => {
    setStories(dummyStoriesData || []) // defensive
  }

  useEffect(() => {
    fetchStories()
  }, [])

  return (
    <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl px-4 overflow-x-auto no-scrollbar">
      <div className="flex gap-4 pb-5">

        {/* ➕ Add Story */}
        <div
          onClick={() => setShowModel(true)}
          className="min-w-[120px] h-40 aspect-[3/4]
          rounded-xl border-2 border-dashed border-indigo-300
          bg-gradient-to-b from-indigo-50 to-white
          flex items-center justify-center
          cursor-pointer transition
          hover:shadow-lg hover:scale-[1.02]"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="size-10 bg-indigo-500 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Create Story
            </p>
          </div>
        </div>

        {/* 📸 Story Cards */}
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => setViewStory(story)}
            className="relative min-w-[120px] h-40 aspect-[3/4]
            rounded-xl overflow-hidden cursor-pointer
            shadow transition
            hover:shadow-xl hover:scale-[1.03]
            active:scale-95 bg-black"
          >
            {/* Media */}
            {story.media_type !== 'text' && (
              <div className="absolute inset-0 z-0">
                {story.media_type === "image" ? (
                  <img
                    src={story.media_url}
                    alt="story"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={story.media_url}
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                )}
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            {/* Profile */}
            <img
              src={story.user.profile_picture}
              alt={story.user.name}
              className="absolute top-3 left-3 z-20 size-8 rounded-full ring-2 ring-white shadow"
            />

            {/* Content */}
            <p className="absolute top-14 left-3 z-20 text-white text-sm font-medium truncate max-w-[90px]">
              {story.content}
            </p>

            {/* Time */}
            <p className="absolute bottom-1 right-2 z-20 text-xs text-white/80">
              {moment(story.createdAt).fromNow()}
            </p>
          </div>
        ))}
      </div>

      {/* ➕ Add Story Modal */}
      {showModel && (
        <StoryModel
          setShowModel={setShowModel}
          fetchStories={fetchStories}
        />
      )}

      {/* 👁️ View Story Modal */}
      {viewStory && (
        <StoryViewer
          viewStory={viewStory}
          setViewStory={setViewStory}
        />
      )}
    </div>
  )
}

export default StoriesBar

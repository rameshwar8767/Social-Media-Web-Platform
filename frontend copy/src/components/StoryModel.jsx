import React, { useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Image,
  Type,
  Smile,
  Music,
  Bold,
  Italic
} from "lucide-react"
import EmojiPicker from "emoji-picker-react"
import { toast } from "react-hot-toast"

/* ---------------- CONSTANTS ---------------- */

const bgColors = [
  "linear-gradient(135deg, #feda75, #fa7e1e)",
  "linear-gradient(135deg, #d62976, #962fbf)",
  "linear-gradient(135deg, #4f5bd5, #1fa2ff)",
  "linear-gradient(135deg, #ff512f, #dd2476)",
  "linear-gradient(135deg, #43cea2, #185a9d)",
  "linear-gradient(135deg, #1d2b64, #f8cdda)"
]

const textColors = [
  "#ffffff", "#000000", "#ffeb3b", "#ff5722",
  "#4caf50", "#03a9f4", "#e91e63"
]

const fonts = ["font-sans", "font-serif", "font-mono"]

/* ---------------- COMPONENT ---------------- */

const StoryModel = ({ setShowModel, fetchStories }) => {
  /* ---------- STATE ---------- */
  const [mode, setMode] = useState("text")
  const [background, setBackground] = useState(bgColors[0])
  const [text, setText] = useState("")
  const [textColor, setTextColor] = useState("#ffffff")
  const [fontSize, setFontSize] = useState(28)
  const [fontFamily, setFontFamily] = useState(fonts[0])
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)

  const [media, setMedia] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [song, setSong] = useState(null)
  const [showEmoji, setShowEmoji] = useState(false)

  /* ---------- DRAG ---------- */
  const canvasRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  /* ---------- MEDIA ---------- */
  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMedia(file)
    setPreviewUrl(URL.createObjectURL(file))
    setMode("media")
  }

  const handleSongUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) setSong(file)
  }

  useEffect(() => {
    return () => previewUrl && URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  /* ---------- EMOJI ---------- */
  const onEmojiClick = (emoji) => {
    setText((prev) => prev + emoji.emoji)
  }

  /* ---------- DRAG LOGIC ---------- */
  const startDrag = () => {
    setDragging(true)
    setShowEmoji(false)
  }

  const stopDrag = () => setDragging(false)

  const onDrag = (e) => {
    if (!dragging) return
    const rect = canvasRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    })
  }

  /* ---------- TEXT ZOOM ---------- */
  const handleWheel = (e) => {
    setFontSize((prev) =>
      Math.min(64, Math.max(16, prev + (e.deltaY < 0 ? 2 : -2)))
    )
  }

  /* ---------- CREATE STORY (FIXED) ---------- */
  const handleCreateStory = async () => {
    if (!text && !media && !song) {
      throw new Error("Add text, media or song to continue")
    }

    const payload = {
      type: mode,
      text,
      textColor,
      fontSize,
      fontFamily,
      bold,
      italic,
      position,
      background,
      media,
      song,
      createdAt: new Date()
    }

    console.log("STORY PAYLOAD:", payload)

    // simulate API delay
    await new Promise((res) => setTimeout(res, 800))

    fetchStories?.()
    setShowModel(false)
    return true
  }

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl p-4 text-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setShowModel(false)} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft />
          </button>

          <h2 className="font-semibold">Create Story</h2>

          <button
            onClick={() =>
              toast.promise(handleCreateStory(), {
                loading: "Saving...",
                success: "Story added 🎉",
                error: (e) => e.message
              })
            }
            className="text-indigo-400 font-semibold text-sm"
          >
            Share
          </button>
        </div>

        {/* MODE SWITCH */}
        <div className="flex gap-2 mb-3">
          <button onClick={() => setMode("text")} className="mode-btn active">
            <Type size={16} /> Text
          </button>

          <label className="mode-btn">
            <Image size={16} /> Media
            <input hidden type="file" accept="image/*,video/*" onChange={handleMediaUpload} />
          </label>

          <label className="mode-btn">
            <Music size={16} /> Song
            <input hidden type="file" accept="audio/*" onChange={handleSongUpload} />
          </label>
        </div>

        {/* CANVAS */}
        <div
          ref={canvasRef}
          className="relative h-96 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background }}
          onMouseMove={onDrag}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          {previewUrl && media?.type?.startsWith("image") && (
            <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" />
          )}

          {previewUrl && media?.type?.startsWith("video") && (
            <video src={previewUrl} autoPlay muted loop className="absolute inset-0 w-full h-full object-cover" />
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onMouseDown={startDrag}
            onWheel={handleWheel}
            placeholder="Type something..."
            className={`absolute bg-transparent resize-none focus:outline-none text-center
              ${fontFamily} ${bold && "font-bold"} ${italic && "italic"}`}
            style={{
              color: textColor,
              fontSize,
              transform: `translate(${position.x}px, ${position.y}px)`
            }}
          />

          {showEmoji && (
            <div className="absolute bottom-3 z-50">
              <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div className="mt-3 space-y-3">
          <div className="flex justify-between">
            <button onClick={() => setBold(!bold)} className="tool-btn"><Bold size={16} /></button>
            <button onClick={() => setItalic(!italic)} className="tool-btn"><Italic size={16} /></button>
            <button onClick={() => setShowEmoji(!showEmoji)} className="tool-btn"><Smile size={16} /></button>
          </div>

          <div className="flex gap-2">
            {fonts.map((f) => (
              <button
                key={f}
                onClick={() => setFontFamily(f)}
                className={`px-3 py-1 rounded ${fontFamily === f ? "bg-white/20" : "bg-white/10"}`}
              >
                Aa
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {textColors.map((c) => (
              <button
                key={c}
                onClick={() => setTextColor(c)}
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {bgColors.map((bg) => (
              <button
                key={bg}
                onClick={() => setBackground(bg)}
                className="min-w-[36px] h-8 rounded"
                style={{ background: bg }}
              />
            ))}
          </div>

          {song && <p className="text-xs text-white/70 truncate">🎵 {song.name}</p>}
        </div>
      </div>
    </div>
  )
}

export default StoryModel
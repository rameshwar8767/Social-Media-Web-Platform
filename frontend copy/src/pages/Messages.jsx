import React from "react"
import { dummyConnectionsData } from "../assets/assets"
import { Eye, MessageSquare } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Messages = () => {
  const navigate = useNavigate()

  const connections = dummyConnectionsData || []

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Messages
          </h1>
          <p className="text-slate-600">
            Talk to your friends and family
          </p>
        </div>

        {/* Empty State */}
        {connections.length === 0 && (
          <div className="text-center text-slate-500 py-10">
            No conversations yet
          </div>
        )}

        {/* Connected Users */}
        <div className="bg-white rounded-lg shadow divide-y">
          {connections.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-4 p-4 hover:bg-slate-50 transition"
            >
              {/* Avatar */}
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="size-12 rounded-full object-cover"
              />

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {user.full_name}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  @{user.username}
                </p>
                {user.bio && (
                  <p className="text-xs text-gray-500 truncate">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  aria-label="Open chat"
                  onClick={() => navigate(`/messages/${user._id}`)}
                  className="size-9 flex items-center justify-center rounded-full
                  bg-indigo-50 text-indigo-600
                  hover:bg-indigo-100 active:scale-95 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  aria-label="View profile"
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="size-9 flex items-center justify-center rounded-full
                  bg-slate-100 text-slate-700
                  hover:bg-slate-200 active:scale-95 transition"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Messages

// import React, { useMemo, useState } from "react"
// import { dummyConnectionsData } from "../assets/assets"
// import {
//   Eye,
//   MessageSquare,
//   Search,
//   Pin,
//   PinOff
// } from "lucide-react"
// import { useNavigate } from "react-router-dom"
// import moment from "moment"

// const Messages = () => {
//   const navigate = useNavigate()

//   // Local state so pin/unpin works
//   const [connections, setConnections] = useState(
//     dummyConnectionsData || []
//   )

//   const [query, setQuery] = useState("")

//   /* 🔍 SEARCH */
//   const filteredConnections = useMemo(() => {
//     if (!query.trim()) return connections

//     const q = query.toLowerCase()
//     return connections.filter((user) =>
//       user.full_name?.toLowerCase().includes(q) ||
//       user.username?.toLowerCase().includes(q) ||
//       user.last_message?.text?.toLowerCase().includes(q)
//     )
//   }, [query, connections])

//   /* 📌 PIN SORTING */
//   const sortedConnections = useMemo(() => {
//     const pinned = filteredConnections.filter(u => u.isPinned)
//     const unpinned = filteredConnections.filter(u => !u.isPinned)
//     return [...pinned, ...unpinned]
//   }, [filteredConnections])

//   /* 📌 TOGGLE PIN */
//   const togglePin = (e, userId) => {
//     e.stopPropagation()
//     setConnections(prev =>
//       prev.map(user =>
//         user._id === userId
//           ? { ...user, isPinned: !user.isPinned }
//           : user
//       )
//     )
//   }

//   const renderLastMessage = (user) => {
//     if (user.isTyping) return "Typing..."
//     if (!user.last_message) return "No messages yet"
//     return user.last_message.text || "Media"
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <div className="max-w-5xl mx-auto px-4 py-8">

//         {/* Title */}
//         <div className="mb-4">
//           <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
//           <p className="text-slate-600">
//             Talk to your friends and family
//           </p>
//         </div>

//         {/* 🔍 Search */}
//         <div className="relative mb-4">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search conversations"
//             className="w-full pl-9 pr-3 py-2 rounded-lg border
//             border-slate-200 focus:outline-none
//             focus:ring-2 focus:ring-indigo-400 text-sm"
//           />
//         </div>

//         {/* Empty State */}
//         {sortedConnections.length === 0 && (
//           <div className="text-center text-slate-500 py-10">
//             No conversations found
//           </div>
//         )}

//         {/* Conversations */}
//         <div className="bg-white rounded-lg shadow divide-y">
//           {sortedConnections.map((user) => {
//             const lastMsg = user.last_message

//             return (
//               <div
//                 key={user._id}
//                 onClick={() => navigate(`/messages/${user._id}`)}
//                 className={`flex items-center gap-4 p-4 cursor-pointer
//                 hover:bg-slate-50 transition
//                 ${user.isPinned ? "bg-indigo-50/40" : ""}`}
//               >
//                 {/* Avatar */}
//                 <div className="relative">
//                   <img
//                     src={user.profile_picture}
//                     alt={user.full_name}
//                     className="size-12 rounded-full object-cover"
//                   />
//                   {user.isOnline && (
//                     <span className="absolute bottom-0 right-0
//                       w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
//                   )}
//                 </div>

//                 {/* Info */}
//                 <div className="flex-1 min-w-0">
//                   <div className="flex justify-between items-center">
//                     <p className="font-medium text-slate-800 truncate">
//                       {user.full_name}
//                     </p>
//                     {lastMsg?.createdAt && (
//                       <p className="text-[11px] text-slate-400">
//                         {moment(lastMsg.createdAt).fromNow()}
//                       </p>
//                     )}
//                   </div>

//                   <div className="flex justify-between items-center gap-2">
//                     <p
//                       className={`text-sm truncate max-w-[220px]
//                       ${!lastMsg?.seen && !user.isTyping
//                         ? "font-medium text-slate-800"
//                         : "text-slate-500"}`}
//                     >
//                       {renderLastMessage(user)}
//                     </p>

//                     {!lastMsg?.seen && !user.isTyping && (
//                       <span className="bg-indigo-500 text-white min-w-[18px] h-[18px]
//                         flex items-center justify-center rounded-full text-[10px]">
//                         1
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex gap-2">
//                   {/* Pin */}
//                   <button
//                     onClick={(e) => togglePin(e, user._id)}
//                     className="size-9 flex items-center justify-center rounded-full
//                     bg-slate-100 hover:bg-slate-200 transition"
//                     aria-label="Pin chat"
//                   >
//                     {user.isPinned ? (
//                       <PinOff className="w-4 h-4 text-indigo-600" />
//                     ) : (
//                       <Pin className="w-4 h-4 text-slate-600" />
//                     )}
//                   </button>

//                   {/* Profile */}
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation()
//                       navigate(`/profile/${user._id}`)
//                     }}
//                     className="size-9 flex items-center justify-center rounded-full
//                     bg-slate-100 hover:bg-slate-200 transition"
//                   >
//                     <Eye className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Messages

// import React, { useEffect, useRef, useState } from 'react'
// import { dummyMessagesData, dummyUserData } from '../assets/assets'
// import { ImageIcon, SendHorizonal } from 'lucide-react';

// const ChatBox = () => {

//   const messages = dummyMessagesData;
//   const [text,setText] = useState('')
//   const [image,setImage] = useState(null)
//   const [user,setUser] = useState(dummyUserData)

//   const messageEndRef = useRef(null)

//   const sendMessage = async()=>{

//   }

//   useEffect(()=>{
//     messageEndRef.current?.scrollIntoView({behavior: "smooth"})
//   },[messages])
//   return user &&  (
//     <div className='flex flex-col h-screen'>
//       <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r fromn-indigo-50 to-purple-50 border-b border-gray-300'>
//         <img src={user.profile_picture} alt="" className='size-8 rounded-full' />
//         <div>
//           <p className='font-medium'>{user.full_name}</p>
//           <p className='text-sm text-gray-500 -mt-1.5'>@{user.username}</p>
//         </div>
//       </div>

//       <div className='p=5 md:px-10 h-full overflow-y-scroll'>
//         <div className='space-y-4 max-w-4xl mx-auto'>
//           {
//             messages.toSorted((a,b)=> new Date(a.createdAt) - new Date(b.createdAt))
//             .map((message,index)=>(
//               <div key={index} className={`flex flex-col #{message.to_user_id !== user._id ? 'items-start' : 'items-end'}`}>
//                 <div className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${message.to_user_id !== user._id ? 'rounded-bl-none' : 'rounded-br-none'}`}>
//                   {
//                     message.message_type === 'image' && <img src={message.media_url} className='w-full max-w-sm rounded-lg mb-1 ' alt="" />
//                   }
                  
//                   <p>{message.text}</p>
//                 </div>
//               </div>
//             ))
//           }

//           <div ref={messageEndRef}/>

          
//         </div>
//       </div>

//       <div className='px-4'>
//         <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5'>
//           <input  type="text" className='flex-1 outline-none text-slate-700' placeholder='Type a message...' onKeyDown={e=>e.key ==='Enter' && sendMessage()} onChange={(e)=>setText(e.target.value)} value={text}/>

//           <label htmlFor="image">

//             {
//               image ? <img src={URL.createObjectURL(image)} alt=""  className='h-8 rounded'/> 
//               : <ImageIcon className='size-7 text-gray-400 cursor-pointer'/>
//             }
//             <input type="file"  id = 'image' accept='image/*' hidden onChange={(e)=>setImage(e.target.files[0])}  />
//           </label>

//           <button onClick={sendMessage} className='bg-gradient-to-br font-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purplr-800 active:scale-95 cursor-pointer text-white p-2 rounded-full'>
//             <SendHorizonal size={18}/>
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ChatBox

import React, { useEffect, useRef, useState } from "react"
import { dummyMessagesData, dummyUserData } from "../assets/assets"
import { ImageIcon, SendHorizontal } from "lucide-react"

const ChatBox = () => {
  const [messages, setMessages] = useState(dummyMessagesData || [])
  const [text, setText] = useState("")
  const [image, setImage] = useState(null)
  const [user] = useState(dummyUserData)

  const messageEndRef = useRef(null)

  /* 🔽 Auto scroll */
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /* 🖼️ Clean image preview */
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image)
    }
  }, [image])

  /* 📩 SEND MESSAGE */
  const sendMessage = () => {
    if (!text.trim() && !image) return

    const newMessage = {
      _id: Date.now(),
      from_user_id: user._id,
      to_user_id: "receiver_id",
      text,
      message_type: image ? "image" : "text",
      media_url: image ? URL.createObjectURL(image) : null,
      createdAt: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setText("")
    setImage(null)
  }

  if (!user) return null

  return (
    <div className="flex flex-col h-screen bg-slate-50">

      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 py-3
        bg-gradient-to-r from-indigo-50 to-purple-50
        border-b sticky top-0 z-10">
        <img
          src={user.profile_picture}
          alt={user.full_name}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{user.full_name}</p>
          <p className="text-xs text-gray-500 -mt-1">
            @{user.username}
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages
            .slice()
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((message) => {
              const isMine = message.from_user_id === user._id

              return (
                <div
                  key={message._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-sm p-3 text-sm rounded-xl shadow
                      ${isMine
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white text-slate-700 rounded-bl-none"
                      }`}
                  >
                    {message.message_type === "image" && message.media_url && (
                      <img
                        src={message.media_url}
                        alt="media"
                        className="rounded-md mb-1 max-w-full"
                      />
                    )}
                    {message.text && <p>{message.text}</p>}
                  </div>
                </div>
              )
            })}
          <div ref={messageEndRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="px-4 py-3 border-t bg-white">
        <div className="flex items-center gap-3
          max-w-3xl mx-auto
          border rounded-full px-4 py-2 shadow-sm">

          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 outline-none text-sm text-slate-700"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <label htmlFor="image" className="cursor-pointer">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="h-8 w-8 object-cover rounded"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
            <input
              id="image"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>

          <button
            onClick={sendMessage}
            className="bg-gradient-to-br from-indigo-500 to-purple-600
              hover:from-indigo-600 hover:to-purple-700
              active:scale-95 transition
              text-white p-2 rounded-full"
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox

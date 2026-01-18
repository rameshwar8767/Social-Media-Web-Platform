// import React, { useState } from 'react'
// import { dummyUserData } from '../assets/assets'
// import { Image, ImageIcon, X } from 'lucide-react'

// const CreatePost = () => {
//   const [content,setContent] = useState('')
//   const [images,setImages] = useState([])
//   const [loading,setLoading] = useState(false)

//   const user = dummyUserData;

//   const handleSubmit = async()=>{

//   }


//   return (
//     <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
//       <div className='max-w-6xl mx-auto p-6'>
//         {/* Title */}
//         <div className='mb-8'>
//           <h1 className='text-3xl font-bold text-slate-900 mb-2'>Create Post</h1>
//           <p className='text-slate-600'>Share your thoughts with the world</p>
//         </div>

//         {/* Form */}
//         <div className='max-w-xl bg-white p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4'>
//           {/* Header */}
//           <div className='flex items-center gap-3'>
//             <img src={user.profile_picture} alt="" className='w-12 h-12 rounded-full shadow' />
//             <div>
//               <h2 className='font-semibold'>{user.full_name}</h2>
//               <p className='text-sm text-gray-500'>@{user.username}</p>
//             </div>
//           </div>

//           {/* Text Area */}
//           <textarea className='w-full resize-none max-h-20 mt-4 text-sm outline-none placeholder-gray-400 ' placeholder="What's Happening?" onChange={(e)=>setContent(e.target.value)} value={content}/>

//             {/* Images */}
//             {
//               images.length > 0 && 
//               <div className='flex flex-wrap gap-2 mt-4'>
//                 {images.map((image,i)=>(
                
//                   <div key={i} className='relative group'>
//                     <img src={URL.createObjectURL(image)} className='h-20 rounded-md' alt="" />
//                     <div onClick={()=>setImages(images.filter((_, index)=> index !== i))} className='absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer'>
//                       <X className='w-6 h-6 text-white'/>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             }

//             {/* Bottom Bar */}
//             <div className='flex items-center justify-between pt-3 border-t border-gray-300'>
//               <label htmlFor="images" className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer'>
//                 <Image className='size-6'/>
//               </label>

//               <input type="file"  id="images" accept='image/*' hidden multiple onChange={(e)=>setImages([...images,...e.target.files])}/>

//               <button disabled={loading} onClick={()=>TableRowsSplit.promise(handleSubmit(),
//               {
//                 loading: "uploading...",
//                 success: <p>Post Added</p>,
//                 error: <p>Pot Not Added</p>
//               })} className='text-sm bg-gradient-to0r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-8 py-2 rounded-md cursor-pointer'>
//                 Publish Post
//               </button>
//             </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default CreatePost

import React, { useEffect, useState } from "react"
import { dummyUserData } from "../assets/assets"
import { Image, X } from "lucide-react"
import { toast } from "react-hot-toast"

const CreatePost = () => {
  const user = dummyUserData

  const [content, setContent] = useState("")
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)

  /* 🖼️ CREATE PREVIEWS SAFELY */
  useEffect(() => {
    const urls = images.map(file => URL.createObjectURL(file))
    setPreviews(urls)

    return () => {
      urls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [images])

  /* ➕ ADD IMAGES */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    if (images.length + files.length > 4) {
      toast.error("You can upload up to 4 images")
      return
    }

    setImages(prev => [...prev, ...files])
  }

  /* ❌ REMOVE IMAGE */
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  /* 🚀 SUBMIT POST */
  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error("Post cannot be empty")
      return
    }

    setLoading(true)

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("POST DATA:", {
          content,
          images
        })

        setContent("")
        setImages([])
        setLoading(false)
        resolve()
      }, 1200)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Create Post
          </h1>
          <p className="text-slate-600">
            Share your thoughts with the world
          </p>
        </div>

        {/* Card */}
        <div className="max-w-xl bg-white rounded-xl shadow-md p-5 space-y-4">

          {/* Header */}
          <div className="flex items-center gap-3">
            <img
              src={user.profile_picture}
              alt={user.full_name}
              className="w-12 h-12 rounded-full object-cover shadow"
            />
            <div>
              <h2 className="font-semibold text-slate-800">
                {user.full_name}
              </h2>
              <p className="text-sm text-gray-500">
                @{user.username}
              </p>
            </div>
          </div>

          {/* Text */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            rows={3}
            className="w-full resize-none text-sm outline-none
            placeholder-gray-400 border border-transparent
            focus:border-indigo-300 rounded-md p-2"
          />

          {/* Image Preview */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img
                    src={src}
                    alt="preview"
                    className="h-32 w-full object-cover rounded-md"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1
                    bg-black/60 text-white rounded-full p-1
                    opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Bar */}
          <div className="flex items-center justify-between pt-3 border-t">
            <label
              htmlFor="images"
              className="flex items-center gap-2 text-sm
              text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <Image className="w-5 h-5" />
              Add photos
            </label>

            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleImageChange}
            />

            <button
              disabled={loading}
              onClick={() =>
                toast.promise(handleSubmit(), {
                  loading: "Publishing...",
                  success: "Post published 🎉",
                  error: "Failed to publish post"
                })
              }
              className={`px-6 py-2 rounded-md text-sm font-medium
              text-white transition active:scale-95
              ${loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              }`}
            >
              Publish
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CreatePost

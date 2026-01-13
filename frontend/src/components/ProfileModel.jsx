// import React, { useState } from 'react'
// import { dummyUserData } from '../assets/assets'
// import { Pencil } from 'lucide-react';

// const ProfileModel = ({setShowEdit}) => {

//     const user = dummyUserData;
//     const [editForm , setEditForm] = useState({
//       username : user.username,
//       bio: user.bio,
//       location:user.location,
//       profile_picture: null,
//       full_name: user.full_name,
//       cover_photo:null
//     })

//     const handleSaveProfile = async (e)=>{
//       e.preventDefault();
//     }
//   return (
//     <div className='fixed top-0 bottom-0 left-0 right-0 z-110 h-scren overflow-y-scroll bg-black/50'>
//       <div className='max-w-2xl sm:py-6 mx-auto'>
//         <div className='bg-white rounded-lg shadow p-6'>
//           <h1 className='text-2xl font-bold text-gray-900 mb-6'>Edit Profile</h1>

//           <form  className='space-y-4' onSubmit={handleSaveProfile}>
//             {/* Profile Picture */}
//             <div className='flex flex-col items-start gap-3'>
//               <label htmlFor="profile_picture" className='block text-sm font-medium text-gray-700 mb-1'>
//                 Profile Picture
//                 <input hidden type="file" accept='image/*' id="profile_picture" className='w-full p-3 border border-gay-200 rounded-lg' onChange={(e)=>setEditForm({...editForm,profile_picture:e.target.files[0]})} />
//                 <div className='group/profile relative'>
//                   <img className='w-24 h-24 rounded-full object-cover mt-2' src={editForm.profile_picture ? URL.createObjectURL(editForm.profile_picture) : user.profile_picture} alt="" />

//                   <div className='absolute hidden group-hover/profile:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-full items-center justify-center'>
//                     <Pencil className='w-5 h-5 text-white'/>
//                   </div>
//                 </div>
//               </label>
//             </div>

//             {/* Cover Photo */}
//             <div className='flex flex-col items-start gap-3'>
//               <label htmlFor="cover_photo" className='block text-sm font-medium text-gray-700 mb-1'>
//                 Cover Photo
//                 <input hidden type="file" accept='image/*' id="cover_photo" className='w-full p-3 border border-gay-200 rounded-lg' onChange={(e)=>setEditForm({...editForm,cover_photo:e.target.files[0]})} />

//                 <div className='group/cover relative'>
//                   <img src={editForm.cover_photo ? URL.createObjectURL(editForm.cover_photo) : user.cover_photo} alt="" className='w-80 h-40 rounded-lg bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 object-cover mt-2' />

//                   <div className='absolute hidden group-hover/cover:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-lg items-center justify-center'>
//                      <Pencil className='w-5 h-5 text-white'/>
//                   </div>
//                 </div>
//               </label>
//             </div>

//             {/* Input title */}

//           <div>
//             <label className='block text-sm font-medium text-gray-700 mb-1'>
//               Name
//             </label>
//             <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter your full name' onChange={(e)=>setEditForm({...editForm,full_name:e.target.value})} value={editForm.full_name}/>

//           </div>

//           <div>
//             <label className='block text-sm font-medium text-gray-700 mb-1'>
//               Username
//             </label>
//             <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a Username' onChange={(e)=>setEditForm({...editForm,username:e.target.value})} value={editForm.username}/>
//           </div>

//           <div>
//             <label className='block text-sm font-medium text-gray-700 mb-1'>
//               Bio
//             </label>
//             <textarea rows={3}  className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a bio' onChange={(e)=>setEditForm({...editForm,bio:e.target.value})} value={editForm.bio}/>
//           </div>

//           <div>
//             <label className='block text-sm font-medium text-gray-700 mb-1'>
//               Location
//             </label>
//             <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter your location' onChange={(e)=>setEditForm({...editForm,location:e.target.value})} value={editForm.location}/>
//           </div>

//             <div className='flex justify-end space-x-3 pt-6'>
//               <button type='button' onClick={()=>setShowEdit(false)} className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'>Cancel</button>
//               <button type='submit' className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer'>Save Changes</button>
//             </div>
//           </form>
          
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ProfileModel
import React, { useEffect, useState } from "react"
import { dummyUserData } from "../assets/assets"
import { Pencil } from "lucide-react"

const ProfileModel = ({ setShowEdit }) => {
  const user = dummyUserData

  const [editForm, setEditForm] = useState({
    full_name: user.full_name || "",
    username: user.username || "",
    bio: user.bio || "",
    location: user.location || "",
    profile_picture: null,
    cover_photo: null
  })

  const [profilePreview, setProfilePreview] = useState(user.profile_picture)
  const [coverPreview, setCoverPreview] = useState(user.cover_photo)

  /* 🖼️ PREVIEW CLEANUP */
  useEffect(() => {
    let profileUrl, coverUrl

    if (editForm.profile_picture) {
      profileUrl = URL.createObjectURL(editForm.profile_picture)
      setProfilePreview(profileUrl)
    }

    if (editForm.cover_photo) {
      coverUrl = URL.createObjectURL(editForm.cover_photo)
      setCoverPreview(coverUrl)
    }

    return () => {
      if (profileUrl) URL.revokeObjectURL(profileUrl)
      if (coverUrl) URL.revokeObjectURL(coverUrl)
    }
  }, [editForm.profile_picture, editForm.cover_photo])

  /* 💾 SAVE PROFILE */
  const handleSaveProfile = (e) => {
    e.preventDefault()

    if (!editForm.full_name.trim() || !editForm.username.trim()) {
      alert("Name and username are required")
      return
    }

    console.log("UPDATED PROFILE:", editForm)
    setShowEdit(false)
  }

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/50 flex items-start justify-center
      overflow-y-auto p-4"
      onClick={() => setShowEdit(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow p-6 my-10"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Edit Profile
        </h1>

        <form onSubmit={handleSaveProfile} className="space-y-5">

          {/* PROFILE PICTURE */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </p>

            <label className="relative w-24 h-24 block cursor-pointer group">
              <img
                src={profilePreview}
                alt="profile"
                className="w-full h-full rounded-full object-cover border"
              />
              <div
                className="absolute inset-0 bg-black/30 rounded-full
                hidden group-hover:flex items-center justify-center"
              >
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    profile_picture: e.target.files[0]
                  })
                }
              />
            </label>
          </div>

          {/* COVER PHOTO */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Cover Photo
            </p>

            <label className="relative block cursor-pointer group max-w-md">
              <img
                src={coverPreview}
                alt="cover"
                className="w-full h-40 rounded-lg object-cover
                bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200"
              />
              <div
                className="absolute inset-0 bg-black/30 rounded-lg
                hidden group-hover:flex items-center justify-center"
              >
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    cover_photo: e.target.files[0]
                  })
                }
              />
            </label>
          </div>

          {/* FULL NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={editForm.full_name}
              onChange={(e) =>
                setEditForm({ ...editForm, full_name: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Enter your full name"
            />
          </div>

          {/* USERNAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={editForm.username}
              onChange={(e) =>
                setEditForm({ ...editForm, username: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Enter username"
            />
          </div>

          {/* BIO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              value={editForm.bio}
              onChange={(e) =>
                setEditForm({ ...editForm, bio: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Write something about yourself"
            />
          </div>

          {/* LOCATION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={editForm.location}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Enter your location"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg
              text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r
              from-indigo-500 to-purple-600 text-white rounded-lg
              hover:from-indigo-600 hover:to-purple-700 transition"
            >
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default ProfileModel

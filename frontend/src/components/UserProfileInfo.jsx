// import { Calendar, MapPin, PenBox, Verified } from 'lucide-react'
// import React from 'react'
// import moment from 'moment';


// const UserProfileInfo = ({user,posts, profileId,setShowEdit}) => {
//   return (
//     <div>
//       <div className='flex flex-col md:flex-row items-start gap-6'>
//         <div className='w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full'>
//             <img src={user.profile_picture} alt="" className='absolute rounded-full z-2' />
//         </div>

//         <div className='w-full pt-16 md:pt-0 md:pl-36'>
//             <div className='flex flex-col md:flex-row items-start justify-between'>
//                 <div>
//                     <div className='flex items-center gap-3'>
//                         <h1 className='text-2xl font-bold text-gray-900'>{user.full_name}</h1>
//                         <Verified className='w-6 h-6 text-blue-500'/>
//                     </div>
//                     <p>{user.username ? `@${user.username} ` : 'Add a username'}</p>
//                 </div>
//                 {/* if user is not on other profile that means he is opening his profile so we will give edit button */}

//                 {
//                   !profileId && 
//                   <button onClick={()=>setShowEdit(true)} className='cursor-pointer flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0'>
//                     <PenBox className='w-4 h-4'/>
//                     Edit
//                   </button>                }
//             </div>
//             <p className='text-gray-700 text-sm max-w-md mt-4'>{user.bio}</p>
        
//           <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4'>
//             <span className='flex items-center gap-1.5'>
//               <MapPin className='w-4 h-4'/>
//               {user.location ? user.location : 'Add location'}
//             </span>
//             <span className='flex items-center gap-1.5'>
//               <Calendar className='w-4 h-4'/>
//                   Joined <span className='font-medium'>{moment(user.createdAt).fromNow()}</span> 
//             </span>
//           </div>

//           <div className='flex items-center gap-6 mt-6 border-t border-gray-200 pt-4'>
//             <div>
//               <span className='sm:text-xl font-bold text-gray-900'>{posts.length}</span>
//               <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Posts</span>
//             </div>

//             <div>
//               <span className='sm:text-xl font-bold text-gray-900'>{user.followers.length}</span>
//               <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Followers</span>
//             </div>

//             <div>
//               <span className='sm:text-xl font-bold text-gray-900'>{user.following.length}</span>
//               <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Following</span>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   )
// }

// export default UserProfileInfo
import { Calendar, MapPin, PenBox, Verified } from "lucide-react"
import React from "react"
import moment from "moment"

const UserProfileInfo = ({ user, posts = [], profileId, setShowEdit }) => {
  if (!user) return null

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row items-start gap-6">

        {/* Avatar */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
            <img
              src={user.profile_picture}
              alt={user.full_name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="w-full md:pl-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">

            {/* Name */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.full_name}
                </h1>

                {user.is_verified && (
                  <Verified className="w-5 h-5 text-blue-500" />
                )}
              </div>

              <p className="text-gray-500">
                {user.username ? `@${user.username}` : "Add a username"}
              </p>
            </div>

            {/* Edit Button */}
            {!profileId && (
              <button
                onClick={() => setShowEdit?.(true)}
                className="flex items-center gap-2 px-4 py-2
                border border-gray-300 rounded-lg
                text-sm font-medium
                hover:bg-gray-100 active:scale-95 transition"
              >
                <PenBox className="w-4 h-4" />
                Edit profile
              </button>
            )}
          </div>

          {/* Bio */}
          <p className="text-gray-700 text-sm max-w-md mt-4">
            {user.bio || "No bio added yet"}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2
            text-sm text-gray-500 mt-4"
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {user.location || "Add location"}
            </span>

            {user.createdAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Joined{" "}
                <span className="font-medium">
                  {moment(user.createdAt).fromNow()}
                </span>
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-6 pt-4 border-t border-gray-200">
            <div>
              <span className="text-lg font-bold text-gray-900">
                {posts.length}
              </span>
              <span className="ml-1 text-sm text-gray-500">
                Posts
              </span>
            </div>

            <div>
              <span className="text-lg font-bold text-gray-900">
                {user.followers?.length || 0}
              </span>
              <span className="ml-1 text-sm text-gray-500">
                Followers
              </span>
            </div>

            <div>
              <span className="text-lg font-bold text-gray-900">
                {user.following?.length || 0}
              </span>
              <span className="ml-1 text-sm text-gray-500">
                Following
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfileInfo


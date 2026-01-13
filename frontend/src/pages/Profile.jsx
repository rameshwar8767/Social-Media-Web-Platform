// import React, { useEffect, useState } from 'react'
// import { Link, useParams}  from 'react-router-dom'
// import { dummyPostsData, dummyUserData } from '../assets/assets';
// import Loading from '../components/Loading';
// import PostCard from '../components/PostCard.jsx'
// import UserProfileInfo from '../components/UserProfileInfo';
// import moment from 'moment';

// const Profile = () => {
//   const {profileId} = useParams();
//   const [user,setUser] = useState(null)
//   const [posts,setPosts] = useState([])
//   const [activeTab,setActiveTab] = useState('posts')
//   const [showEdit,,setShowEdit] = useState(false)

//   const fetchUser = async ()=>{
//     setUser(dummyUserData)
//     setPosts(dummyPostsData)
//   }

//   useEffect(()=>{
//     fetchUser()
//   },[])

//   return user ? (
//     <div className='relative h-full overflow-y-scroll bg-gray-50 p-6'>
//       <div className='max-w-3xl mx-auto'>
//         {/* Profile Card */}
//         <div className='bg-white rounded-2xl shadow overflow-hidden'>
//           {/* Cover Photo */}
//           <div className='h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'>
//             {
//               user.cover_photo && <img src={user.cover_photo} alt="" className='w-full h-full object-cover' />
//             }
//           </div>

//           {/* User Info */}
//           <UserProfileInfo user={user} posts={posts} profileId={profileId} setShowEdit={setShowEdit}
//           />
//         </div>

//         {/* Tabs */}
//         <div className='mt-6'>
//           <div className='bg-white rounded-xl shadow p-1 flex max-w-md mx-auto'>
//             {["posts","media","likes"].map((tab)=>(
//               <button onClick={()=>setActiveTab(tab)} key={tab} className={`flex px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"}`}>
//                 {tab.charAt(0).toUpperCase()+ tab.slice(1)}
//               </button>
//             ))}
//           </div>

//           {/* Posts */}
//           {activeTab==='posts' && (
//             <div className='mt-6 flex flex-col items-center gap-6'>
//               {posts.map((post)=> <PostCard key={post._id} post={post}/>)}
//             </div>
//           )}

//           {/* Media */}
//           {activeTab==='media' && (
//             <div className='flex flex-wrap mt-6 max-w-6xl'>
//               {posts.filter((post)=> post.image_urls.length > 0).map((post)=>(
//                 <>
//                 {post.image_urls.map((image,index)=>(
//                   <Link target='_blank' to={image} key={index} className='relative group'>
//                     <img className='w-64 aspect-video object-cover' src={image} alt="" />
//                     <p className='absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300'>
//                       Posted {moment(post.createdAt).fromNow()}
//                     </p>
//                   </Link>
//                 ))}
//                 </>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {
//         showEdit && <p>Show profile edit</p>
//       }
//     </div>
//   ) : (
//     <Loading/>
//   )


//   return (
//     <div>
      
//     </div>
//   )
// }

// export default Profile
import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { dummyPostsData, dummyUserData } from "../assets/assets"
import Loading from "../components/Loading"
import PostCard from "../components/PostCard"
import UserProfileInfo from "../components/UserProfileInfo"
import moment from "moment"
import ProfileModel from "../components/ProfileModel"

const Profile = () => {
  const { profileId } = useParams()

  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState("posts")
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    // Simulate API call
    setUser(dummyUserData)
    setPosts(dummyPostsData)
  }, [])

  if (!user) return <Loading />

  return (
    <div className="relative min-h-screen bg-gray-50 px-4 py-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">

          {/* Cover */}
          <div className="h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt="cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* User Info */}
          <div className="px-6 pb-6">
            <UserProfileInfo
              user={user}
              posts={posts}
              profileId={profileId}
              setShowEdit={setShowEdit}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow p-1 flex max-w-md mx-auto">
            {["posts", "media", "likes"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition
                  ${activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* POSTS */}
          {activeTab === "posts" && (
            <div className="mt-6 flex flex-col items-center gap-6">
              {posts.length === 0 ? (
                <p className="text-gray-500">No posts yet</p>
              ) : (
                posts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))
              )}
            </div>
          )}

          {/* MEDIA */}
          {activeTab === "media" && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {posts
                .filter(post => post.image_urls?.length > 0)
                .flatMap(post =>
                  post.image_urls.map((image, index) => (
                    <Link
                      key={`${post._id}-${index}`}
                      to={image}
                      target="_blank"
                      className="relative group"
                    >
                      <img
                        src={image}
                        alt="media"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <span
                        className="absolute bottom-1 right-1 text-[10px]
                        bg-black/60 text-white px-2 py-0.5 rounded
                        opacity-0 group-hover:opacity-100 transition"
                      >
                        {moment(post.createdAt).fromNow()}
                      </span>
                    </Link>
                  ))
                )}

              {posts.every(p => !p.image_urls?.length) && (
                <p className="col-span-full text-center text-gray-500">
                  No media posts yet
                </p>
              )}
            </div>
          )}

          {/* LIKES (placeholder) */}
          {activeTab === "likes" && (
            <div className="mt-6 text-center text-gray-500">
              Likes feature coming soon ❤️
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal Placeholder */}
      {showEdit && <ProfileModel setShowEdit={setShowEdit}/> }
    </div>
  )
}

export default Profile

// import React, { useState } from 'react'
// import { Users, UserPlus, UserCheck,UserRoundPen, MessagesSquare } from 'lucide-react'
// import {data, useNavigate} from 'react-router-dom';
// import {
//   dummyConnectionsData as connections,
//   dummyFollowersData as followers,
//   dummyFollowingData as following,
//   dummyPendingConnectionsData as pendingConnections
// } from '../assets/assets.js'

// const Connections = () => {
//   const navigate = useNavigate();
//   const[currentTab,setCurrentTab] = useState('followers')

//   const dataArray = [
//     {label: 'Followers',value: followers,icon: Users},
//     {label: 'Following',value: following,icon: UserCheck},
//     {label: 'Pending',value: pendingConnections,icon: UserRoundPen},
//     {label: 'Connections',value: connections,icon: UserPlus},
//   ]

//   return (
//     <div className='min-h-scree bg-slate-50'>
//       <div className='max-w-6xl mx-auto p-6'>

//         {/* Title */}
//         <div className='mb-8'>
//           <h1 className='text-3xl font-bold text-slate-900 mb-2'>Connections</h1>
//           <p className='text-slate-600'>Manage your network and discover new connections</p>
//         </div>
//         {/* Counts */}
//         <div className='mb-8 flex flex-wrap gap-6'>
//           {dataArray.map((item,index)=>(
//             <div key={index} className='flex flex-col items-center justify-center gap-1 border h-20 w-40 border-gray-200 bg-white shadow rounded-md'>
//               <b>{item.value.length}</b>
//               <p className='text-slate-600'>{item.label}</p>
//             </div>
//           ))}
//         </div>

//         {/* Tabs */}
//         <div className='inline-flex flex-wrap items-center border border-gray-200 rounded-md p-1 bg-white shadow-sm'>
//           {
//             dataArray.map((tab)=>(
//               <button onClick={()=>setCurrentTab(tab.label)} key={tab.label} className={`flex items-center cursor-pointer px-3 py-1 text-sm rounded-md transition-colors ${currentTab === tab.label ? 'bg-white font-medium text-black' :'text-gray-500 hover:text-black'}`}>
//                 <tab.icon className='w-4 h-4/12'/>
//                 <span className='ml-1'>{tab.label}</span>
//                 {tab.count !== undefined && (
//                   <span className='ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full'>{tab.count}</span>
//                 )}
//               </button>
//             ))
//           }
//         </div>

//         {/* Connections */}

//         <div className='flex flex-wrap gap-6 mt-6'>
//           {
//             dataArray.find((item)=>item.label === currentTab).value.map((user)=>(
//               <div key={user._id} className='w-full max-w-88 flex gap-5 p-6 bg-white shadow rounded-md'>
//                 <img src={user.profile_picture} className='rounded-full w-12 h-12 shadow-md mx-auto' alt="" />
//                 <div className='flex-1'>
//                   <p className='font-medium text-slate-700'>{user.full_name}</p>
//                   <p className='text-slate-500'>@{user.username}</p>
//                   <p className='text-sm text-gray-600'>{user.bio.slice(0,30)}...</p>

//                   <div className='flex max-sm:flex-col gap-2 mt-4'>
//                     {
//                       <button onClick={()=>navigate(`/profile/${user._id}`)} className='w-full p-2 text-sm rounded bg-gradient0+-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer'>
//                         View Profile
//                       </button>
//                     }

//                     {
//                       currentTab === 'Following' && (
//                         <button className='w-full p-2 text-sm rounded bg-gradient0+-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer'>
//                           Unfollow
//                         </button>
//                       )
//                     }

//                     {
//                       currentTab === 'Pending' && (
//                         <button className='w-full p-2 text-sm rounded bg-gradient0+-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer'>
//                           Accept
//                         </button>
//                       )
//                     }

//                     {
//                       currentTab === 'Connections' && (
//                         <button onClick={()=>navigate(`/messages/${user._id}`)} className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1'>
//                           <MessagesSquare className='h-4 w-4'/>
//                           Message
//                         </button>
//                       )
//                     }
//                   </div>
//                 </div>

//               </div>
//             ))
//           }
//         </div>
//       </div>
      
//     </div>
//   )
// }

// export default Connections

import React, { useState } from "react"
import {
  Users,
  UserPlus,
  UserCheck,
  UserRoundPen,
  MessagesSquare
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  dummyConnectionsData as connections,
  dummyFollowersData as followers,
  dummyFollowingData as following,
  dummyPendingConnectionsData as pendingConnections
} from "../assets/assets"

const Connections = () => {
  const navigate = useNavigate()

  const [currentTab, setCurrentTab] = useState("followers")

  const tabs = [
    {
      key: "followers",
      label: "Followers",
      value: followers,
      icon: Users
    },
    {
      key: "following",
      label: "Following",
      value: following,
      icon: UserCheck
    },
    {
      key: "pending",
      label: "Pending",
      value: pendingConnections,
      icon: UserRoundPen
    },
    {
      key: "connections",
      label: "Connections",
      value: connections,
      icon: UserPlus
    }
  ]

  const activeTab = tabs.find(tab => tab.key === currentTab)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Connections
          </h1>
          <p className="text-slate-600">
            Manage your network and discover new connections
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <div
                key={tab.key}
                className="bg-white border rounded-lg shadow
                flex flex-col items-center justify-center gap-1 h-24
                hover:shadow-md transition"
              >
                <Icon className="w-5 h-5 text-indigo-600" />
                <b className="text-xl">{tab.value.length}</b>
                <p className="text-sm text-slate-600">{tab.label}</p>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="inline-flex flex-wrap gap-1 p-1 bg-white border rounded-lg shadow-sm">
          {tabs.map(tab => {
            const Icon = tab.icon
            const active = currentTab === tab.key

            return (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition
                  ${active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Connections List */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {activeTab?.value.map(user => (
            <div
              key={user._id}
              className="bg-white p-5 rounded-lg shadow
              flex gap-4 hover:shadow-md transition"
            >
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="w-12 h-12 rounded-full object-cover shadow"
              />

              <div className="flex-1">
                <p className="font-medium text-slate-800">
                  {user.full_name}
                </p>
                <p className="text-sm text-slate-500">
                  @{user.username}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {user.bio?.slice(0, 40) || "No bio available"}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="px-3 py-2 text-sm rounded
                    bg-gradient-to-r from-indigo-500 to-purple-600
                    hover:from-indigo-600 hover:to-purple-700
                    text-white transition"
                  >
                    View Profile
                  </button>

                  {currentTab === "following" && (
                    <button className="px-3 py-2 text-sm rounded
                      bg-red-100 text-red-600 hover:bg-red-200 transition">
                      Unfollow
                    </button>
                  )}

                  {currentTab === "pending" && (
                    <button className="px-3 py-2 text-sm rounded
                      bg-green-100 text-green-600 hover:bg-green-200 transition">
                      Accept
                    </button>
                  )}

                  {currentTab === "connections" && (
                    <button
                      onClick={() => navigate(`/messages/${user._id}`)}
                      className="px-3 py-2 text-sm rounded
                      bg-slate-100 hover:bg-slate-200
                      flex items-center gap-1 transition"
                    >
                      <MessagesSquare className="w-4 h-4" />
                      Message
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {activeTab?.value.length === 0 && (
            <p className="text-slate-500 text-center col-span-full">
              No users found
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default Connections


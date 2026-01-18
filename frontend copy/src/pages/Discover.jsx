// import React, { useState } from 'react'
// import {dummyConnectionsData} from '../assets/assets'
// import { Search } from 'lucide-react'
// import UserCard from '../components/UserCard'
// import Loading from '../components/Loading'

// const Discover = () => {
//   const [input,setInput] = useState('')
//   const [users,setUsers] = useState(dummyConnectionsData)
//   const [loading,setLoading] = useState(false)

//   const handleSearch = async(e)=>{
//     if(e.key === 'Enter'){
//       setUsers([])
//       setLoading(true)
//       setTimeout(()=>{
//         setUsers(dummyConnectionsData)
//         setLoading(false)
//       },1000)
//     }
//   }
//   return (
//     <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
//       <div className='max-w-6xl mx-auto p-6'>
//         {/* Title */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-slate-900">
//             Discover People
//           </h1>
//           <p className="text-slate-600">
//             Connect with amazing people and grow your network
//           </p>
//         </div>

//         {/* Search  */}

//         <div className='mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80'>
//           <div className='p-6'>
//             <div className='relative'>
//               <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5'/>
//               <input className='pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm' type="text" placeholder='Search people by name, username, bio, or location...' onChange={(e)=>setInput(e.target.value)} value={input} onKeyUp={handleSearch}/>

//             </div>
//           </div>
//         </div>

//         <div className='flex flex-wrap gap-6'>
//           {
//           users.map((user)=>(
//             <UserCard  user={user} key={user._id}/>
//           ))
//         }
//         </div>

//         {
//           loading && (<Loading height='60vh'/>)
//         }
//       </div>
      
//     </div>
//   )
// }

// export default Discover

import React, { useEffect, useState } from "react"
import { dummyConnectionsData } from "../assets/assets"
import { Search } from "lucide-react"
import UserCard from "../components/UserCard"
import Loading from "../components/Loading"

const Discover = () => {
  const allUsers = dummyConnectionsData || []

  const [input, setInput] = useState("")
  const [users, setUsers] = useState(allUsers)
  const [loading, setLoading] = useState(false)

  /* 🔍 SEARCH LOGIC (OPTIMIZED) */
  useEffect(() => {
    setLoading(true)

    const timeout = setTimeout(() => {
      if (!input.trim()) {
        setUsers(allUsers)
      } else {
        const query = input.toLowerCase()
        const filtered = allUsers.filter((user) =>
          user.full_name?.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query) ||
          user.bio?.toLowerCase().includes(query) ||
          user.location?.toLowerCase().includes(query)
        )
        setUsers(filtered)
      }
      setLoading(false)
    }, 400) // debounce feel

    return () => clearTimeout(timeout)
  }, [input, allUsers])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Discover People
          </h1>
          <p className="text-slate-600">
            Connect with amazing people and grow your network
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 bg-white rounded-xl shadow border border-slate-200">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2
                text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, username, bio, or location..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border
                border-slate-300 focus:outline-none
                focus:ring-2 focus:ring-indigo-400 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && <Loading height="50vh" />}

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            No users found matching your search
          </div>
        )}

        {/* Users Grid */}
        {!loading && users.length > 0 && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {users.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Discover

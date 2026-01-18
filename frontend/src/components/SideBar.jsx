import React from 'react';
import { assets, dummyUserData } from '../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import MenuItems from './MenuItems';
import { User, CirclePlus, LogOut } from 'lucide-react';

const SideBar = ({ sideBarOpen, setSideBarOpen, user = dummyUserData, appData, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`w-64 xl:w-80 bg-white dark:bg-card border-r border-gray-200 dark:border-slate-700 flex flex-col justify-between shadow-social lg:shadow-none max-sm:absolute top-0 bottom-0 z-20 transition-all duration-300 ease-in-out ${sideBarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'}`}>
      <div className='w-full p-6'>
        <div 
          onClick={() => { navigate("/feed/home"); setSideBarOpen(false); }} 
          className='w-32 h-12 flex items-center cursor-pointer hover:opacity-80 transition-all mb-8'
        >
          <img 
            src={assets.logo} 
            className='w-full h-full object-contain' 
            alt="LinkUp" 
          />
        </div>
        <hr className='border-gray-200 dark:border-slate-700 mb-8'/>

        <MenuItems setSideBarOpen={setSideBarOpen} />

        <Link 
          to='/create-post' 
          className='flex items-center justify-center gap-3 py-4 mt-8 mx-2 rounded-2xl bg-gradient-to-r from-highlight to-primary hover:from-primary hover:to-accent hover:shadow-social active:scale-95 transition-all text-white font-semibold shadow-md text-sm cursor-pointer'
          onClick={() => setSideBarOpen(false)}
        >
          <CirclePlus className='w-5 h-5' />
          Create Post
        </Link>
      </div>
      
      <div className='w-full border-t border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between'>
        <div className='flex gap-3 items-center cursor-pointer hover:shadow-social p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all' onClick={() => { navigate('/profile'); setSideBarOpen(false); }}>
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-md ring-2 ring-white/30 hover:ring-highlight/50 transition-all relative overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.full_name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span className="text-white font-bold text-lg">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className='text-base font-semibold text-gray-900 dark:text-white truncate hover:text-primary transition-colors'>{user?.full_name || 'User'}</h1>
            <p className='text-sm text-gray-500 dark:text-gray-400'>@{user?.username || 'user'}</p>
          </div>
        </div>
        <LogOut 
          className='w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:rotate-180 transition-all cursor-pointer p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl'
          onClick={handleLogout} 
        />
      </div>
    </div>
  );
};

export default SideBar;

import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Search, Heart, MessagesSquare, PlusSquare, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SideBar from '../components/SideBar';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const Layout = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!localStorage.getItem('token')) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        
        const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (!userRes.ok) {
          localStorage.removeItem('token');
          logout();
          navigate('/login');
          return;
        }

        const userData = await userRes.json();
        setUser(userData);

        const notificationsRes = await fetch(`${API_BASE_URL}/notifications/count`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const notificationsData = await notificationsRes.json();
        setAppData({
          notificationsCount: notificationsData.count || 0,
          newMessages: notificationsData.newMessages || 0,
          connectionRequests: notificationsData.requests || 0,
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        localStorage.removeItem('token');
        logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [logout, navigate, setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50/50 to-primary/10 dark:from-bgDark dark:to-slate-900">
        <div className="text-center p-8 post-card shadow-social">
          <div className="w-16 h-16 border-4 border-highlight/20 border-t-highlight rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user && !localStorage.getItem('token')) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white/50 to-primary/5 dark:from-bgDark dark:via-slate-900/50 dark:to-accent/10 flex flex-col lg:flex-row overflow-hidden">
      
      {/* Mobile Top Navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-card backdrop-blur-md border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between p-4 px-6 h-16">
          {/* Logo & User Avatar */}
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center gap-2 p-3 post-card rounded-2xl hover:shadow-social cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => navigate('/feed/home')}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg">L</span>
              </div>
              <span className="font-black text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LinkUp
              </span>
            </div>
            
            <div 
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-highlight to-primary flex items-center justify-center cursor-pointer hover:shadow-social hover:scale-105 transition-all"
              onClick={() => navigate('/profile')}
              title={user?.username || 'Profile'}
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.username} className="w-full h-full rounded-2xl object-cover shadow-inner" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
          </div>

          {!sideBarOpen && (
            <Menu 
              className="w-8 h-8 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary transition-colors"
              onClick={() => setSideBarOpen(true)}
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 pt-16 lg:pt-0 overflow-hidden">
        
        {/* Sidebar */}
        <div className={`lg:relative lg:translate-x-0 lg:w-72 transition-all duration-300 ease-in-out ${
          sideBarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 z-40 lg:z-auto`}>
          <SideBar 
            sideBarOpen={sideBarOpen} 
            setSideBarOpen={setSideBarOpen}
            user={user}
            appData={appData}
            onLogout={logout}
          />
        </div>

        {/* Overlay for mobile sidebar */}
        {sideBarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 dark:bg-black/60 z-30 lg:hidden"
            onClick={() => setSideBarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>

        {/* Mobile Close Button */}
        {sideBarOpen && (
          <X 
            className="fixed top-6 right-6 z-50 p-3 bg-white dark:bg-card backdrop-blur-sm rounded-2xl shadow-2xl shadow-social w-14 h-14 text-gray-700 dark:text-gray-300 lg:hidden hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
            onClick={() => setSideBarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;

import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import Home from './pages/feed/Home';
// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import ChatBox from "./pages/ChatBox";
import Connections from "./pages/Connections";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Layout from "./pages/Layout";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";

// Routes
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

const AppContent = () => {
  const location = useLocation();

  return (
    <>
      {/* Instagram Dark Toaster */}
      <Toaster 
        position="top-right" 
        gutter={8}
        containerStyle={{ top: 80 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #374151',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            fontSize: '14px',
            maxWidth: '400px'
          },
          success: {
            style: { background: '#10b981', borderColor: '#059669' },
            iconTheme: { primary: '#fff', secondary: '#10b981' }
          },
          error: {
            style: { background: '#ef4444', borderColor: '#dc2626' },
            iconTheme: { primary: '#fff', secondary: '#ef4444' }
          },
          loading: { style: { background: '#6b7280' } }
        }}
      />

      {/* FIXED AnimatePresence + Routes */}
      <AnimatePresence mode="popLayout">
        <Routes location={location} key={location.pathname}>
          {/* PUBLIC ROUTES */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* Root redirect to login for unauthenticated users */}
            <Route path="/" element={<Navigate to="/login" replace state={{ from: location }} />} />
          </Route>

          {/* PROTECTED ROUTES */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Feed />} />
              <Route path="feed/home" element={<Home />} />
              <Route path="messages" element={<Messages />} />
              <Route path="messages/:userId" element={<ChatBox />} />
              <Route path="connections" element={<Connections />} />
              <Route path="discover" element={<Discover />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:username" element={<Profile />} />
              <Route path="create-post" element={<CreatePost />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;

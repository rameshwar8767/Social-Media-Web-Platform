import React, { useState } from 'react';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required");
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      const token = response.data?.data?.token || response.data?.data?.accessToken || response.data?.token || response.data?.accessToken;
      const userData = response.data?.data?.user || response.data?.data || response.data?.user;
      
      if (!token) throw new Error("No token received from server");

      localStorage.setItem("token", token);
      if (userData) localStorage.setItem("user", JSON.stringify(userData));

      login({ token, ...userData });

      toast.success("Welcome back!");
      setTimeout(() => navigate("/feed/home", { replace: true }), 300);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Login failed";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Login error:', err);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-50 via-primary/20 to-accent/20 dark:from-bgDark dark:to-gray-800">
      {/* Left Branding */}
      <div className="flex-1 flex flex-col items-start justify-between p-8 md:p-12 lg:pl-20 text-gray-900 dark:text-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-white font-black text-xl">L</span>
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LinkUp
          </h1>
        </div>

        <div className="space-y-6 max-w-lg">
          <div className="flex items-center gap-3 p-6 post-card hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent/20 rounded-2xl flex items-center justify-center">
              <span className="text-primary text-2xl">✨</span>
            </div>
            <div>
              <h3 className="font-bold text-2xl">Welcome Back</h3>
              <p className="text-lg opacity-80">Sign in to continue</p>
            </div>
          </div>

          <div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight bg-gradient-to-r from-gray-900 to-primary bg-clip-text text-transparent drop-shadow-2xl dark:from-white dark:to-accent">
              Welcome to
              <br />
              <span className="text-accent dark:text-primary">LinkUp.</span>
            </h1>
            <p className="text-xl mt-6 opacity-90 leading-relaxed max-w-md">
              Connect, share, discover—your social world awaits.
            </p>
          </div>
        </div>
        <div className="h-24" />
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-lg post-card shadow-2xl p-10 space-y-6 hover:shadow-xl transition-all">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Sign In
            </h2>
            <p className="text-xl opacity-70">Welcome back to LinkUp</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 text-red-800 dark:text-red-200 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary w-5 h-5 transition-colors" />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 font-medium focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary w-5 h-5 transition-colors" />
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 font-medium focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-primary hover:text-accent font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-lg py-4 px-8 shadow-xl hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-primary font-bold hover:text-accent transition-colors"
            >
              Create one
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;

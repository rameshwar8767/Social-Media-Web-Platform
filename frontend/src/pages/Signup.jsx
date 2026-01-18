import React, { useState } from 'react';
import { Loader2, User, Mail, Lock, Check, AlertCircle } from 'lucide-react';
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Get login function from context
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!form.full_name.trim()) errors.full_name = "Name required";
    if (!form.username.trim()) errors.username = "Username required";
    if (form.username.length < 3) errors.username = "Min 3 characters";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Valid email required";
    if (form.password.length < 6) errors.password = "Min 6 characters";
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setValidationErrors({ ...validationErrors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    // Validate
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the errors");
      return;
    }

    try {
      setLoading(true);
      
      // Call backend
      const response = await api.post("/auth/register", {
        full_name: form.full_name.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      // ✅ Success
      toast.success("Account created! Redirecting...");
      
      // Store token (check different response structures)
      const token = response.data?.data?.accessToken || response.data?.data?.token || response.data?.accessToken || response.data?.token;
      const userData = response.data?.data?.user || response.data?.data || response.data?.user;
      
      if (token) {
        localStorage.setItem('token', token); // ✅ Use 'token' key for consistency with AuthContext
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Update auth context
        login({ token, ...userData });
      }

      // ✅ Redirect to /feed/home with replace
      setTimeout(() => {
        navigate("/feed/home", { replace: true });
      }, 500);

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Signup failed";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-900/30 via-purple-900/30 to-indigo-900/30 -z-10" />

      {/* Left Branding Section */}
      <div className="flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40 text-white z-10">
        
        {/* LinkUp Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-lg">L</span>
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            LinkUp
          </h1>
        </div>
        
        <div className="space-y-6 max-w-md">
          <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/40 transition-all">
            <Check className="w-10 h-10 text-emerald-400 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg">Join 12k+ Users</h3>
              <p className="text-sm opacity-90">Create your profile today</p>
            </div>
          </div>

          <div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight bg-gradient-to-r from-white via-pink-100 to-indigo-100 bg-clip-text text-transparent drop-shadow-2xl">
              Join the Circle.
              <br />
              <span className="text-emerald-300">Find Your People.</span>
            </h1>
            <p className="text-xl mt-4 opacity-90 leading-relaxed max-w-lg">
              Become part of a community where real connections happen every day.
            </p>
          </div>
        </div>

        <div className="h-20" />
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10 space-y-5 hover:border-white/30 transition-all">
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
              Create Account
            </h2>
            <p className="text-base text-white/80">Join us in 30 seconds</p>
          </div>

          {/* General Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5 group-focus-within:text-emerald-300 transition-colors" />
            <input
              name="full_name"
              type="text"
              placeholder="Full Name"
              value={form.full_name}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-white/60 font-medium focus:outline-none focus:ring-4 focus:border-white/50 transition-all ${
                validationErrors.full_name ? 'border-red-500 focus:ring-red-500/30' : 'border-white/30 focus:ring-emerald-500/30'
              }`}
              required
            />
            {validationErrors.full_name && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.full_name}</p>
            )}
          </div>

          {/* Username */}
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold group-focus-within:text-emerald-300 transition-colors">@</span>
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-white/60 font-medium focus:outline-none focus:ring-4 focus:border-white/50 transition-all ${
                validationErrors.username ? 'border-red-500 focus:ring-red-500/30' : 'border-white/30 focus:ring-emerald-500/30'
              }`}
              required
            />
            {validationErrors.username && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5 group-focus-within:text-emerald-300 transition-colors" />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-white/60 font-medium focus:outline-none focus:ring-4 focus:border-white/50 transition-all ${
                validationErrors.email ? 'border-red-500 focus:ring-red-500/30' : 'border-white/30 focus:ring-emerald-500/30'
              }`}
              required
            />
            {validationErrors.email && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5 group-focus-within:text-emerald-300 transition-colors" />
            <input
              name="password"
              type="password"
              placeholder="Password (min 6 chars)"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              className={`w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border rounded-2xl text-white placeholder-white/60 font-medium focus:outline-none focus:ring-4 focus:border-white/50 transition-all ${
                validationErrors.password ? 'border-red-500 focus:ring-red-500/30' : 'border-white/30 focus:ring-emerald-500/30'
              }`}
              required
            />
            {validationErrors.password && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 text-white py-3.5 rounded-2xl font-bold text-base shadow-2xl hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-white/70 pt-2">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-emerald-300 font-bold hover:text-white transition-colors"
            >
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
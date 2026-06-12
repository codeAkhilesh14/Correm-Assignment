import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Mail, Lock, User, Loader2, Wallet, Sun, Moon } from "lucide-react";

export default function Register() {
  const { register: signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await signup(data.name, data.email, data.password);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err || "Registration failed. Email might be in use.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-100 dark:bg-darkbg-200 p-6 relative overflow-hidden transition-colors duration-300 font-sans">
      {/* Decorative Orbs */}
      <div className="absolute w-96 h-96 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl -top-12 -left-12"></div>
      <div className="absolute w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -bottom-12 -right-12"></div>

      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-white/10"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo Banner */}
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2.5 bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/20">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="font-sans font-black text-2xl tracking-tight bg-gradient-to-r from-brand-500 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
              CORREM
            </span>
          </Link>
          <h2 className="text-xl font-bold mt-2">Create your account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Get started extracting bank statements in seconds</p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-white/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 pl-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register("name", { required: "Name is required" })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 focus:border-brand-500 rounded-xl outline-none transition-all dark:text-white"
                />
              </div>
              {errors.name && <span className="text-[10px] text-red-500 pl-1">{errors.name.message}</span>}
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 pl-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 focus:border-brand-500 rounded-xl outline-none transition-all dark:text-white"
                />
              </div>
              {errors.email && <span className="text-[10px] text-red-500 pl-1">{errors.email.message}</span>}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 pl-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 focus:border-brand-500 rounded-xl outline-none transition-all dark:text-white"
                />
              </div>
              {errors.password && <span className="text-[10px] text-red-500 pl-1">{errors.password.message}</span>}
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 pl-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === password || "Passwords do not match",
                  })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 focus:border-brand-500 rounded-xl outline-none transition-all dark:text-white"
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-[10px] text-red-500 pl-1">{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/70 text-white font-bold rounded-xl text-sm shadow-lg shadow-brand-500/15 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Login Bottom Hook */}
        <p className="text-xs text-center mt-6 text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-brand-500 dark:text-brand-400 hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

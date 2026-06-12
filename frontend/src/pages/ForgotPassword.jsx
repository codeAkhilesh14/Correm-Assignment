import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Mail, Lock, KeyRound, ArrowLeft, Loader2, Wallet, Sun, Moon } from "lucide-react";

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1 = Request, 2 = Reset
  const [resetEmail, setResetEmail] = useState("");

  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest },
  } = useForm();

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: errorsReset },
    watch,
  } = useForm();

  const newPassword = watch("password");

  const onRequestSubmit = async (data) => {
    setSubmitting(true);
    try {
      await forgotPassword(data.email);
      setResetEmail(data.email);
      toast.success("Reset access granted! Please set your new password.");
      setStep(2);
    } catch (err) {
      toast.error(err || "Failed to initiate recovery.");
    } finally {
      setSubmitting(false);
    }
  };

  const onResetSubmit = async (data) => {
    setSubmitting(true);
    try {
      await resetPassword(resetEmail, data.password);
      toast.success("Password successfully updated. Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err || "Failed to update password.");
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
          <h2 className="text-xl font-bold mt-2">
            {step === 1 ? "Reset Password" : "Set New Password"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 1 
              ? "Recover your account credentials" 
              : `Define a secure password for ${resetEmail}`
            }
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-white/5">
          {step === 1 ? (
            /* STEP 1: Enter email */
            <form onSubmit={handleSubmitRequest(onRequestSubmit)} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 pl-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    {...registerRequest("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 focus:border-brand-500 rounded-xl outline-none transition-all dark:text-white"
                  />
                </div>
                {errorsRequest.email && (
                  <span className="text-[10px] text-red-500 pl-1">{errorsRequest.email.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/70 text-white font-bold rounded-xl text-sm shadow-lg shadow-brand-500/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  "Initiate Password Recovery"
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: Enter new password */
            <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-4">
              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 pl-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                    {...registerReset("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 focus:border-brand-500 rounded-xl outline-none transition-all dark:text-white"
                  />
                </div>
                {errorsReset.password && (
                  <span className="text-[10px] text-red-500 pl-1">{errorsReset.password.message}</span>
                )}
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
                    {...registerReset("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => value === newPassword || "Passwords do not match",
                    })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 focus:border-brand-500 rounded-xl outline-none transition-all dark:text-white"
                  />
                </div>
                {errorsReset.confirmPassword && (
                  <span className="text-[10px] text-red-500 pl-1">{errorsReset.confirmPassword.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/70 text-white font-bold rounded-xl text-sm shadow-lg shadow-brand-500/15 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-slate-200/50 dark:border-white/5 pt-4">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-500 flex items-center gap-1.5 justify-center"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

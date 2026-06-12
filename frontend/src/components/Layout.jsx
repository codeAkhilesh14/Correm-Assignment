import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  History,
  User,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  TrendingUp,
  FileSpreadsheet,
  Wallet
} from "lucide-react";

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "History", path: "/statements", icon: History },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-300 dark:bg-darkbg-200 dark:text-slate-100 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/50 dark:border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        {/* LOGO */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="p-2 bg-brand-500 text-white rounded-lg shadow-md shadow-brand-500/20">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="font-sans font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-500 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
            CORREM
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-300/30 dark:border-white/5">
            ANALYZER
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-2 rounded-lg ${
                  isActive(link.path)
                    ? "text-brand-500 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-500/10"
                    : "text-slate-600 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* CONTROLS */}
        <div className="hidden md:flex items-center gap-4">
          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* USER INFO */}
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200/50 dark:border-white/10">
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-brand-500/20 object-cover"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold max-w-[100px] truncate">{user.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{user.role}</span>
              </div>
            </div>
          )}

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400 text-slate-600 dark:text-slate-300 transition-colors"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* MOBILE MENU TRIGGER */}
        <div className="flex md:hidden items-center gap-2">
          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-72 z-50 bg-white dark:bg-darkbg-100 shadow-2xl p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-slate-800 dark:text-white">Navigation Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Avatar Card in mobile menu */}
              {user && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/5 mb-6 border border-slate-100 dark:border-white/5">
                  <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{user.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</span>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <div className="flex flex-col gap-2 flex-grow">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive(link.path)
                          ? "bg-brand-500 text-white shadow-md shadow-brand-500/10"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 mt-auto bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/10 rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Log Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PAGE CONTENT */}
      <main className="flex-grow flex flex-col p-6 md:p-12 max-w-7xl w-full mx-auto">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200/50 dark:border-white/5 py-6 px-6 md:px-12 bg-slate-50/50 dark:bg-darkbg-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <span className="font-semibold text-slate-700 dark:text-slate-300">CORREM BANK STATEMENT ANALYZER</span>
            <span>HDFC Bank Statement Analyzer Hiring Assignment</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span>FastAPI &bull; React &bull; MongoDB &bull; openpyxl &bull; Tesseract OCR</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <span className="text-[10px]">2026 all rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

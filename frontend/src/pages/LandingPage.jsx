import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ArrowRight,
  ShieldCheck,
  FileSearch,
  Cpu,
  Download,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  BarChart3,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  
  const features = [
    {
      icon: FileSearch,
      title: "Hybrid PDF Extraction",
      desc: "Automatically detects digital text and scanned pages, processing low-quality scans with a custom preprocessed Tesseract OCR pipeline.",
    },
    {
      icon: Cpu,
      title: "Rule-Based Categorization",
      desc: "Precisely categorizes transactions into 16 distinct sectors (Salary, Rent, Utilities, etc.) using a 100+ keyword regex matching engine.",
    },
    {
      icon: ShieldCheck,
      title: "Reconciliation Ledger",
      desc: "Performs balance chain verification (Opening Balance - Debits + Credits == Closing Balance) on every statement to guarantee zero dropped transactions.",
    },
    {
      icon: BarChart3,
      title: "Rich Analytics & Trends",
      desc: "Generates income/expense breakdowns, monthly net flows, balance timelines, and auto-detects recurring Salaries and EMIs.",
    },
    {
      icon: Download,
      title: "Multi-Sheet Excel Reports",
      desc: "Downloads beautiful, professionally-formatted reports containing metadata sheets, clean ledger lists, and summarized statistics.",
    },
    {
      icon: CheckCircle,
      title: "JWT & MongoDB Security",
      desc: "Features production-grade password hashing, route guards, stateless sessions, and a scalable Atlas database indexing architecture.",
    },
  ];

  const faqData = [
    {
      q: "Which bank formats does the analyzer support?",
      a: "The application is fine-tuned specifically for HDFC Bank savings/current account PDF statements. It extracts metadata and transaction ledgers accurately for this format.",
    },
    {
      q: "How does the scanner handle image-only or low-quality PDFs?",
      a: "Our PDF pipeline performs digital extraction using pdfplumber and PyMuPDF. If it detects zero or sparse text, it routes pages to a custom OCR pipeline. This converts pages to 200 DPI images, applies contrast boosting/denoising, and processes them with Tesseract OCR.",
    },
    {
      q: "What is the validation report?",
      a: "To guarantee zero transaction loss, the engine runs a check on each transaction: Previous Balance - Debit + Credit == New Balance. Any discrepancy is flagged, and a status report is shown in the validation dashboard.",
    },
    {
      q: "Can I host this on cloud platforms?",
      a: "Yes. The codebase contains configurations (render.yaml, requirements.txt, and static site build configurations) designed for deployment on Render.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800 transition-colors duration-300 dark:from-darkbg-100 dark:to-darkbg-200 dark:text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto py-5 px-6 md:px-12 flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-500 text-white rounded-lg shadow-md">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="font-sans font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-500 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
            CORREM
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm text-slate-600 dark:text-slate-300"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-500 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-md shadow-brand-500/10 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50/80 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold w-fit">
            <CheckCircle className="h-3.5 w-3.5" />
            100% Parsing Accuracy Guaranteed
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Analyze Bank Statements <br />
            <span className="bg-gradient-to-r from-brand-500 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
              With Zero Data Loss
            </span>
          </h1>
          
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-xl">
            Upload HDFC PDF statements. Extract metadata, reconstruct ledgers with balance chain validation, automatically categorize transactions, and generate download-ready financial sheets.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/register"
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-2 group transition-all"
            >
              Analyze Your Statement
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#workflow"
              className="px-6 py-3 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 font-semibold rounded-xl transition-all"
            >
              See How It Works
            </a>
          </div>
        </motion.div>

        {/* Hero Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center"
        >
          <div className="w-full max-w-lg aspect-[4/3] rounded-2xl glass-panel p-6 shadow-2xl relative overflow-hidden animate-float">
            {/* Visual Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
              </div>
              <span className="text-xs font-semibold text-brand-500">Reconciliation: SUCCESS</span>
            </div>

            {/* Quick stats grid inside mockup */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/30">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">TOTAL CREDITS</span>
                <span className="font-bold text-lg text-emerald-500">+₹1,45,200.00</span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/30">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">TOTAL DEBITS</span>
                <span className="font-bold text-lg text-red-500">-₹72,400.00</span>
              </div>
            </div>

            {/* Mock transactions table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded bg-brand-500/5 dark:bg-brand-500/10 border-l-2 border-brand-500">
                <div className="flex flex-col">
                  <span className="text-xs font-bold truncate max-w-[200px]">HDFC BANK SALARY</span>
                  <span className="text-[9px] text-slate-500">Salary &bull; Auto Detected</span>
                </div>
                <span className="text-xs font-bold text-emerald-500">+₹1,20,000.00</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-100 dark:bg-white/5">
                <div className="flex flex-col">
                  <span className="text-xs font-bold truncate max-w-[200px]">HDFC HOME LOAN EMI</span>
                  <span className="text-[9px] text-slate-500">EMI &bull; Confidence 95%</span>
                </div>
                <span className="text-xs font-bold text-red-500">-₹28,500.00</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-100 dark:bg-white/5">
                <div className="flex flex-col">
                  <span className="text-xs font-bold truncate max-w-[200px]">SWIGGY DELIVERY CO</span>
                  <span className="text-[9px] text-slate-500">Food &amp; Dining &bull; Swiggy</span>
                </div>
                <span className="text-xs font-bold text-red-500">-₹820.00</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="w-full py-20 bg-slate-100/50 dark:bg-darkbg-100/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold mb-4">Core Statement Processing Pipeline</h2>
            <p className="text-slate-600 dark:text-slate-400">Our processing pipeline combines robust file extraction with advanced heuristics to convert bank PDFs into structured datasets.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Upload PDF", desc: "Drag & drop your HDFC statement (up to 20MB). Both digital text PDFs and scanned pages are accepted." },
              { step: "02", title: "Smart Extraction", desc: "Digital text is extracted via fitz/pdfplumber. Scanned PDFs trigger an image preprocessing & Tesseract OCR pipeline." },
              { step: "03", title: "Balance Validation", desc: "Verifies every transaction amount mathematically to guarantee zero transaction loss and flags reconciliation issues." },
              { step: "04", title: "Deep Analytics", desc: "Categorizes ledger items with keyword regex maps and computes cash flows, recurring salaries, and EMIs." }
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl relative">
                <span className="text-4xl font-extrabold text-brand-500/20 dark:text-brand-400/10 absolute top-4 right-4">{item.step}</span>
                <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-white">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold mb-4">Packed with Production-Grade Features</h2>
          <p className="text-slate-600 dark:text-slate-400">Everything you need to extract and visualize bank statements for credit analysis or personal finance management.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="glass-card p-6 rounded-2xl flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 dark:bg-brand-400/10 flex items-center justify-center text-brand-500 dark:text-brand-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{feat.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section className="w-full py-20 bg-slate-100/50 dark:bg-darkbg-100/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold mb-4">Enterprise Technology Stack</h2>
            <p className="text-slate-600 dark:text-slate-400">Built using scalable, high-performance web and data parsing libraries.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { name: "FastAPI", category: "Backend Framework" },
              { name: "ReactJS & Vite", category: "Frontend Framework" },
              { name: "MongoDB Atlas", category: "Database Layer" },
              { name: "Tesseract OCR", category: "OCR Text Extraction" },
              { name: "pdfplumber & PyMuPDF", category: "PDF Text Extraction" },
              { name: "Tailwind CSS", category: "Design & Styles" },
              { name: "Framer Motion", category: "Page Animations" },
              { name: "openpyxl & pandas", category: "Excel & Data Analytics" }
            ].map((tech, idx) => (
              <div key={idx} className="p-4 bg-white dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5 shadow-sm">
                <span className="font-bold block text-slate-800 dark:text-white text-sm">{tech.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{tech.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-extrabold text-center mb-12">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqData.map((item, idx) => (
            <FAQItem key={idx} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="w-full bg-gradient-to-r from-brand-600 to-indigo-700 dark:from-brand-500 dark:to-indigo-600 rounded-3xl p-12 text-center text-white shadow-xl shadow-brand-500/10 flex flex-col items-center gap-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ready to Audit Your Bank Statements?</h2>
          <p className="max-w-xl text-brand-100 text-sm md:text-base">
            Create a secure account, upload HDFC Bank statement files, and generate fully reconciled financial charts and spreadsheets in seconds.
          </p>
          <Link
            to="/register"
            className="px-8 py-4 bg-white hover:bg-slate-100 text-brand-600 font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 group"
          >
            Create Your Account
            <ArrowRight className="h-4 w-4 text-brand-600 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Standard Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-white/5 py-12 bg-white dark:bg-darkbg-100 text-xs text-slate-500 dark:text-slate-400 text-center flex flex-col gap-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
          <span className="font-extrabold text-slate-800 dark:text-white">CORREM BANK STATEMENT ANALYZER</span>
          <div className="flex flex-wrap justify-center gap-6">
            <span>FastAPI &bull; React &bull; Tailwind &bull; Recharts &bull; Tesseract OCR</span>
          </div>
          <span>&copy; 2026 Correm. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}

// Collapsible FAQ Component
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-white/5 rounded-xl bg-white dark:bg-white/5 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex justify-between items-center text-left font-semibold text-slate-800 dark:text-white transition-colors hover:bg-slate-50 dark:hover:bg-white/5 text-sm md:text-base"
      >
        <div className="flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-brand-500" />
          {question}
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

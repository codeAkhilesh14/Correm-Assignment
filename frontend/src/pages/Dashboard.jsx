import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { CardSkeleton } from "../components/LoadingSkeleton";
import toast from "react-hot-toast";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Calendar,
  Wallet,
  ArrowRightLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Download,
  FileSpreadsheet
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsing, setParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch statements list
  const fetchStatements = async () => {
    try {
      const response = await api.get("/statements");
      setStatements(response.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load statements.");
    } finally {
      setLoading(false);
    }
  };

  // Download Excel report for a statement
  const downloadExcel = async (id, fileName, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const toastId = toast.loading("Generating Excel report...");
    try {
      const token = localStorage.getItem("correm_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/export/excel/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HDFC_Report_${(fileName || id).replace(/\.pdf$/i, "")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Excel report downloaded!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate Excel report.", { id: toastId });
    }
  };

  useEffect(() => {
    fetchStatements();
  }, []);

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Process the uploaded file
  const handleFile = async (file) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Invalid file type. Only PDF statements are allowed.");
      return;
    }

    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_SIZE) {
      toast.error("File size exceeds 20 MB limit.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadProgress(0);
    setParsing(false);

    try {
      // Post upload with progress monitoring
      const response = await api.post("/statements/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          if (percentCompleted === 100) {
            setParsing(true); // Switch loading state to "parsing..."
          }
        },
      });

      const statementId = response.data?.statement?.id;
      const fileName = response.data?.statement?.fileName;
      toast.success("Statement parsed! Downloading Excel report...");
      fetchStatements();

      // Auto-download the Excel report
      if (statementId) {
        await downloadExcel(statementId, fileName);
      }
    } catch (err) {
      console.error(err);
      const detailMsg = err.response?.data?.detail || "Processing failed. Ensure it is a valid HDFC statement.";
      toast.error(detailMsg, { duration: 5000 });
    } finally {
      setUploading(false);
      setParsing(false);
      setUploadProgress(0);
    }
  };

  // Delete a statement
  const handleDelete = async (id, e) => {
    e.preventDefault(); // Stop navigation click
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this statement and its transactions?")) {
      return;
    }

    try {
      await api.delete(`/statements/${id}`);
      toast.success("Statement deleted successfully.");
      setStatements((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete statement.");
    }
  };

  // Calculate high-level summary cards
  const totalBalance = statements.length > 0 ? statements[0].accountDetails.closingBalance : 0.0;
  const totalParsedCount = statements.length;
  
  // Sum up credit and debit amounts across all parsed statements
  const aggregateCredits = statements.reduce((sum, s) => sum + (s.analytics.totalCredits || 0.0), 0.0);
  const aggregateDebits = statements.reduce((sum, s) => sum + (s.analytics.totalDebits || 0.0), 0.0);

  return (
    <div className="flex flex-col gap-10">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="text-brand-500 dark:text-brand-400">{user?.name}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Monitor accounts, audit transactions, and view deep financial trends.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => <CardSkeleton key={idx} />)
        ) : (
          <>
            {/* KPI 1 */}
            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Current Balance</span>
                <h3 className="text-2xl font-black mt-2 text-slate-800 dark:text-white">
                  ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <span className="text-[10px] text-slate-400 mt-1 block">From latest parsed statement</span>
              </div>
              <div className="p-3 bg-brand-500/10 dark:bg-brand-400/10 text-brand-500 dark:text-brand-400 rounded-xl">
                <Wallet className="h-6 w-6" />
              </div>
            </div>

            {/* KPI 2 */}
            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Aggregated Credits</span>
                <h3 className="text-2xl font-black mt-2 text-emerald-500">
                  ₹{aggregateCredits.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <span className="text-[10px] text-emerald-500/80 mt-1 block">&bull; Total Inflow</span>
              </div>
              <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-500 rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>

            {/* KPI 3 */}
            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Aggregated Debits</span>
                <h3 className="text-2xl font-black mt-2 text-red-500">
                  ₹{aggregateDebits.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <span className="text-[10px] text-red-500/80 mt-1 block">&bull; Total Outflow</span>
              </div>
              <div className="p-3 bg-red-500/10 dark:bg-red-500/5 text-red-500 rounded-xl">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>

            {/* KPI 4 */}
            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Statements Count</span>
                <h3 className="text-2xl font-black mt-2 text-slate-800 dark:text-white">
                  {totalParsedCount}
                </h3>
                <span className="text-[10px] text-slate-400 mt-1 block">Successfully audited files</span>
              </div>
              <div className="p-3 bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-500 dark:text-indigo-400 rounded-xl">
                <ArrowRightLeft className="h-6 w-6" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Grid: Upload & Statements History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Uploader */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-1 text-slate-800 dark:text-white">Upload New Statement</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Drag and drop HDFC bank statements. Max file size: 20MB.</p>

            <form
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-brand-500 bg-brand-500/5 dark:bg-brand-500/10"
                  : "border-slate-300 dark:border-white/10 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={uploading}
              />
              
              <AnimatePresence mode="wait">
                {uploading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4 w-full px-4"
                    onClick={(e) => e.stopPropagation()} // Stop trigger
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 dark:text-brand-400">
                      <UploadCloud className="h-6 w-6 animate-bounce" />
                    </div>
                    
                    <div className="w-full flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{parsing ? "OCR & Analyzing Layout..." : "Uploading PDF..."}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-brand-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {parsing ? "Running layout classification & balance check. Do not close." : "Sending data packet to server."}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-300">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">Drag & drop files here</span>
                      <span className="text-xs text-slate-400">or click to browse from device</span>
                    </div>
                    <span className="text-[9px] bg-slate-100 dark:bg-white/5 px-2 py-1 border border-slate-200/50 dark:border-white/5 rounded text-slate-400">
                      PDF ONLY (MAX 20MB)
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* Right Column: Statement History */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Statements</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Click on any statement to view transactions and detailed analytics.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex-grow flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, rIdx) => (
                  <div key={rIdx} className="h-20 w-full bg-slate-200/50 dark:bg-white/5 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : statements.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-white/2">
                <FileText className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">No statements processed yet</span>
                <p className="text-xs text-slate-400 mt-1 max-w-[250px]">Upload HDFC PDF statement to check balances and category insights.</p>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto max-h-[350px] pr-2 space-y-4">
                {statements.map((stmt) => {
                  const details = stmt.accountDetails || {};
                  const isSuccess = details.reconciliationStatus === "SUCCESS";
                  
                  return (
                    <Link
                      key={stmt.id}
                      to={`/statements/${stmt.id}`}
                      className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 dark:bg-white/3 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 border border-slate-100 dark:border-white/5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 shadow-sm text-brand-500">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[200px] sm:max-w-[250px] group-hover:text-brand-500 dark:group-hover:text-brand-400">
                            {stmt.fileName}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {details.startDate || "N/A"} &mdash; {details.endDate || "N/A"}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 capitalize font-medium">
                            A/c: {details.accountNumber || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end border-t border-slate-200/50 dark:border-white/5 pt-2 sm:pt-0 sm:border-0">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-slate-800 dark:text-white">
                            ₹{(details.closingBalance || 0.0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            {isSuccess ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span
                              className={`text-[9px] font-bold ${
                                isSuccess ? "text-emerald-500" : "text-red-500"
                              }`}
                            >
                              {isSuccess ? "Reconciled" : "Discrepancy"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => downloadExcel(stmt.id, stmt.fileName, e)}
                            className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all"
                            title="Download Excel Report"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(stmt.id, e)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                            title="Delete Statement"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform hidden sm:block" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

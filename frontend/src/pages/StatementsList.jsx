import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { CardSkeleton } from "../components/LoadingSkeleton";
import toast from "react-hot-toast";
import {
  FileText,
  Trash2,
  Calendar,
  ChevronRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Download
} from "lucide-react";

export default function StatementsList() {
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStatements = async () => {
    try {
      const response = await api.get("/statements");
      setStatements(response.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load statement history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this statement? This action cannot be undone.")) {
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

  const filteredStatements = statements.filter((stmt) => {
    const filename = stmt.fileName.toLowerCase();
    const holder = (stmt.accountDetails?.accountHolderName || "").toLowerCase();
    const query = search.toLowerCase();
    return filename.includes(query) || holder.includes(query);
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Audit History</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">View and manage all processed HDFC statement audits.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search statement name or holder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl outline-none focus:border-brand-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => <CardSkeleton key={idx} />)}
        </div>
      ) : filteredStatements.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-slate-200 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-white/2 backdrop-blur-sm">
          <FileText className="h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No statements found</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            {search ? "No matches found. Try modifying your search." : "Navigate to your Dashboard to upload and parse your first bank statement PDF."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStatements.map((stmt) => {
            const details = stmt.accountDetails || {};
            const isSuccess = details.reconciliationStatus === "SUCCESS";
            const dateStr = stmt.createdAt ? new Date(stmt.createdAt).toLocaleDateString() : "N/A";
            
            return (
              <div
                key={stmt.id}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-slate-100 dark:border-white/5 relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[200px]" title={stmt.fileName}>
                          {stmt.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Uploaded on {dateStr}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => handleDelete(stmt.id, e)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      title="Delete Statement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Account Number</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">{details.accountNumber || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Closing Balance</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">
                        ₹{(details.closingBalance || 0.0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Period</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {details.startDate || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Reconciliation</span>
                      <div className="flex items-center gap-1 font-bold">
                        {isSuccess ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Success</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-red-500">Mismatches</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center gap-2">
                  <button
                    onClick={(e) => downloadExcel(stmt.id, stmt.fileName, e)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Excel
                  </button>
                  <Link
                    to={`/statements/${stmt.id}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-brand-500 text-slate-800 hover:text-white dark:bg-white/5 dark:hover:bg-brand-500 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    View Analysis
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

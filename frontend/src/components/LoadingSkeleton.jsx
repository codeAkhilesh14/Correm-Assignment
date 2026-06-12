import React from "react";

export const CardSkeleton = () => {
  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col gap-3">
      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-white/10 animate-pulse"></div>
      <div className="h-8 w-2/3 rounded bg-slate-300 dark:bg-white/20 animate-pulse"></div>
      <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-white/10 animate-pulse"></div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="w-full border border-slate-200/50 dark:border-white/5 rounded-2xl overflow-hidden bg-white/50 dark:bg-darkbg-100/50 backdrop-blur-sm">
      <div className="h-12 bg-slate-100 dark:bg-white/5 border-b border-slate-200/50 dark:border-white/5 flex items-center px-6 gap-4">
        {Array.from({ length: cols }).map((_, idx) => (
          <div
            key={idx}
            className="h-4 rounded bg-slate-200 dark:bg-white/10 animate-pulse"
            style={{ width: `${100 / cols}%` }}
          ></div>
        ))}
      </div>
      <div className="flex flex-col">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="h-16 border-b border-slate-100 dark:border-white/5 flex items-center px-6 gap-4"
          >
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-3 rounded bg-slate-200/50 dark:bg-white/5 animate-pulse"
                style={{ width: `${100 / cols}%` }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="glass-card p-6 rounded-2xl h-[350px] flex flex-col justify-between">
      <div className="h-5 w-1/4 rounded bg-slate-200 dark:bg-white/10 animate-pulse mb-6"></div>
      <div className="flex-grow flex items-end gap-3 pb-4">
        {Array.from({ length: 12 }).map((_, idx) => {
          const randomHeight = Math.floor(Math.random() * 80) + 10;
          return (
            <div
              key={idx}
              className="flex-grow rounded-t bg-slate-200 dark:bg-white/10 animate-pulse"
              style={{ height: `${randomHeight}%` }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

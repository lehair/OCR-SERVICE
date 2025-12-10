// src/pages/LoginStats.jsx
import React, { useEffect, useState } from "react";

export default function LoginStats() {
  const [stats, setStats] = useState({
    total_users: 0,
    logged_in_users: 0,
    total_logins: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoadingStats(true);
        setErrorStats("");

        const res = await fetch("http://localhost:8010/auth/stats/login");
        if (!res.ok) {
          throw new Error("Lỗi khi gọi API stats");
        }
        const data = await res.json();
        setStats({
          total_users: data.total_users ?? 0,
          logged_in_users: data.logged_in_users ?? 0,
          total_logins: data.total_logins ?? 0,
        });
      } catch (err) {
        console.error(err);
        setErrorStats("Không lấy được thống kê đăng nhập");
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span>Dashboard · Login Statistics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Thống kê đăng nhập hệ thống
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Xem nhanh số lượng tài khoản, số người đã từng đăng nhập
            và tổng số lượt đăng nhập.
          </p>
        </div>
      </div>

      {errorStats && (
        <p className="mb-4 text-xs text-red-500">
          ⚠ {errorStats} (kiểm tra lại gateway hoặc auth_service)
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Tổng tài khoản
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {loadingStats ? "…" : stats.total_users}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Số user đã được đăng ký trong hệ thống.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Đã từng đăng nhập
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {loadingStats ? "…" : stats.logged_in_users}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            User có ít nhất 1 lần đăng nhập (login_count &gt; 0).
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Tổng lượt đăng nhập
          </p>
          <p className="mt-1 text-2xl font-bold text-indigo-600">
            {loadingStats ? "…" : stats.total_logins}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Mỗi lần user đăng nhập thành công sẽ tăng 1 lượt.
          </p>
        </div>
      </div>
    </div>
  );
}

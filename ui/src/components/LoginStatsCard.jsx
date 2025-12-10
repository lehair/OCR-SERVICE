import React, { useEffect, useState } from "react";

export default function LoginStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("http://localhost:8010/auth/stats/login");
        if (!res.ok) throw new Error("Lỗi gọi API");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Không tải được thống kê đăng nhập");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6">
        <p className="text-sm text-slate-600">Đang tải thống kê đăng nhập...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-red-100 p-6">
        <p className="text-sm text-red-500">{error || "Không có dữ liệu"}</p>
      </div>
    );
  }

  const { total_users, logged_in_users, total_logins } = stats;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Auth Dashboard · Thống kê đăng nhập</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Thống kê tài khoản & lượt đăng nhập
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Xem nhanh số lượng user đã đăng ký, số người từng đăng nhập và tổng
            số lượt đăng nhập hệ thống.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Tổng tài khoản */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
          <div className="text-xs font-semibold text-slate-500 uppercase">
            Tổng tài khoản
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {total_users}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Số user đã được đăng ký trong hệ thống.
          </p>
        </div>

        {/* Đã từng đăng nhập */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
          <div className="text-xs font-semibold text-emerald-700 uppercase">
            Đã từng đăng nhập
          </div>
          <div className="mt-2 text-3xl font-bold text-emerald-800">
            {logged_in_users}
          </div>
          <p className="mt-1 text-xs text-emerald-700/80">
            User có ít nhất 1 lần đăng nhập (login_count &gt; 0).
          </p>
        </div>

        {/* Tổng lượt đăng nhập */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
          <div className="text-xs font-semibold text-indigo-700 uppercase">
            Tổng lượt đăng nhập
          </div>
          <div className="mt-2 text-3xl font-bold text-indigo-800">
            {total_logins}
          </div>
          <p className="mt-1 text-xs text-indigo-700/80">
            Mỗi lần user đăng nhập thành công sẽ tăng 1 lượt.
          </p>
        </div>
      </div>
    </div>
  );
}

// src/components/LoginStats.jsx
import React, { useEffect, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

// Đăng ký ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function LoginStats() {
  const [loginStats, setLoginStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy User ID để gọi API
  const getUserID = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored).user_id : 1;
    } catch { return 1; }
  };
  const USER_ID = getUserID();

  useEffect(() => {
    async function fetchStats() {
      try {
        // Gọi API lấy số liệu
        const res = await fetch("http://localhost:8010/auth/stats/login");
        // Nếu muốn lấy thêm history thì gọi thêm ở đây, nhưng tạm thời giữ Auth cho gọn
        
        if (!res.ok) throw new Error("Lỗi API");
        const data = await res.json();
        setLoginStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-4 text-sm text-slate-500 animate-pulse">Đang tải số liệu...</div>;
  }

  if (!loginStats) return null; // Nếu lỗi thì ẩn luôn component đỡ rác giao diện

  // --- Dữ liệu biểu đồ tròn ---
  const neverLoggedIn = (loginStats.total_users || 0) - (loginStats.logged_in_users || 0);
  const chartData = {
    labels: ["Đã Active", "Chưa login"],
    datasets: [{
      data: [loginStats.logged_in_users, Math.max(neverLoggedIn, 0)],
      backgroundColor: ["#4f46e5", "#e5e7eb"], // Tím / Xám
      borderWidth: 0,
    }],
  };

  return (
    <div className="space-y-6">
      {/* Phần 1: 3 Card số liệu (Hiển thị hàng ngang) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng User</p>
          <div className="flex items-end justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{loginStats.total_users}</span>
            <span className="text-xl">👥</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đã Active</p>
          <div className="flex items-end justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-600">{loginStats.logged_in_users}</span>
            <span className="text-xl">✅</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng Login</p>
          <div className="flex items-end justify-between mt-1">
            <span className="text-2xl font-bold text-indigo-600">{loginStats.total_logins}</span>
            <span className="text-xl">🚀</span>
          </div>
        </div>
      </div>

      {/* Phần 2: Biểu đồ (Tùy chọn hiển thị) */}
      <div className="p-4 rounded-2xl border border-slate-100 bg-white/60 shadow-sm flex flex-col items-center">
        <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase">Tỷ lệ kích hoạt tài khoản</h3>
        <div className="h-40 w-full flex justify-center">
          <Doughnut 
            data={chartData} 
            options={{ 
              maintainAspectRatio: false,
              plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } } 
            }} 
          />
        </div>
      </div>
    </div>
  );
}
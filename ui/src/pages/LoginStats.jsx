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

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function LoginStats() {
  const [loginStats, setLoginStats] = useState(null);
  const [docsStats, setDocsStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- HÀM LẤY USER ID TỪ LOCAL STORAGE ---
  const getUserID = () => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        return userData.user_id || userData.id;
      } catch (e) {
        return 1;
      }
    }
    return 1; // Default ID demo
  };

  const USER_ID = getUserID();

  useEffect(() => {
    async function fetchAll() {
      try {
        // Gọi song song 2 API qua Gateway (Port 8010)
        const token = localStorage.getItem("access_token");
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        const [loginRes, docsRes] = await Promise.all([
          fetch("http://localhost:8010/auth/stats/login", { headers: authHeaders }),
          fetch(`http://localhost:8010/history/stats/${USER_ID}`, { headers: authHeaders }),
        ]);

        // Nếu Auth chết thì loginRes sẽ lỗi, ta có thể handle riêng nếu muốn
        if (!loginRes.ok) console.warn("Lỗi tải thống kê login");
        if (!docsRes.ok) console.warn("Lỗi tải thống kê history");

        // Dùng fallback data rỗng nếu API lỗi để không sập trang
        const loginData = loginRes.ok 
          ? await loginRes.json() 
          : { total_users: 0, logged_in_users: 0, total_logins: 0 };
          
        const docsData = docsRes.ok 
          ? await docsRes.json() 
          : { total_files: 0, by_type: [], by_language: [] };

        setLoginStats(loginData);
        setDocsStats(docsData);
      } catch (err) {
        console.error(err);
        setError("Không tải được dữ liệu Dashboard (Kiểm tra Gateway)");
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [USER_ID]);

  if (loading) {
    return (
      <div className="bg-white/90 rounded-3xl shadow p-6 text-slate-600 animate-pulse flex flex-col gap-4">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-slate-100 rounded"></div>
            <div className="h-24 bg-slate-100 rounded"></div>
            <div className="h-24 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/90 rounded-3xl shadow p-6 text-red-500 border border-red-100">
        ⚠️ {error}
      </div>
    );
  }

  // ----- 1. CHUẨN BỊ DATA: LOGIN STATS -----
  const neverLoggedIn =
    (loginStats?.total_users || 0) - (loginStats?.logged_in_users || 0);

  const loginDoughnutData = {
    labels: ["Đã từng đăng nhập", "Chưa từng đăng nhập"],
    datasets: [
      {
        data: [loginStats.logged_in_users, Math.max(neverLoggedIn, 0)],
        backgroundColor: ["#4f46e5", "#e5e7eb"],
        borderWidth: 1,
      },
    ],
  };

  // ----- 2. CHUẨN BỊ DATA: DOCS STATS -----
  
  // Map Document Type
  const types = (docsStats?.by_type || []).map((x) => {
      const map = { "CCCD": "CCCD", "THE_SV": "Thẻ SV", "OTHER": "Khác" };
      return map[x.type] || x.type;
  });
  const typeCounts = (docsStats?.by_type || []).map((x) => x.count);

  const docsByTypeData = {
    labels: types,
    datasets: [
      {
        label: "Số lượng",
        data: typeCounts,
        backgroundColor: ["#6366f1", "#22c55e", "#f97316", "#e11d48"],
        borderRadius: 4,
      },
    ],
  };

  // Map Language
  const langs = (docsStats?.by_language || []).map((x) => {
      const map = { "vi": "Tiếng Việt", "en": "Tiếng Anh" };
      return map[x.language] || x.language;
  });
  const langCounts = (docsStats?.by_language || []).map((x) => x.count);

  const docsByLangData = {
    labels: langs,
    datasets: [
      {
        data: langCounts,
        backgroundColor: ["#0ea5e9", "#a855f7", "#ec4899"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Dashboard · Thống kê hệ thống</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Thống kê người dùng & tài liệu
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tổng hợp dữ liệu từ <b>Auth Service</b> (MySQL) và <b>History Service</b> (MySQL).
          </p>
        </div>
      </div>

      {/* Cards số liệu tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase">
            Tổng tài khoản
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loginStats.total_users}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            User trong hệ thống
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase">
            Tổng lượt đăng nhập
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loginStats.total_logins}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tổng traffic người dùng
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase">
            File của bạn (ID #{USER_ID})
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {docsStats.total_files}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Bản ghi trong lịch sử
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut login */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 flex flex-col">
          <div className="text-sm font-semibold text-slate-700 mb-3">
            Tỷ lệ user Active
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <Doughnut
              data={loginDoughnutData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                },
              }}
            />
          </div>
        </div>

        {/* Bar loại document */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 flex flex-col">
          <div className="text-sm font-semibold text-slate-700 mb-3">
            Phân loại tài liệu cá nhân
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
             {/* Check xem có dữ liệu không để tránh biểu đồ trống */}
            {typeCounts.length > 0 && !typeCounts.every(v => v === 0) ? (
                <Bar
                data={docsByTypeData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                    },
                    },
                }}
                />
            ) : (
                <div className="text-sm text-slate-400 italic">Chưa có dữ liệu phân loại</div>
            )}
          </div>
        </div>

        {/* Donut ngôn ngữ */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 flex flex-col">
          <div className="text-sm font-semibold text-slate-700 mb-3">
            Ngôn ngữ tài liệu
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            {langCounts.length > 0 && !langCounts.every(v => v === 0) ? (
                <Doughnut
                data={docsByLangData}
                options={{
                    maintainAspectRatio: false,
                    plugins: {
                    legend: { position: "bottom" },
                    },
                }}
                />
            ) : (
                <div className="text-sm text-slate-400 italic">Chưa có dữ liệu ngôn ngữ</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
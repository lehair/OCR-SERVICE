// src/pages/LoginStats.jsx
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

// Đăng ký các thành phần cần dùng của ChartJS
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

  useEffect(() => {
    async function fetchAll() {
      try {
        const [loginRes, docsRes] = await Promise.all([
          fetch("http://localhost:8010/auth/stats/login"),
          fetch("http://localhost:8010/auth/stats/docs"),
        ]);

        if (!loginRes.ok) throw new Error("Lỗi login stats");
        if (!docsRes.ok) throw new Error("Lỗi docs stats");

        const loginData = await loginRes.json();
        const docsData = await docsRes.json();

        setLoginStats(loginData);
        setDocsStats(docsData);
      } catch (err) {
        console.error(err);
        setError("Không tải được dữ liệu Dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/90 rounded-3xl shadow p-6 text-slate-600">
        Đang tải dữ liệu Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/90 rounded-3xl shadow p-6 text-red-500">
        {error}
      </div>
    );
  }

  // ----- Chuẩn bị dữ liệu cho biểu đồ -----

  // Login stats
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

  // Docs by type (CCCD / Thẻ SV / Đề cương)
  const types = (docsStats?.by_type || []).map((x) => x.doc_type);
  const typeCounts = (docsStats?.by_type || []).map((x) => x.count);

  const docsByTypeData = {
    labels: types,
    datasets: [
      {
        label: "Số document theo loại",
        data: typeCounts,
        backgroundColor: ["#6366f1", "#22c55e", "#f97316"],
      },
    ],
  };

  // Docs by language (vi / en)
  const langs = (docsStats?.by_language || []).map((x) => x.language);
  const langCounts = (docsStats?.by_language || []).map((x) => x.count);

  const docsByLangData = {
    labels: langs,
    datasets: [
      {
        data: langCounts,
        backgroundColor: ["#0ea5e9", "#a855f7"],
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
            Xem nhanh số lượng tài khoản, lượt đăng nhập và phân bố loại tài
            liệu (Căn cước công dân, Thẻ sinh viên, Đề cương) theo ngôn ngữ.
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
            Số user đã đăng ký trong hệ thống
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
            Đếm theo trường <code>login_count</code>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase">
            Tổng document
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {docsStats.total_docs}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Số bản ghi trong bảng <code>documents</code>
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut login */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 flex flex-col">
          <div className="text-sm font-semibold text-slate-700 mb-3">
            Tỷ lệ user đã từng đăng nhập
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Doughnut
              data={loginDoughnutData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Bar loại document */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 flex flex-col">
          <div className="text-sm font-semibold text-slate-700 mb-3">
            Phân bố theo loại document
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Bar
              data={docsByTypeData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Donut ngôn ngữ */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 flex flex-col">
          <div className="text-sm font-semibold text-slate-700 mb-3">
            Phân bố theo ngôn ngữ
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Doughnut
              data={docsByLangData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

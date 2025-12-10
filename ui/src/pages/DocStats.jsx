import React, { useEffect, useState } from "react";

export default function DocStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("http://localhost:8010/auth/stats/docs");
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Không tải được thống kê tài liệu");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/90 rounded-3xl shadow p-6 text-sm text-slate-600">
        Đang tải thống kê...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/90 rounded-3xl shadow p-6 text-sm text-red-500">
        {error}
      </div>
    );
  }

  const typeMap = {
    can_cuoc_cong_dan: "Căn cước công dân",
    the_sinh_vien: "Thẻ sinh viên",
    de_cuong: "Đề cương",
  };

  const langMap = {
    vi: "Tiếng Việt",
    en: "Tiếng Anh",
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        📊 Dashboard thống kê tài liệu demo
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        Thống kê số lượng mẫu tài liệu theo <b>loại văn bản</b> và{" "}
        <b>ngôn ngữ</b>, sử dụng dữ liệu fake (~100 bản ghi) trong bảng{" "}
        <code>documents</code>.
      </p>

      {/* Cards tổng quan */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase">
            Tổng số mẫu
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-1">
            {stats.total_docs}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tổng bản ghi trong bảng <code>documents</code>.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
          <div className="text-xs font-semibold text-emerald-600 uppercase">
            Theo loại tài liệu
          </div>
          <ul className="mt-2 text-sm text-slate-700 space-y-1">
            {Object.entries(stats.by_type).map(([k, v]) => (
              <li key={k}>
                <span className="font-medium">{typeMap[k] || k}:</span>{" "}
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
          <div className="text-xs font-semibold text-indigo-600 uppercase">
            Theo ngôn ngữ
          </div>
          <ul className="mt-2 text-sm text-slate-700 space-y-1">
            {Object.entries(stats.by_language).map(([k, v]) => (
              <li key={k}>
                <span className="font-medium">{langMap[k] || k}:</span>{" "}
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        * Có thể mở rộng dashboard này để thống kê thêm: số lần OCR, số lần tóm
        tắt, số lần dịch, v.v. theo yêu cầu bài tập lớn.
      </p>
    </div>
  );
}

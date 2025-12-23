import React, { useEffect, useState } from "react";

export default function DocStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- HÀM LẤY USER ID TỪ LOCAL STORAGE ---
  const getUserID = () => {
    // 1. Thử lấy từ localStorage (nơi lưu info lúc đăng nhập)
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        // Trả về user_id thật nếu có
        return userData.user_id || userData.id; 
      } catch (e) {
        console.warn("Lỗi đọc user từ localStorage, dùng ID mặc định = 1");
      }
    }
    // 2. Nếu chưa đăng nhập, dùng ID demo = 1 để test dashboard
    return 1;
  };

  const USER_ID = getUserID();

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        // 👇 GỌI QUA GATEWAY (PORT 8010) -> HISTORY SERVICE
        const token = localStorage.getItem("access_token");
        const res = await fetch(`http://localhost:8010/history/stats/${USER_ID}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        if (!res.ok) {
          // Xử lý nếu user chưa có lịch sử nào (API có thể trả 404 hoặc rỗng)
          if (res.status === 404) {
             setStats({ total_files: 0, by_type: [], by_language: [] });
             return;
          }
          throw new Error("Không thể kết nối đến History Service");
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Lỗi tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    }

    if (USER_ID) {
      fetchStats();
    }
  }, [USER_ID]);

  // --- MÀN HÌNH LOADING ---
  if (loading) {
    return (
      <div className="bg-white/90 rounded-3xl shadow p-6 text-sm text-slate-600 animate-pulse flex flex-col gap-2">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-20 bg-slate-100 rounded w-full"></div>
        <div className="text-center mt-2">Đang tải dữ liệu từ History Service...</div>
      </div>
    );
  }

  // --- MÀN HÌNH LỖI ---
  if (error) {
    return (
      <div className="bg-white/90 rounded-3xl shadow p-6 text-sm text-red-500 border border-red-100">
        <p className="font-bold">⚠️ {error}</p>
        <p className="mt-1 text-xs text-slate-500">
          Hãy đảm bảo bạn đã chạy lệnh: <code>docker-compose up -d gateway history_service</code>
        </p>
      </div>
    );
  }

  // --- MAP TÊN HIỂN THỊ ---
  const langMap = {
    vi: "Tiếng Việt 🇻🇳",
    en: "Tiếng Anh 🇺🇸",
  };

  const typeMap = {
    "CCCD": "Căn cước công dân",
    "THE_SV": "Thẻ sinh viên",
    "DE_CUONG": "Đề cương",
    "OTHER": "Tài liệu khác"
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        📊 Dashboard Cá Nhân
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        Thống kê hoạt động của User ID: <b>#{USER_ID}</b> (Dữ liệu thực từ History Service).
      </p>

      {/* --- GRID 3 CỘT --- */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        
        {/* CARD 1: TỔNG SỐ FILE */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">
              Tổng file đã xử lý
            </div>
            {/* Field chuẩn: total_files */}
            <div className="text-4xl font-bold text-slate-900 mt-2">
              {stats?.total_files || 0}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Lưu trong bảng <code>records</code>
          </p>
        </div>

        {/* CARD 2: THEO LOẠI TÀI LIỆU */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
          <div className="text-xs font-semibold text-emerald-600 uppercase mb-3">
            Phân loại tài liệu
          </div>
          <ul className="text-sm text-slate-700 space-y-2">
            {stats?.by_type && stats.by_type.length > 0 ? (
              stats.by_type.map((item, index) => (
                <li key={index} className="flex justify-between items-center border-b border-emerald-100/50 pb-1 last:border-0">
                  <span className="font-medium text-slate-600">
                    {typeMap[item.type] || item.type}
                  </span>
                  <span className="font-bold bg-white px-2 py-0.5 rounded-full text-emerald-600 text-xs shadow-sm">
                    {item.count}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic text-xs">Chưa có dữ liệu</li>
            )}
          </ul>
        </div>

        {/* CARD 3: THEO NGÔN NGỮ */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
          <div className="text-xs font-semibold text-indigo-600 uppercase mb-3">
            Ngôn ngữ phát hiện
          </div>
          <ul className="text-sm text-slate-700 space-y-2">
            {stats?.by_language && stats.by_language.length > 0 ? (
              stats.by_language.map((item, index) => (
                <li key={index} className="flex justify-between items-center border-b border-indigo-100/50 pb-1 last:border-0">
                  <span className="font-medium text-slate-600">
                    {langMap[item.language] || item.language}
                  </span>
                  <span className="font-bold bg-white px-2 py-0.5 rounded-full text-indigo-600 text-xs shadow-sm">
                    {item.count}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic text-xs">Chưa có dữ liệu</li>
            )}
          </ul>
        </div>
      </div>

      <div className="text-xs text-slate-400 text-center border-t border-slate-100 pt-4">
        * Dữ liệu được cập nhật realtime mỗi khi bạn thực hiện OCR, Dịch thuật hoặc Tóm tắt.
      </div>
    </div>
  );
}
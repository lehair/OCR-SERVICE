import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

// Component Icon nhỏ gọn
function Icon({ children }) {
  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 text-lg shadow-sm group-hover:bg-white group-hover:text-indigo-600 transition-colors">
      {children}
    </span>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Lấy thông tin user an toàn từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Lỗi parse user data", e);
      }
    }
  }, []);

  function handleAuthClick() {
    if (user) {
      // Logout: Xóa hết thông tin
      localStorage.removeItem("user");
      localStorage.removeItem("access_token"); // Nếu có lưu token
      setUser(null);
      navigate("/login");
    } else {
      navigate("/login");
    }
  }

  // Style chung cho các link
  const linkClass = ({ isActive }) =>
    [
      "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium",
      isActive
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
        : "text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm",
    ].join(" ");

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-5 sticky top-6 h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="mb-6 flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
          OS
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
            OCR Suite
          </h2>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Microservices App
          </p>
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
        
        {/* Nhóm 1: Chính */}
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">
          Chức năng chính
        </div>
        
        <NavLink to="/" className={linkClass} end>
          <Icon>🏠</Icon> <span className="text-sm">Trang chủ</span>
        </NavLink>

        <NavLink to="/ocr" className={linkClass}>
          <Icon>🔍</Icon> <span className="text-sm">OCR Tài liệu</span>
        </NavLink>

        <NavLink to="/preprocess" className={linkClass}>
          <Icon>✨</Icon> <span className="text-sm">Xử lý ảnh</span>
        </NavLink>

        <NavLink to="/translate" className={linkClass}>
          <Icon>🌐</Icon> <span className="text-sm">Dịch thuật</span>
        </NavLink>

        <NavLink to="/summarizer" className={linkClass}>
          <Icon>🗒️</Icon> <span className="text-sm">Tóm tắt văn bản</span>
        </NavLink>

        <NavLink to="/classifier" className={linkClass}>
          <Icon>🧩</Icon> <span className="text-sm">Phân loại</span>
        </NavLink>

        {/* Nhóm 2: Dữ liệu & Thống kê (MỚI) */}
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-6">
          Dữ liệu & Báo cáo
        </div>

        <NavLink to="/history" className={linkClass}>
          <Icon>📜</Icon> <span className="text-sm">Lịch sử hoạt động</span>
        </NavLink>

{user?.is_admin && (
  <>
    <NavLink to="/doc-stats" className={linkClass}>
      <Icon>📈</Icon> <span className="text-sm">Thống kê Tài liệu</span>
    </NavLink>

    <NavLink to="/login-stats" className={linkClass}>
      <Icon>📊</Icon>{" "}
      <span className="text-sm">Thống kê Hệ thống</span>
    </NavLink>
  </>
)}
      </nav>

      {/* --- FOOTER (User Info) --- */}
      <div className="mt-4 border-t border-slate-100 pt-4">
        {user ? (
          <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {user.full_name || user.username}
                </p>
                <p className="text-xs text-slate-500 truncate">ID: #{user.user_id || user.id}</p>
              </div>
            </div>
          </div>
        ) : null}

        <button
          onClick={handleAuthClick}
          className={`w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition shadow-md flex items-center justify-center gap-2 ${
            user
              ? "bg-white text-red-500 border border-slate-200 hover:bg-red-50 hover:border-red-100"
              : "bg-slate-900 text-white hover:bg-black"
          }`}
        >
          {user ? (
            <>🔓 Đăng xuất</>
          ) : (
            <>🔐 Đăng nhập ngay</>
          )}
        </button>
      </div>
    </aside>
  );
}
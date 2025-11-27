import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Icon({ children }) {
  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 text-lg">
      {children}
    </span>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const user = localStorage.getItem("loggedInUser");

  function handleAuthClick() {
    if (user) {
      // logout
      localStorage.removeItem("loggedInUser");
      window.location.reload();
    } else {
      navigate("/login");
    }
  }

  const linkClass = ({ isActive }) =>
    [
      "group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150",
      "hover:bg-slate-50 hover:text-slate-900",
      isActive
        ? "bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold"
        : "text-slate-600 border border-transparent",
    ].join(" ");

  return (
    <aside className="w-64 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-100 p-5 sticky top-6 h-[80vh] flex flex-col">
      {/* Header / logo */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
          OS
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            OCR Suite
          </h2>
          <p className="text-xs text-slate-500">
            Nhận diện · Tóm tắt · Dịch · Preprocess
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
        <NavLink to="/" className={linkClass} end>
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <Icon>🏠</Icon>
                <span className="text-sm">Trang chủ</span>
              </div>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1" />
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/ocr" className={linkClass}>
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <Icon>🔍</Icon>
                <span className="text-sm">OCR</span>
              </div>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1" />
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/preprocess" className={linkClass}>
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <Icon>✨</Icon>
                <span className="text-sm">Làm nét ảnh</span>
              </div>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1" />
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/classifier" className={linkClass}>
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <Icon>🧩</Icon>
                <span className="text-sm">Phân loại</span>
              </div>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1" />
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/summarizer" className={linkClass}>
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <Icon>🗒️</Icon>
                <span className="text-sm">Tóm tắt</span>
              </div>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1" />
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/translate" className={linkClass}>
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <Icon>🌐</Icon>
                <span className="text-sm">Dịch</span>
              </div>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1" />
              )}
            </>
          )}
        </NavLink>
      </nav>

      {/* Auth & user info */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <button
          onClick={handleAuthClick}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-black transition shadow-md flex items-center justify-center gap-2"
        >
          {user ? "🔓 Đăng xuất" : "🔐 Đăng nhập"}
        </button>
        {user && (
          <p className="text-xs text-slate-500 mt-2">
            Đang đăng nhập:{" "}
            <span className="font-semibold text-slate-800">{user}</span>
          </p>
        )}
      </div>
    </aside>
  );
}

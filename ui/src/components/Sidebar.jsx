import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Icon({ children }) {
  return <span className="w-6 h-6 inline-block mr-2 align-middle">{children}</span>;
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
    "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-100 " + (isActive ? "bg-indigo-100 font-semibold" : "text-gray-700");

  return (
    <aside className="w-64 bg-white rounded-2xl shadow p-4 sticky top-8 h-[80vh]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-indigo-600">OCR Suite</h2>
        <p className="text-sm text-gray-500">Nhận diện · Tóm tắt · Dịch · Preprocess</p>
      </div>

      <nav className="space-y-1">
        <NavLink to="/" className={linkClass} end>
          <Icon>🏠</Icon> Trang chủ
        </NavLink>
        <NavLink to="/ocr" className={linkClass}>
          <Icon>🔍</Icon> OCR
        </NavLink>
        <NavLink to="/preprocess" className={linkClass}>
          <Icon>✨</Icon> Làm nét ảnh
        </NavLink>
        <NavLink to="/classifier" className={linkClass}>
          <Icon>🧩</Icon> Phân loại
        </NavLink>
        <NavLink to="/summarizer" className={linkClass}>
          <Icon>🗒️</Icon> Tóm tắt
        </NavLink>
        <NavLink to="/translate" className={linkClass}>
          <Icon>🌐</Icon> Dịch
        </NavLink>
      </nav>

      <div className="mt-6 border-t pt-4">
        <button onClick={handleAuthClick}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-black transition">
          {user ? "🔓 Đăng xuất" : "🔐 Đăng nhập"}
        </button>
        {user && <p className="text-sm text-gray-600 mt-2">Đang đăng nhập: <strong>{user}</strong></p>}
      </div>
    </aside>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  
  const [msg, setMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // Để hiện màu xanh nếu thành công
  const [loading, setLoading] = useState(false); // Chặn bấm nút nhiều lần

  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8010/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, full_name: fullname }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsSuccess(false);
        setMsg(data.detail || "Đăng ký thất bại");
      } else {
        // Đăng ký thành công
        setIsSuccess(true);
        setMsg("Đăng ký thành công! Đang chuyển hướng...");
        
        // Đợi 1.5 giây cho user đọc thông báo rồi mới chuyển trang
        setTimeout(() => {
          nav("/login");
        }, 1500);
      }
    } catch (err) {
      setIsSuccess(false);
      setMsg("Lỗi kết nối đến Gateway");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-500 text-white text-2xl shadow-md mb-3">
          ➕
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Tạo tài khoản mới
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Đăng ký để bắt đầu sử dụng OCR Dashboard và các dịch vụ xử lý tài liệu.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tên đăng nhập
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập..."
            required
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-400 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mật khẩu
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            type="password"
            required
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-400 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Họ tên (tuỳ chọn)
          </label>
          <input
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Nhập họ tên đầy đủ..."
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-400 disabled:bg-slate-50"
          />
        </div>

        {/* Thông báo lỗi / thành công */}
        {msg && (
          <div className={`text-sm rounded-xl px-3 py-2 border ${
            isSuccess 
              ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
              : "bg-red-50 border-red-100 text-red-500"
          }`}>
            {isSuccess ? "✅ " : "⚠️ "} {msg}
          </div>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Tạo tài khoản"}
          </button>
        </div>

        <div className="flex items-center justify-center text-xs text-slate-500 pt-1 gap-1">
          <span>Đã có tài khoản?</span>
          <button
            type="button"
            onClick={() => nav("/login")}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Đăng nhập
          </button>
        </div>
      </form>
    </div>
  );
}
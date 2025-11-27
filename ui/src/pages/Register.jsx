import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, full_name: fullname }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Lỗi" }));
        setMsg(err.detail || "Đăng ký thất bại");
        return;
      }
      const data = await res.json();
      alert("Đăng ký thành công: " + data.username);
      nav("/login");
    } catch (err) {
      setMsg("Lỗi kết nối");
      console.error(err);
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
          Đăng ký để bắt đầu sử dụng OCR Dashboard và các dịch vụ xử lý tài
          liệu.
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
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-400"
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
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Họ tên (tuỳ chọn)
          </label>
          <input
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Nhập họ tên đầy đủ (nếu có)..."
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-400"
          />
        </div>

        {msg && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {msg}
          </div>
        )}

        <div className="pt-1">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm
                       hover:bg-emerald-700 transition"
          >
            Tạo tài khoản
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

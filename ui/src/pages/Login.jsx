import React, { useState } from "react";
// Bỏ import useNavigate nếu không dùng ở chỗ khác
// import { useNavigate } from "react-router-dom"; 

export default function Login() {
  // const navigate = useNavigate(); // <--- KHÔNG DÙNG CÁI NÀY NỮA
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Gọi API Login
      const res = await fetch("http://localhost:8010/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Đăng nhập thất bại");
      }

      // 2. LƯU DỮ LIỆU VÀO LOCAL STORAGE
      // Quan trọng: Key phải là "user" để khớp với Sidebar
      localStorage.setItem("user", JSON.stringify(data));
      
      // Nếu có token riêng thì lưu thêm (tuỳ backend trả về)
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      // 3. 🔥 QUAN TRỌNG NHẤT: CHUYỂN TRANG BẰNG CÁCH RELOAD
      // Dùng window.location.href thay vì navigate()
      // Việc này giúp Sidebar chạy lại từ đầu và đọc được dữ liệu user vừa lưu
      window.location.href = "/"; 

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Đăng nhập</h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Tên đăng nhập</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Mật khẩu</label>
          <input
            type="password"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <a href="/register" className="text-indigo-600 font-semibold hover:underline">
          Đăng ký ngay
        </a>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register(){
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8001/auth/register", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ username, password, full_name: fullname })
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({detail:"Lỗi"}));
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
    <div className="bg-white rounded-2xl shadow p-6 max-w-md">
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">➕ Đăng ký</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Tên đăng nhập" className="w-full p-2 border rounded"/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mật khẩu" type="password" className="w-full p-2 border rounded"/>
        <input value={fullname} onChange={e=>setFullname(e.target.value)} placeholder="Họ tên (tuỳ chọn)" className="w-full p-2 border rounded"/>
        <div>
          <button className="px-3 py-2 bg-green-600 text-white rounded">Tạo tài khoản</button>
        </div>
        {msg && <p className="text-red-500">{msg}</p>}
      </form>
    </div>
  );
}
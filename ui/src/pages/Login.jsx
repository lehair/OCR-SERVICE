import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8001/auth/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({detail:"Sai thông tin"}));
        setMsg(err.detail || "Đăng nhập thất bại");
        return;
      }
      const data = await res.json();
      localStorage.setItem("loggedInUser", data.username);
      nav("/");
    } catch (err) {
      setMsg("Lỗi kết nối");
      console.error(err);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 max-w-md">
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">🔐 Đăng nhập</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Tên đăng nhập" className="w-full p-2 border rounded"/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mật khẩu" type="password" className="w-full p-2 border rounded"/>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-indigo-600 text-white rounded">Đăng nhập</button>
          <button type="button" onClick={()=>nav("/register")} className="px-3 py-2 bg-gray-200 rounded">Đăng ký</button>
        </div>
        {msg && <p className="text-red-500">{msg}</p>}
      </form>
    </div>
  );
}
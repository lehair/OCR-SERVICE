import React, { useState } from "react";

export default function Classifier() {
  const [text, setText] = useState(sessionStorage.getItem("ocrText") || "");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  async function classify() {
    if (!text) return alert("Không có văn bản để phân loại");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8005/classify/by_text", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setLabel(data.label || JSON.stringify(data));
    } catch (err) {
      setLabel("Lỗi phân loại");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">🧩 Classifier</h2>

      <textarea value={text} onChange={e=>setText(e.target.value)} rows={6} className="w-full p-3 border rounded" />

      <div className="mt-3">
        <button onClick={classify} className="px-3 py-2 bg-yellow-600 text-white rounded" disabled={loading}>
          {loading ? "Đang phân loại..." : "Phân loại"}
        </button>
      </div>

      <div className="mt-4">
        <h4 className="font-medium">Kết quả:</h4>
        <div className="p-3 bg-gray-100 rounded mt-2">{label || "(Chưa có)"}</div>
      </div>
    </div>
  );
}
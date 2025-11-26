import React, { useState } from "react";

export default function Summarizer() {
  const [text, setText] = useState(sessionStorage.getItem("ocrText") || "");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  async function runSummarize() {
    if (!text) return alert("Chưa có văn bản để tóm tắt");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8003/summarizer/summarize", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setSummary(data.summary || JSON.stringify(data));
    } catch (err) {
      alert("Lỗi gọi API summarize");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">🗒️ Summarizer</h2>

      <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
                className="w-full p-3 border rounded" placeholder="Văn bản OCR..."></textarea>

      <div className="mt-3 flex gap-2">
        <button onClick={runSummarize} className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={loading}>
          {loading ? "Đang tóm tắt..." : "Tóm tắt"}
        </button>
        <button onClick={() => { setText(sessionStorage.getItem("ocrText")||""); }} className="px-4 py-2 bg-gray-200 rounded">Dùng OCR gần nhất</button>
      </div>

      <div className="mt-4">
        <h4 className="font-medium">Kết quả:</h4>
        <pre className="bg-gray-100 p-3 rounded mt-2 whitespace-pre-wrap">{summary || "(Chưa có)"}</pre>
      </div>
    </div>
  );
}
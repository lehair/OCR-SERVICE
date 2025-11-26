import React, { useState, useEffect } from "react";

export default function Translate() {
  const [original, setOriginal] = useState("");
  const [translated, setTranslated] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const o = sessionStorage.getItem("ocrText");
    if (o) setOriginal(o);
  }, []);

  async function doTranslate() {
    if (!original) return alert("Không có văn bản để dịch");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8006/translate/translate", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ text: original, target_lang: targetLang, source_lang: sourceLang })
      });
      const data = await res.json();
      if (data.success) {
        setTranslated(data.translated_text);
      } else {
        setTranslated("Lỗi: " + (data.error || "Không rõ"));
      }
    } catch (err) {
      setTranslated("Lỗi kết nối tới server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">🌐 Translate</h2>

      <div className="flex gap-2 mb-3">
        <select value={sourceLang} onChange={e=>setSourceLang(e.target.value)} className="p-2 border rounded">
          <option value="auto">Tự động</option>
          <option value="vi">Tiếng Việt</option>
          <option value="en">Tiếng Anh</option>
        </select>
        <select value={targetLang} onChange={e=>setTargetLang(e.target.value)} className="p-2 border rounded">
          <option value="en">Tiếng Anh</option>
          <option value="vi">Tiếng Việt</option>
        </select>
        <button onClick={doTranslate} className="px-3 py-2 bg-green-600 text-white rounded" disabled={loading}>
          {loading ? "Đang dịch..." : "Dịch"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Văn bản gốc</h4>
          <div className="p-3 border rounded h-64 overflow-auto whitespace-pre-wrap">{original || "(Chưa có)"}</div>
        </div>

        <div>
          <h4 className="font-medium">Kết quả</h4>
          <div className="p-3 border rounded h-64 overflow-auto whitespace-pre-wrap">{translated || "(Chưa có)"}</div>
        </div>
      </div>
    </div>
  );
}
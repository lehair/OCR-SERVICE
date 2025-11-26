import React, { useState } from "react";

export default function OCR() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return alert("Chọn ảnh trước!");

    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("http://localhost:8002/ocr/read", { method: "POST", body: fd });
      const data = await res.json();
      // trả về model OCRResult {filename, text}
      setText(data.text || JSON.stringify(data));
      // lưu để dùng cho translate
      sessionStorage.setItem("ocrText", data.text || "");
    } catch (err) {
      alert("Lỗi khi gọi API OCR");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">🔍 OCR — Nhận diện văn bản</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input accept="image/*" type="file" onChange={e => setFile(e.target.files[0])} />
        <div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
            {loading ? "Đang xử lý..." : "Nhận diện"}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="font-medium">Kết quả:</h3>
        <pre className="bg-gray-100 p-3 rounded mt-2 whitespace-pre-wrap">{text || "(Chưa có)"}</pre>
      </div>
    </div>
  );
}
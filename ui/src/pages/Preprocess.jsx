import React, { useState } from "react";

export default function Preprocess() {
  const [file, setFile] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  async function callApi(path) {
    if (!file) return alert("Chọn ảnh trước!");
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(path, { method: "POST", body: fd });
      const data = await res.json();
      // endpoint trả về {"enhanced_image":"data:image/png;base64,..."} hoặc {"image":...}
      const key = data.enhanced_image || data.image || data.image_base64;
      setImgSrc(key);
    } catch (err) {
      alert("Lỗi khi gọi API preprocess");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold text-indigo-600 mb-4">✨ Preprocess — Làm nét, deskew, threshold</h2>

      <div className="space-y-3">
        <input accept="image/*" type="file" onChange={e => setFile(e.target.files[0])} />
        <div className="flex gap-2">
          <button onClick={() => callApi("http://localhost:8004/preprocess/enhance")} className="px-3 py-2 bg-purple-600 text-white rounded" disabled={loading}>Làm nét</button>
          <button onClick={() => callApi("http://localhost:8004/preprocess/deskew")} className="px-3 py-2 bg-yellow-600 text-white rounded" disabled={loading}>Deskew</button>
          <button onClick={() => callApi("http://localhost:8004/preprocess/threshold")} className="px-3 py-2 bg-slate-600 text-white rounded" disabled={loading}>Threshold</button>
        </div>

        {loading && <p className="text-gray-500">Đang xử lý...</p>}

        {imgSrc && (
          <div className="mt-4">
            <h4 className="font-medium">Ảnh sau xử lý:</h4>
            <img src={imgSrc} alt="result" className="mt-2 max-h-72 rounded shadow" />
          </div>
        )}
      </div>
    </div>
  );
}

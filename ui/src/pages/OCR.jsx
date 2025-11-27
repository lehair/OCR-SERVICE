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
      const res = await fetch("http://localhost:8002/ocr/read", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      // trả về model OCRResult {filename, text}
      const t = data.text || JSON.stringify(data);
      setText(t);
      // lưu để dùng cho translate / classifier
      sessionStorage.setItem("ocrText", data.text || "");
    } catch (err) {
      alert("Lỗi khi gọi API OCR");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-2">
          <span>🔍</span>
          <span>OCR · Nhận diện văn bản</span>
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Chuyển ảnh thành văn bản
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-xl">
          Tải lên ảnh chụp tài liệu, đề thi, hóa đơn… Hệ thống sẽ nhận diện chữ
          bằng EasyOCR và lưu lại kết quả để sử dụng cho tóm tắt / dịch.
        </p>
      </div>

      {/* Form + kết quả */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload & nút xử lý */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Chọn ảnh đầu vào
            </label>

            <label
              htmlFor="ocr-file"
              className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-2xl cursor-pointer border-slate-200 bg-slate-50/60 hover:border-indigo-300 hover:bg-indigo-50/40 transition"
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl mb-2">📁</span>
                <span className="text-sm font-medium text-slate-800">
                  Nhấn để chọn ảnh
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Hỗ trợ: JPG, PNG, JPEG, WEBP…
                </span>
                {file && (
                  <span className="mt-2 text-xs text-slate-600 max-w-full truncate">
                    Đã chọn:{" "}
                    <span className="font-medium text-slate-800">
                      {file.name}
                    </span>
                  </span>
                )}
              </div>
              <input
                id="ocr-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition ${
                loading
                  ? "bg-indigo-400/80 text-white cursor-wait"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Nhận diện văn bản</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400">
              Gợi ý: Ảnh rõ nét, ánh sáng tốt sẽ cho kết quả OCR chính xác hơn.
            </p>
          </div>
        </form>

        {/* Kết quả */}
        <div className="flex flex-col h-full">
          <h3 className="text-sm font-medium text-slate-700 mb-2">
            Kết quả văn bản OCR
          </h3>
          <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
            <pre className="text-sm text-slate-800 whitespace-pre-wrap max-h-72 overflow-auto">
              {text ||
                "(Chưa có kết quả. Hãy chọn ảnh và bấm “Nhận diện văn bản”.)"}
            </pre>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Nội dung này đã được lưu vào{" "}
            <span className="font-medium">sessionStorage.ocrText</span> để dùng
            cho các chức năng khác (Summarizer, Classifier, Translate).
          </p>
        </div>
      </div>
    </div>
  );
}

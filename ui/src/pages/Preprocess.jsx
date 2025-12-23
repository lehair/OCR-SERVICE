import React, { useState } from "react";

export default function Preprocess() {
  const [file, setFile] = useState(null);
  const [origPreview, setOrigPreview] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [docType, setDocType] = useState("");
  const [loading, setLoading] = useState(false);

  async function callApi(path) {
    if (!file) return alert("Chọn ảnh trước!");
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    // gửi user_id để lưu history + thống kê
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u?.user_id) fd.append("user_id", u.user_id);
    } catch {}
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

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);

    // tạo preview ảnh gốc
    const reader = new FileReader();
    reader.onload = (ev) => setOrigPreview(ev.target.result);
    reader.readAsDataURL(f);
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-medium mb-2">
          <span>✨</span>
          <span>Preprocess · Làm nét, deskew, threshold</span>
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Xử lý ảnh trước khi OCR
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-xl">
          Tăng chất lượng ảnh bằng{" "}
          <span className="font-medium">
            làm nét, chỉnh nghiêng (deskew), nhị phân hóa (threshold)
          </span>{" "}
          để OCR có kết quả tốt hơn.
        </p>
      </div>

      {/* Layout 2 cột */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload + nút xử lý */}
        <div className="space-y-4">
          {/* Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Chọn ảnh cần xử lý
            </label>

            <label
              htmlFor="pre-file"
              className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-2xl cursor-pointer border-slate-200 bg-slate-50/60 hover:border-violet-300 hover:bg-violet-50/40 transition"
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl mb-2">🖼️</span>
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
                id="pre-file"
                accept="image/*"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Nút */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Chọn thao tác xử lý
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  callApi("http://localhost:8010/preprocess/enhance_ocr")
                }
                className="px-3 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                ✨ Làm nét
              </button>

              <button
                onClick={() =>
                  callApi("http://localhost:8010/preprocess/deskew_ocr")
                }
                className="px-3 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                📐 Deskew
              </button>

              <button
                onClick={() =>
                  callApi("http://localhost:8010/preprocess/threshold_ocr")
                }
                className="px-3 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                🌓 Threshold
              </button>
            </div>

            {loading && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý ảnh, vui lòng chờ...</span>
              </div>
            )}

            {!loading && (
              <p className="mt-3 text-[11px] text-slate-400">
                Gợi ý: thử làm nét trước, sau đó deskew/threshold nếu ảnh là tài
                liệu scan hoặc đề thi.
              </p>
            )}
          </div>
        </div>

        {/* Preview trước / sau */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ảnh gốc */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">
                Ảnh gốc
              </h4>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-2 min-h-[180px] flex items-center justify-center">
                {origPreview ? (
                  <img
                    src={origPreview}
                    alt="original"
                    className="max-h-60 w-auto rounded-xl object-contain"
                  />
                ) : (
                  <p className="text-xs text-slate-400 text-center px-2">
                    Chưa có ảnh. Hãy chọn một ảnh để xem preview trước xử lý.
                  </p>
                )}
              </div>
            </div>

            {/* Ảnh sau xử lý */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">
                Ảnh sau xử lý
              </h4>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-2 min-h-[180px] flex items-center justify-center">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt="processed"
                    className="max-h-60 w-auto rounded-xl object-contain"
                  />
                ) : (
                  <p className="text-xs text-slate-400 text-center px-2">
                    Kết quả sẽ hiển thị tại đây sau khi bạn chọn thao tác xử lý.
                  </p>
                )}
              </div>
            </div>
          </div>

          {imgSrc && (
            <p className="text-[11px] text-slate-400">
              Bạn có thể tải ảnh sau xử lý (chuột phải → Lưu ảnh) và dùng làm
              input cho bước OCR tiếp theo.
            </p>
          )}
        
          {/* OCR result */}
          {ocrText && (
            <div className="mt-5 bg-white/90 rounded-2xl border border-slate-100 shadow p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-slate-900">Kết quả OCR</h3>
                {docType && (
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {docType}
                  </span>
                )}
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
{ocrText}
              </pre>
            </div>
          )}
</div>
      </div>
    </div>
  );
}

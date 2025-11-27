import React, { useState } from "react";

export default function Classifier() {
  const [text, setText] = useState(sessionStorage.getItem("ocrText") || "");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  async function classify() {
    if (!text) return alert("Không có văn bản để phân loại");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8005/classifier/by_text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Classifier error:", err);
        setLabel("Lỗi phân loại (server trả về " + res.status + ")");
        return;
      }

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
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-2">
            <span>🧩</span>
            <span>Document Classifier</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Phân loại loại tài liệu
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Dán văn bản (hoặc dùng kết quả OCR) để hệ thống dự đoán tài liệu là
            gì: ví dụ{" "}
            <span className="font-medium text-slate-700">
              đề thi, hóa đơn, bài báo, tài liệu học tập
            </span>
            , v.v.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input text */}
        <div className="flex flex-col h-full">
          <label className="text-sm font-medium text-slate-700 mb-2">
            Văn bản đầu vào
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full flex-1 p-3 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-400 resize-none bg-slate-50/60"
            placeholder="Dán văn bản hoặc sử dụng văn bản đã nhận diện từ OCR..."
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              onClick={classify}
              disabled={loading}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition
                ${
                  loading
                    ? "bg-amber-400/70 text-white cursor-wait"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                  <span>Đang phân loại...</span>
                </>
              ) : (
                <>
                  <span>🧠</span>
                  <span>Phân loại tài liệu</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400">
              Gợi ý: dùng các đoạn văn đủ dài (vài câu trở lên) để kết quả chính
              xác hơn.
            </p>
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col h-full">
          <label className="text-sm font-medium text-slate-700 mb-2">
            Kết quả phân loại
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Nhãn dự đoán
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-slate-900 text-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Model response</span>
              </span>
            </div>

            <div className="mt-1">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                {label ? label : "Chưa có kết quả"}
              </div>
            </div>

            {!label && (
              <p className="text-xs text-slate-500 mt-3">
                Sau khi bấm{" "}
                <span className="font-medium">“Phân loại tài liệu”</span>, nhãn
                dự đoán sẽ xuất hiện tại đây.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

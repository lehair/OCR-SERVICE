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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
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

  function useLastOCR() {
    const ocr = sessionStorage.getItem("ocrText") || "";
    setText(ocr);
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium mb-2">
          <span>🗒️</span>
          <span>Summarizer · Tóm tắt văn bản</span>
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Tóm tắt nhanh nội dung tài liệu
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-xl">
          Dùng văn bản đã OCR hoặc dán đoạn văn dài để hệ thống tóm tắt, giúp
          bạn nắm được ý chính nhanh hơn.
        </p>
      </div>

      {/* Layout 2 cột */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Văn bản gốc */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">
              Văn bản gốc
            </label>
            <button
              type="button"
              onClick={useLastOCR}
              className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
            >
              Dùng OCR gần nhất
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full flex-1 p-3 text-sm rounded-2xl border border-slate-200 bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/70 focus:border-amber-400 resize-none"
            placeholder="Dán văn bản cần tóm tắt hoặc dùng lại kết quả OCR gần nhất..."
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              onClick={runSummarize}
              disabled={loading}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition
                ${
                  loading
                    ? "bg-amber-400/80 text-white cursor-wait"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tóm tắt...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Tóm tắt nội dung</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400">
              Gợi ý: Tóm tắt tốt nhất với các đoạn văn trên 3–4 câu.
            </p>
          </div>
        </div>

        {/* Kết quả tóm tắt */}
        <div className="flex flex-col h-full">
          <label className="text-sm font-medium text-slate-700 mb-2">
            Kết quả tóm tắt
          </label>
          <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
            <pre className="text-sm text-slate-800 whitespace-pre-wrap max-h-72 overflow-auto">
              {summary || "(Chưa có kết quả. Hãy bấm “Tóm tắt nội dung”.)"}
            </pre>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Bạn có thể copy phần tóm tắt để dùng cho ghi chú, báo cáo, hoặc gửi
            qua các công cụ khác.
          </p>
        </div>
      </div>
    </div>
  );
}

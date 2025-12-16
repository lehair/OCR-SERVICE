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

  const getUserID = () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return 1;
      const u = JSON.parse(stored);
      return u.user_id || u.id || 1;
    } catch {
      return 1;
    }
  };
  const USER_ID = getUserID();

  async function doTranslate() {
    if (!original) return alert("Không có văn bản để dịch");
    setLoading(true);
    try {
      // Gateway expose /translate/text (và có alias /translate/translate)
      const res = await fetch("http://localhost:8010/translate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: original,
          target_lang: targetLang,
          source_lang: sourceLang,
          user_id: USER_ID,
          filename: sessionStorage.getItem("ocrFilename") || "",
        }),
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

  function swapLangs() {
    if (sourceLang === "auto") return; // auto ↔ target không hợp lý lắm
    const newSource = targetLang;
    const newTarget = sourceLang;
    setSourceLang(newSource);
    setTargetLang(newTarget);
    // Đổi chỗ text nếu đã có bản dịch
    if (translated) {
      setOriginal(translated);
      setTranslated(original);
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium mb-2">
          <span>🌐</span>
          <span>Translate · Dịch văn bản</span>
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Dịch nhanh nội dung tài liệu
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-xl">
          Sử dụng văn bản đã OCR hoặc dán nội dung bất kỳ để dịch giữa{" "}
          <span className="font-medium">Tiếng Việt</span> và{" "}
          <span className="font-medium">Tiếng Anh</span>.
        </p>
      </div>

      {/* Thanh chọn ngôn ngữ + nút dịch */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-2 border border-slate-200">
            <span className="text-xs text-slate-500">Nguồn</span>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-transparent text-sm text-slate-800 focus:outline-none"
            >
              <option value="auto">Tự động</option>
              <option value="vi">Tiếng Việt</option>
              <option value="en">Tiếng Anh</option>
            </select>
          </div>

          <button
            type="button"
            onClick={swapLangs}
            className="p-2 rounded-full bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 transition text-xs"
            title="Đổi chiều dịch"
          >
            ↔
          </button>

          <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-2 border border-slate-200">
            <span className="text-xs text-slate-500">Đích</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-transparent text-sm text-slate-800 focus:outline-none"
            >
              <option value="en">Tiếng Anh</option>
              <option value="vi">Tiếng Việt</option>
            </select>
          </div>
        </div>

        <button
          onClick={doTranslate}
          disabled={loading}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition
            ${
              loading
                ? "bg-emerald-400/80 text-white cursor-wait"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
              <span>Đang dịch...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>Dịch văn bản</span>
            </>
          )}
        </button>
      </div>

      {/* 2 panel văn bản */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Gốc */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-slate-700">Văn bản gốc</h4>
            <span className="text-[11px] text-slate-400">
              Nguồn: {sourceLang === "auto" ? "Tự động nhận diện" : sourceLang}
            </span>
          </div>
          <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
            <div className="text-sm text-slate-800 whitespace-pre-wrap max-h-72 overflow-auto">
              {original ||
                "(Chưa có nội dung. Hãy chạy OCR hoặc dán văn bản vào.)"}
            </div>
          </div>
        </div>

        {/* Dịch */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-slate-700">Kết quả dịch</h4>
            <span className="text-[11px] text-slate-400">
              Đích: {targetLang === "vi" ? "Tiếng Việt" : "Tiếng Anh"}
            </span>
          </div>
          <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
            <div className="text-sm text-slate-800 whitespace-pre-wrap max-h-72 overflow-auto">
              {translated || "(Chưa có kết quả. Hãy bấm “Dịch văn bản”.)"}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-slate-400">
        Gợi ý: Nếu bản dịch chưa tự nhiên, bạn có thể copy kết quả sang một công
        cụ khác để hiệu chỉnh lại câu chữ cho phù hợp văn phong.
      </p>
    </div>
  );
}

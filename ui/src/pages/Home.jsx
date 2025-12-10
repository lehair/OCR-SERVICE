// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      key: "ocr",
      title: "🔍 OCR",
      desc: "Nhận diện văn bản từ hình ảnh bằng EasyOCR.",
      action: () => navigate("/ocr"),
      accent: "from-sky-500/10 to-indigo-500/10 border-sky-100",
      pill: "OCR Engine",
    },
    {
      key: "preprocess",
      title: "✨ Preprocess",
      desc: "Làm nét, deskew, threshold ảnh trước khi OCR.",
      action: () => navigate("/preprocess"),
      accent: "from-violet-500/10 to-fuchsia-500/10 border-violet-100",
      pill: "Image Preprocessing",
    },
    {
      key: "summarizer",
      title: "🗒️ Summarizer",
      desc: "Tóm tắt văn bản đã trích xuất, phù hợp cho ôn tập nhanh.",
      action: () => navigate("/summarizer"),
      accent: "from-amber-500/10 to-orange-500/10 border-amber-100",
      pill: "Text Summary",
    },
    {
      key: "translate",
      title: "🌐 Translate",
      desc: "Dịch văn bản sang ngôn ngữ khác để đọc & học dễ hơn.",
      action: () => navigate("/translate"),
      accent: "from-emerald-500/10 to-teal-500/10 border-emerald-100",
      pill: "Machine Translation",
    },
    {
      key: "login-stats",
      title: "📊 Login Stats",
      desc: "Xem thống kê tài khoản và lượt đăng nhập hệ thống.",
      action: () => navigate("/login-stats"),
      accent: "from-indigo-500/10 to-purple-500/10 border-indigo-100",
      pill: "Auth Dashboard",
    },
    {
      key: "doc-stats",
      title: "📑 Doc Stats",
      desc: "Thống kê loại tài liệu (CCCD, thẻ SV, đề cương) và ngôn ngữ.",
      action: () => navigate("/doc-stats"), // 👈 sang Dashboard thống kê tài liệu
      accent: "from-cyan-500/10 to-sky-500/10 border-cyan-100",
      pill: "Document Dashboard",
    },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          <span>Control Panel · OCR Services</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          OCR Image Reader Dashboard
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
          Đây là trung tâm quản lý các dịch vụ OCR của bạn. Hãy chọn một chức
          năng bên dưới để bắt đầu xử lý tài liệu: nhận diện, làm nét, tóm tắt
          hoặc dịch văn bản, và xem các dashboard thống kê.
        </p>
      </div>

      {/* Grid cards */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.key}
            className={[
              "relative group p-4 sm:p-5 rounded-2xl border bg-gradient-to-br",
              f.accent,
              "hover:border-indigo-200 hover:shadow-md transition-all duration-150",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <span className="text-lg">{f.title.split(" ")[0]}</span>
                  <span>{f.title.replace(/^\S+\s*/, "")}</span>
                </h3>
                <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-white/70 text-slate-500 border border-white/80">
                {f.pill}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={f.action}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold shadow-sm hover:bg-indigo-600 transition"
              >
                <span>Mở {f.title.replace(/^\S+\s*/, "")}</span>
                <span className="text-xs">↗</span>
              </button>

              <span className="text-[11px] text-slate-400 hidden sm:inline group-hover:text-slate-500 transition">
                Nhấn để chuyển tới màn hình chi tiết
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

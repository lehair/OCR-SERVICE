// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

// Nếu bạn muốn hiển thị Widget thống kê ngay trên Home (như gợi ý trước), 
// hãy import LoginStats vào đây. Nếu không thì giữ nguyên code dưới.

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
    // 👇 MỤC MỚI: HISTORY
    {
      key: "history",
      title: "📜 History",
      desc: "Xem lại danh sách các file đã xử lý và kết quả chi tiết.",
      action: () => navigate("/history"),
      accent: "from-rose-500/10 to-pink-500/10 border-rose-100",
      pill: "Activity Log",
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
      desc: "Thống kê loại tài liệu (CCCD, thẻ SV...) và ngôn ngữ.",
      action: () => navigate("/doc-stats"),
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
          Chào mừng! Đây là trung tâm quản lý các dịch vụ OCR. Hãy chọn một chức
          năng bên dưới để bắt đầu xử lý tài liệu.
        </p>
      </div>

      {/* Grid cards */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.key}
            className={[
              "relative group p-4 sm:p-5 rounded-2xl border bg-gradient-to-br flex flex-col justify-between",
              f.accent,
              "hover:border-indigo-200 hover:shadow-md transition-all duration-150 cursor-pointer",
            ].join(" ")}
            onClick={f.action} // Cho phép click cả card
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                 {/* Tách icon và title thủ công để an toàn hơn */}
                <h3 className="font-semibold text-slate-900 text-lg">
                  {f.title}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 text-slate-500 border border-white/80 whitespace-nowrap">
                  {f.pill}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/80 text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                ↗
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
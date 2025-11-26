import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h1 className="text-2xl font-bold text-indigo-600 mb-3">OCR Image Reader</h1>
      <p className="text-gray-700 mb-4">
        Đây là giao diện quản lý dịch vụ OCR của bạn. Chọn chức năng ở sidebar bên trái:
      </p>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">🔍 OCR</h3>
          <p className="text-sm text-gray-500">Nhận diện văn bản từ hình ảnh (EasyOCR).</p>
          <button onClick={() => navigate("/ocr")} className="mt-3 px-3 py-2 bg-indigo-500 text-white rounded">Mở OCR</button>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">✨ Preprocess</h3>
          <p className="text-sm text-gray-500">Làm nét, deskew, threshold trước khi OCR.</p>
          <button onClick={() => navigate("/preprocess")} className="mt-3 px-3 py-2 bg-indigo-500 text-white rounded">Mở Preprocess</button>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">🗒️ Summarizer</h3>
          <p className="text-sm text-gray-500">Tóm tắt văn bản trích xuất.</p>
          <button onClick={() => navigate("/summarizer")} className="mt-3 px-3 py-2 bg-indigo-500 text-white rounded">Mở Summarizer</button>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">🌐 Translate</h3>
          <p className="text-sm text-gray-500">Dịch văn bản sang ngôn ngữ khác.</p>
          <button onClick={() => navigate("/translate")} className="mt-3 px-3 py-2 bg-indigo-500 text-white rounded">Mở Translate</button>
        </div>
      </div>
    </div>
  );
}
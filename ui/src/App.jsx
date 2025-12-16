import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import OCR from "./pages/OCR";
import Preprocess from "./pages/Preprocess";
import Summarizer from "./pages/Summarizer";
import Translate from "./pages/Translate";
import Classifier from "./pages/Classifier";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LoginStats from "./pages/LoginStats"; 
import DocStats from "./pages/DocStats"; 
import History from "./pages/History"; // ✅ Đã có import

function AppLayout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {isAuthPage ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <main className="w-full max-w-md">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar chứa menu điều hướng */}
            <Sidebar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/ocr" element={<OCR />} />
                <Route path="/preprocess" element={<Preprocess />} />
                <Route path="/summarizer" element={<Summarizer />} />
                <Route path="/translate" element={<Translate />} />
                <Route path="/classifier" element={<Classifier />} />

                <Route path="/login-stats" element={<LoginStats />} />
                <Route path="/doc-stats" element={<DocStats />} />

                {/* 👇 THÊM DÒNG NÀY ĐỂ VÀO TRANG LỊCH SỬ */}
                <Route path="/history" element={<History />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}
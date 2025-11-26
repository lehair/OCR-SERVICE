import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import OCR from "./pages/OCR";
import Preprocess from "./pages/Preprocess";
import Summarizer from "./pages/Summarizer";
import Translate from "./pages/Translate";
import Classifier from "./pages/Classifier";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4 flex gap-6">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ocr" element={<OCR />} />
            <Route path="/preprocess" element={<Preprocess />} />
            <Route path="/summarizer" element={<Summarizer />} />
            <Route path="/translate" element={<Translate />} />
            <Route path="/classifier" element={<Classifier />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

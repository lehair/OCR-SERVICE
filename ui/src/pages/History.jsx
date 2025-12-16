import React, { useEffect, useState } from "react";

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("");

  // Lấy ID an toàn
  const getUserID = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored).user_id : 1;
    } catch {
      return 1;
    }
  };
  const USER_ID = getUserID();

  useEffect(() => {
    fetchHistory();
  }, [filterType]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `http://localhost:8010/history/list/${USER_ID}`;
      if (filterType) {
        url += `?doc_type=${filterType}`;
      }

      const res = await fetch(url);
      
      // Nếu API lỗi (404, 500), ném lỗi để catch bắt
      if (!res.ok) {
        throw new Error(`Lỗi API: ${res.statusText}`);
      }
      
      const payload = await res.json();

      // Gateway/HistoryService hiện trả về { data: [...] }
      // (Một số version cũ có thể trả thẳng mảng)
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      setRecords(list);

      if (!Array.isArray(list) && payload?.detail) {
        throw new Error(payload.detail);
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Không thể tải dữ liệu lịch sử");
      setRecords([]); // Reset về rỗng
    } finally {
      setLoading(false);
    }
  };

  const typeMap = {
    CCCD: { label: "Căn cước công dân", color: "text-blue-600 bg-blue-50" },
    THE_SV: { label: "Thẻ sinh viên", color: "text-green-600 bg-green-50" },
    DE_CUONG: { label: "Đề cương", color: "text-purple-600 bg-purple-50" },
    OTHER: { label: "Tài liệu khác", color: "text-gray-600 bg-gray-50" },
  };

  // Hiển thị nội dung OCR (hoặc dữ liệu thô) an toàn
  const showResult = (text) => {
    const value = (text ?? "").toString();
    if (!value.trim()) return alert("(Không có nội dung lưu trong lịch sử)");
    alert(value);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 min-h-[80vh]">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📜 Lịch sử Hoạt động</h1>
          <p className="text-sm text-slate-500 mt-1">
            Danh sách các file bạn đã xử lý.
          </p>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
        >
          <option value="">Tất cả loại</option>
          <option value="CCCD">Căn cước công dân</option>
          <option value="THE_SV">Thẻ sinh viên</option>
          <option value="DE_CUONG">Đề cương</option>
          <option value="OTHER">Khác</option>
        </select>
      </div>

      {/* DANH SÁCH */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10 bg-red-50 rounded-xl border border-red-100">
          ⚠️ {error} <br/>
          <span className="text-xs text-slate-400 mt-2 block">Hãy kiểm tra lại Gateway hoặc History Service</span>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center text-slate-400 py-20 flex flex-col items-center border-2 border-dashed border-slate-100 rounded-2xl">
          <span className="text-4xl mb-3">📭</span>
          <p>Chưa có dữ liệu lịch sử nào.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Tên file</th>
                <th className="px-4 py-3">Ngôn ngữ</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {records.map((rec, index) => {
                // Fields chuẩn từ History Service: id, filename, doc_type, language, created_at, ocr_text
                const typeInfo = typeMap[rec.doc_type] || {
                  label: rec.doc_type || "Tài liệu khác",
                  color: "text-gray-600 bg-gray-50",
                };
                const fileName = rec.filename || "Không tên";
                const lang = rec.language === "vi" ? "🇻🇳 Việt" : "🇺🇸 Anh";
                const dateStr = rec.created_at
                  ? new Date(rec.created_at).toLocaleString("vi-VN")
                  : "---";

                return (
                  <tr key={rec.id || index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate" title={fileName}>
                      {fileName}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {lang}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {dateStr}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => showResult(rec.ocr_text)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Xem OCR
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
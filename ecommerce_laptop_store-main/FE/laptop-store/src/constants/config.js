import axios from "axios";

export const baseUrl = "http://localhost:8000"; // Đảm bảo có http://

const urlConfig = {
  baseUrl: `${baseUrl}/api/`,
};

// Tạo instance axios với cấu hình mặc định
export const http = axios.create({
  baseURL: urlConfig.baseUrl, // Sử dụng baseURL từ urlConfig
  headers: {
    "Content-Type": "application/json",
  },
});

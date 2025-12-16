# -------- STAGE 1: BUILD REACT APP --------
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -------- STAGE 2: SERVE BẰNG NGINX --------
FROM nginx:alpine

# Xóa config mặc định của Nginx (để tránh xung đột)
RUN rm -rf /etc/nginx/conf.d/*
# Xóa file html mặc định
RUN rm -rf /usr/share/nginx/html/*

# 1. Copy Code React đã build
# LƯU Ý: Nếu dùng Vite thì folder là /app/dist, nếu dùng Create-React-App là /app/build
# Bạn kiểm tra xem folder build của bạn tên là gì nhé.
COPY --from=build /app/build /usr/share/nginx/html

# 2. 👇 DÒNG QUAN TRỌNG NHẤT (Sửa lỗi 404)
# Copy file nginx.conf từ máy bạn vào thay thế config của Docker
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
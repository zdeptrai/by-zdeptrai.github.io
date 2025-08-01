# Dựa trên image Node.js chính thức
FROM node:18-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file package.json và package-lock.json để cài đặt phụ thuộc
COPY package*.json ./

# Cài đặt các gói phụ thuộc
RUN npm install

# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Mở cổng cho container. Cloud Run sẽ gửi traffic đến cổng 8080.
EXPOSE 8080

# Thiết lập biến môi trường PORT thành 8080 để ứng dụng của bạn lắng nghe đúng cổng.
ENV PORT 8080

# Lệnh để chạy ứng dụng khi container khởi động
CMD [ "npm", "start" ]

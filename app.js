const express = require('express');
const app = express();
const path = require('path');

// Cấu hình EJS làm template engine
app.set('view engine', 'ejs');
// Thư mục chứa các template - trở về thư mục views ở gốc dự án
app.set('views', path.join(__dirname, 'views'));

// Cấu hình Express để phục vụ các file tĩnh (CSS, JS, hình ảnh) từ thư mục 'public'
// Thư mục public ở gốc dự án
app.use(express.static(path.join(__dirname, 'public')));

// Định nghĩa route cho trang chủ
app.get('/', (req, res) => {
    // Render file index.ejs.
    // Các biến bạn muốn truyền vào template có thể được thêm vào đây.
    res.render('index', {
        pageTitle: 'Trang Web Cá Nhân Của Tôi',
        yourName: 'Nguyễn Văn Tiến' // Có thể thay đổi
    });
});

// Định nghĩa cổng và khởi động máy chủ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
    console.log(`Truy cập tại: http://localhost:${PORT}`);
});
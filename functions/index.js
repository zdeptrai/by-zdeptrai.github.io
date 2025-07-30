const functions = require('firebase-functions');
const express = require('express');
const path = require('path');

const app = express();

// Cấu hình EJS làm template engine
app.set('view engine', 'ejs');
// Quan trọng: Sử dụng path.join với __dirname để đảm bảo đường dẫn đúng trong môi trường Cloud Functions
// __dirname trong Cloud Functions sẽ là thư mục functions/
app.set('views', path.join(__dirname, 'views'));

// Định nghĩa route cho trang chủ
app.get('/', (req, res) => {
    // Render file index.ejs.
    res.render('index', {
        pageTitle: 'Trang Web Cá Nhân Của Tôi',
        yourName: 'Tên Của Bạn (hoặc để trống)' // Bạn có thể tùy chỉnh tên này
    });
});

// Xuất ứng dụng Express dưới dạng một Cloud Function
// Tên của function sẽ là 'app'
exports.app = functions.https.onRequest(app);
// app.js

const express = require('express');
const app = express();
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const PORT = process.env.PORT || 8080;

// Khởi tạo client Google Cloud Storage
const storage = new Storage();
// Tên bucket của bạn
const bucketName = 'tien-saker'; 

// Cấu hình Express để sử dụng EJS làm view engine.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Phục vụ các file tĩnh từ thư mục 'public'.
app.use(express.static(path.join(__dirname, 'public')));

// Định nghĩa route cho trang chủ.
app.get('/', async (req, res) => {
  let galleryItems = [];
  try {
    const [files] = await storage.bucket(bucketName).getFiles();

    // Lọc các file để chỉ hiển thị ảnh, video và gif
    const validFileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov'];
    const filteredFiles = files.filter(file => 
      validFileExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    galleryItems = filteredFiles.map(file => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${file.name}`;
      return {
        url: publicUrl,
        title: file.name,
        description: 'Được tải lên từ Google Cloud Storage.'
      };
    });
    
    res.render('index', { 
      pageTitle: 'tien_saker', 
      yourName: 'Nguyễn Văn Tiến',
      galleryItems: galleryItems
    });

  } catch (error) {
    console.error("Lỗi khi lấy file từ GCS hoặc render trang chủ:", error);
    res.status(500).send("Có lỗi xảy ra khi tải trang chủ. Vui lòng kiểm tra file index.ejs hoặc GCS bucket.");
  }
});

// Định nghĩa các route cho các section khác nhau.
app.get('/about', (req, res) => {
  try {
    res.render('sections/about', { pageTitle: 'Về tôi' });
  } catch (error) {
    console.error("Lỗi khi render trang About:", error);
    res.status(500).send("Có lỗi xảy ra khi tải trang About. Vui lòng kiểm tra file about.ejs.");
  }
});

app.get('/contact', (req, res) => {
  try {
    res.render('sections/contact', { pageTitle: 'Liên hệ' });
  } catch (error) {
    console.error("Lỗi khi render trang Contact:", error);
    res.status(500).send("Có lỗi xảy ra khi tải trang Contact. Vui lòng kiểm tra file contact.ejs.");
  }
});

// Middleware xử lý lỗi 404 (Not Found)
app.use((req, res, next) => {
  res.status(404).send("Rất tiếc, trang bạn tìm không thấy!");
});

// Khởi động server và lắng nghe trên cổng đã định nghĩa.
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

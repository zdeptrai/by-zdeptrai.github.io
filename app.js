const express = require('express');
const app = express();
const path = require('path');

// =========================================================
// TẢI BIẾN MÔI TRƯỜNG TỪ FILE .env (QUAN TRỌNG CHO BẢO MẬT)
// Đảm bảo dòng này ở ĐẦU file app.js
// =========================================================
require('dotenv').config();

// Import các module Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, query, orderBy, where, serverTimestamp } = require('firebase/firestore');
const { getAuth, signInWithCustomToken, signInAnonymously } = require('firebase/auth');

// Import module crypto để tạo chữ ký webhook (quan trọng cho bảo mật)
const crypto = require('crypto');

// Cấu hình EJS làm template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cấu hình Express để phục vụ các file tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Middleware để phân tích cú pháp JSON trong các request body
app.use(express.json());

// =========================================================
// KHỞI TẠO FIREBASE VÀ FIRESTORE
// =========================================================
let db;
let auth;
let userId;
let appId;

async function initializeFirebase() {
    try {
        // Lấy cấu hình Firebase từ biến toàn cục của Canvas (khi triển khai)
        // HOẶC từ biến môi trường (khi chạy cục bộ)
        const firebaseConfig = typeof __firebase_config !== 'undefined' 
            ? JSON.parse(__firebase_config) 
            : {
                apiKey: process.env.FIREBASE_API_KEY,
                authDomain: process.env.FIREBASE_AUTH_DOMAIN,
                projectId: process.env.FIREBASE_PROJECT_ID,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.FIREBASE_APP_ID
            };
        
        // ID ứng dụng cho môi trường cục bộ hoặc từ Canvas
        appId = typeof __app_id !== 'undefined' ? __app_id : 'local-dev-app-id'; 

        // Kiểm tra lại các trường cấu hình quan trọng
        // Giữ lại console.error để báo cáo lỗi cấu hình
        if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
            console.error("Lỗi: Cấu hình Firebase không hợp lệ hoặc thiếu các trường quan trọng (apiKey, authDomain, projectId).");
            // Không return ở đây để hàm vẫn cố gắng khởi tạo db/auth (có thể hữu ích cho Canvas)
            // hoặc để lỗi được bắt ở khối catch bên ngoài.
            // Tuy nhiên, nếu bạn muốn dừng hẳn khi cấu hình sai cục bộ, có thể giữ return.
            // Với mục đích làm gọn, chúng ta sẽ để nó tiếp tục và lỗi sẽ được bắt bởi initializeApp.
        }

        const firebaseApp = initializeApp(firebaseConfig);
        db = getFirestore(firebaseApp);
        auth = getAuth(firebaseApp);

        if (typeof __initial_auth_token !== 'undefined') {
            await signInWithCustomToken(auth, __initial_auth_token);
            console.log("Đăng nhập Firebase bằng token tùy chỉnh thành công.");
        } else {
            await signInAnonymously(auth);
            console.log("Đăng nhập Firebase ẩn danh thành công.");
        }

        userId = auth.currentUser?.uid || 'local_anonymous_user';
        // Giữ lại các log quan trọng này để biết trạng thái khởi tạo
        console.log("Firebase User ID:", userId);
        console.log("Canvas App ID (hoặc Local Dev ID):", appId);

    } catch (error) {
        console.error("Lỗi khi khởi tạo Firebase hoặc xác thực:", error);
        db = null;
        auth = null;
    }
}

initializeFirebase();

// =========================================================
// ĐỊNH NGHĨA ROUTES
// =========================================================

app.get('/', async (req, res) => {
    // Giữ lại cảnh báo nếu db chưa sẵn sàng
    if (!db) {
        console.warn("Firestore chưa sẵn sàng. Đang thử lại sau.");
        return res.status(503).send("Dịch vụ hiện không khả dụng. Vui lòng thử lại sau.");
    }

    let galleryItems = [];
    try {
        const galleryCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/galleryItems`);
        const q = query(galleryCollectionRef);
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(doc => {
            galleryItems.push({ id: doc.id, ...doc.data() });
        });
        
        galleryItems.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));

        // Giữ lại log này để biết số lượng mục đã tải
        console.log("Đã tải", galleryItems.length, "mục gallery từ Firestore.");

    } catch (error) {
        console.error("Lỗi khi tải dữ liệu gallery từ Firestore:", error);
        galleryItems = []; 
    }

    res.render('index', {
        pageTitle: 'Trang Web Cá Nhân Của Tôi',
        yourName: 'Nguyễn Văn Tiến',
        galleryItems: galleryItems
    });
});

// =========================================================
// CLOUDINARY WEBHOOK ENDPOINT
// =========================================================

const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET; 

app.post('/cloudinary-webhook', async (req, res) => {
    // Giữ lại log này để biết webhook đã nhận
    console.log("Webhook Cloudinary nhận được.");

    if (!CLOUDINARY_API_SECRET) {
        console.error("Lỗi: CLOUDINARY_API_SECRET không được cấu hình trong biến môi trường.");
        return res.status(500).send("Server Error: Cloudinary API Secret missing.");
    }

    // 1. Xác minh chữ ký Webhook (quan trọng cho bảo mật)
    const signature = req.headers['x-cld-signature'];
    const timestamp = req.headers['x-cld-timestamp'];
    const body = JSON.stringify(req.body);

    if (!signature || !timestamp || !body) {
        console.warn("Webhook không có đủ thông tin xác minh.");
        return res.status(400).send('Bad Request: Missing signature, timestamp, or body.');
    }

    const toSign = `_body=${body}&_timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const expectedSignature = crypto.createHash('sha1').update(toSign).digest('hex');

    if (expectedSignature !== signature) {
        console.error("Webhook Signature Verification Failed!");
        return res.status(403).send('Forbidden: Invalid signature.');
    }
    // Giữ lại log này để xác nhận chữ ký
    console.log("Webhook Signature Verified.");

    // 2. Xử lý dữ liệu từ Webhook
    const data = req.body;
    
    if (data.notification_type === 'upload' || data.notification_type === 'asset_created') {
        const asset = data.asset;

        if (!asset || !asset.public_id || !asset.resource_type || !asset.secure_url) {
            console.warn("Webhook data is incomplete.");
            return res.status(400).send('Bad Request: Incomplete asset data.');
        }

        const galleryItem = {
            publicId: asset.public_id,
            resourceType: asset.resource_type,
            format: asset.format,
            url: asset.secure_url,
            width: asset.width,
            height: asset.height,
            title: asset.context?.custom?.alt || asset.public_id.split('/').pop().replace(/_/g, ' '),
            timestamp: serverTimestamp()
        };

        if (asset.resource_type === 'video') {
            galleryItem.thumbnailUrl = asset.secure_url.replace('/video/upload/', '/video/upload/w_400,h_300,c_fill,f_jpg,vc_auto/') + '.jpg';
        } else if (asset.resource_type === 'image' || asset.resource_type === 'gif') {
            galleryItem.thumbnailUrl = asset.secure_url.replace('/image/upload/', '/image/upload/w_400,h_300,c_fill,q_auto,f_auto/');
        }

        try {
            if (!db) {
                console.error("Firestore chưa được khởi tạo khi nhận webhook.");
                return res.status(500).send("Server Error: Database not ready.");
            }
            const galleryCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/galleryItems`);
            await addDoc(galleryCollectionRef, galleryItem);
            // Giữ lại log này để xác nhận đã thêm vào Firestore
            console.log(`Đã thêm mục gallery '${galleryItem.publicId}' vào Firestore.`);
            res.status(200).send('Webhook received and processed.');
        } catch (error) {
            console.error("Lỗi khi lưu dữ liệu vào Firestore:", error);
            res.status(500).send('Internal Server Error.');
        }
    } else {
        // Giữ lại log này nếu nhận webhook không phải upload
        console.log("Webhook nhận được nhưng không phải sự kiện upload/asset_created. Loại:", data.notification_type);
        res.status(200).send('Webhook received, but not an upload event.');
    }
});


// Định nghĩa cổng và khởi động máy chủ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    // Giữ lại log này để biết server đã chạy
    console.log(`Server đang chạy trên cổng ${PORT}`);
    console.log(`Truy cập tại: http://localhost:${PORT}`);
});

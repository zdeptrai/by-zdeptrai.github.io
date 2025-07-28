// Chờ cho toàn bộ trang web (DOM) được tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Lấy tham chiếu đến phần tử canvas mà chúng ta đã đặt trong index.html
    const canvas = document.getElementById('fluid-canvas');

    // Kiểm tra xem trình duyệt có hỗ trợ WebGL hay không
    // (WebGL là công nghệ cần thiết để chạy hiệu ứng này)
    if (!canvas || (!canvas.getContext('webgl') && !canvas.getContext('experimental-webgl'))) {
        console.error('Trình duyệt của bạn không hỗ trợ WebGL. Hiệu ứng nước sẽ không hiển thị.');
        // Bạn có thể thêm mã ở đây để hiển thị một thông báo cho người dùng
        // hoặc thay thế bằng một nền tĩnh nếu muốn.
        return; // Dừng lại nếu không hỗ trợ WebGL
    }

    // --- Bắt đầu phần quan trọng nhất: Làm cho hiệu ứng phản ứng với mọi thao tác ---

    // Chúng ta cần thay đổi cách hiệu ứng nước lắng nghe các sự kiện chuột và chạm.
    // Bình thường, nó chỉ lắng nghe trên chính canvas.
    // Để nó phản ứng với MỌI di chuyển trên trang, chúng ta sẽ làm 2 việc:
    // 1. Đảm bảo canvas chiếm toàn màn hình và nằm dưới cùng (đã làm ở CSS).
    // 2. Thay đổi mã nguồn của hiệu ứng để nó lắng nghe trên cửa sổ (window)
    //    thay vì chỉ trên canvas.

    // Vì bạn đã sao chép `fluid-simulation.js` từ dự án gốc,
    // chúng ta sẽ cần chỉnh sửa trực tiếp tệp đó một chút để nó hoạt động đúng ý.

    // **Hướng dẫn sửa đổi trực tiếp tệp `fluid-simulation.js`:**
    // Hãy mở tệp `fluid-simulation.js` (tệp mà bạn đã đổi tên từ script.js gốc của dự án)
    // bằng trình soạn thảo văn bản (Notepad, VS Code...).
    // Trong tệp đó, tìm và thay đổi các dòng sau:

    // A. Thay đổi các sự kiện chuột:
    // Tìm dòng hoặc đoạn mã tương tự như:
    // canvas.addEventListener('mousemove', pointerMove);
    // canvas.addEventListener('mousedown', pointerDown);
    // canvas.addEventListener('mouseup', pointerUp);
    // THAY THẾ CHÚNG THÀNH:
    // window.addEventListener('mousemove', pointerMove);
    // window.addEventListener('mousedown', pointerDown);
    // window.addEventListener('mouseup', pointerUp);

    // B. Thay đổi các sự kiện chạm (cho điện thoại/máy tính bảng):
    // Tìm dòng hoặc đoạn mã tương tự như:
    // canvas.addEventListener('touchstart', pointerDown);
    // canvas.addEventListener('touchmove', pointerMove);
    // canvas.addEventListener('touchend', pointerUp);
    // THAY THẾ CHÚNG THÀNH:
    // window.addEventListener('touchstart', pointerDown);
    // window.addEventListener('touchmove', pointerMove);
    // window.addEventListener('touchend', pointerUp);

    // C. Điều chỉnh cách lấy tọa độ (RẤT QUAN TRỌNG):
    // Sau khi bạn đã thay đổi từ 'canvas' sang 'window', các hàm xử lý sự kiện
    // (như `pointerMove`, `pointerDown`, `pointerUp`) có thể đang sử dụng
    // `event.offsetX` và `event.offsetY`.
    // Khi lắng nghe trên `window`, chúng ta cần sử dụng `event.clientX` và `event.clientY`
    // vì chúng cho biết vị trí chuột/chạm so với toàn bộ cửa sổ trình duyệt,
    // không phải so với một phần tử cụ thể.
    // Hầu hết các thư viện WebGL Fluid đã tính toán tốt điều này,
    // nhưng nếu hiệu ứng không hoạt động, hãy tìm trong `fluid-simulation.js`
    // các đoạn mã xử lý tọa độ chuột/chạm và đảm bảo chúng sử dụng `clientX` và `clientY`.

    // Ví dụ: bên trong hàm `pointerMove` (hoặc tên tương tự) trong fluid-simulation.js
    // bạn có thể thấy:
    // let x = e.offsetX;
    // let y = e.offsetY;
    // THAY ĐỔI THÀNH:
    // let x = e.clientX;
    // let y = e.clientY;

    // Hoặc tương tự cho `pointerDown` và `pointerUp`.

    // --- Lưu ý về hiệu suất và trải nghiệm người dùng ---
    // Việc lắng nghe sự kiện trên `window` có thể tốn tài nguyên hơn một chút,
    // nhưng với hiệu ứng này thì thường không đáng kể.
    // Nếu bạn muốn các nút bấm hoặc form trên trang web của mình vẫn có thể
    // nhấp/chạm được, bạn không cần làm gì thêm, vì các sự kiện sẽ vẫn được
    // chuyển đến các phần tử đó trước khi đến `window`.

});
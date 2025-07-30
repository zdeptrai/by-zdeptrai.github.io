document.addEventListener('DOMContentLoaded', () => {
    const skillBars = document.querySelectorAll('.skill-progress-item');

    skillBars.forEach(item => {
        const percentageSpan = item.querySelector('.skill-name-level span:last-child');
        const fillBar = item.querySelector('.progress-bar-fill');

        if (percentageSpan && fillBar) {
            const percentageText = percentageSpan.textContent;
            // Lấy giá trị phần trăm (ví dụ: "90%" sẽ thành 90)
            const percentage = parseFloat(percentageText.replace('%', ''));

            if (!isNaN(percentage)) {
                // 1. Đặt chiều rộng của thanh tiến độ dựa trên phần trăm
                fillBar.style.width = percentage + '%';

                // 2. Tính toán màu sắc dựa trên phần trăm
                // Chúng ta sẽ tạo một gradient màu từ Xanh lam (thấp) sang Đỏ (cao) thông qua màu Tím/Hồng
                // Điều này giúp tránh màu xanh lá cây thường xuất hiện khi chuyển màu trực tiếp bằng HSL qua vòng tròn màu.

                let r, g, b;

                // Interpolate Red component (tăng từ 0 đến 255)
                r = Math.round(percentage * 2.55); // 0% -> 0, 100% -> 255

                // Interpolate Blue component (giảm từ 255 về 0)
                b = Math.round(255 - (percentage * 2.55)); // 0% -> 255, 100% -> 0

                // Green component giữ nguyên 0 để tạo ra màu từ Xanh lam qua Tím đến Đỏ
                g = 0;

                // Áp dụng màu nền đã tính toán
                fillBar.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            }
        }
    });
});
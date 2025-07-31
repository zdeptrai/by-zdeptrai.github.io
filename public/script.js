document.addEventListener('DOMContentLoaded', () => {
    // =========================================================
    // SKILL BARS FUNCTIONALITY
    // =========================================================
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

    // =========================================================
    // SMOOTH SCROLLING FUNCTIONALITY
    // =========================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Ngăn chặn hành vi nhảy tức thì mặc định

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth' // Cuộn mượt mà
            });
        });
    });

    // =========================================================
    // GALLERY LIGHTBOX FUNCTIONALITY
    // =========================================================
    const galleryLightbox = document.getElementById('gallery-lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxGif = document.getElementById('lightbox-gif'); // Assuming you might handle GIFs differently if needed
    const lightboxTitle = document.getElementById('lightbox-title');
    const closeBtn = document.querySelector('#gallery-lightbox .close-btn');
    const prevItemBtn = document.querySelector('#gallery-lightbox .prev-item');
    const nextItemBtn = document.querySelector('#gallery-lightbox .next-item');

    let galleryItemsData = []; // To store the parsed gallery items for navigation
    let currentIndex = 0;

    // Function to show the lightbox with specific content
    function showLightbox(index) {
        currentIndex = index;
        const item = galleryItemsData[currentIndex];

        // Hide all media types first
        lightboxImage.style.display = 'none';
        lightboxVideo.style.display = 'none';
        lightboxGif.style.display = 'none';
        lightboxVideo.pause(); // Pause any currently playing video
        lightboxVideo.currentTime = 0; // Reset video to start

        // Set the title
        lightboxTitle.textContent = item.title;

        // Display the correct media type
        if (item.resourceType === 'image') {
            lightboxImage.src = item.fullUrl;
            lightboxImage.style.display = 'block';
        } else if (item.resourceType === 'video') {
            lightboxVideo.src = item.fullUrl;
            lightboxVideo.style.display = 'block';
            lightboxVideo.load(); // Reload video to ensure it plays
            lightboxVideo.play();
        } else if (item.resourceType === 'gif') {
            // For GIFs, we'll treat them as images for display in the lightbox
            lightboxImage.src = item.fullUrl;
            lightboxImage.style.display = 'block';
        }

        galleryLightbox.style.display = 'flex'; // Show lightbox using flex for centering
        document.body.style.overflow = 'hidden'; // Prevent main page scrolling
    }

    // Function to hide the lightbox
    function hideLightbox() {
        galleryLightbox.style.display = 'none';
        lightboxVideo.pause();
        lightboxVideo.currentTime = 0; // Reset video to start
        document.body.style.overflow = ''; // Allow main page scrolling
    }

    // Function to navigate through gallery items
    function navigateGallery(direction) {
        currentIndex += direction;
        if (currentIndex < 0) {
            currentIndex = galleryItemsData.length - 1;
        } else if (currentIndex >= galleryItemsData.length) {
            currentIndex = 0;
        }
        showLightbox(currentIndex);
    }

    // Event Listeners for Gallery Items
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        // Populate galleryItemsData array on page load
        // This assumes that the 'gallery-item' elements are rendered with data attributes
        galleryItemsData.push({
            fullUrl: item.dataset.fullUrl,
            resourceType: item.dataset.resourceType,
            title: item.dataset.title,
            index: index // Store index for navigation
        });

        item.addEventListener('click', () => {
            showLightbox(index);
        });
    });

    // Event Listeners for Lightbox Controls
    closeBtn.addEventListener('click', hideLightbox);
    prevItemBtn.addEventListener('click', () => navigateGallery(-1));
    nextItemBtn.addEventListener('click', () => navigateGallery(1));

    // Close lightbox when clicking outside content area
    galleryLightbox.addEventListener('click', (e) => {
        if (e.target === galleryLightbox) {
            hideLightbox();
        }
    });

    // Close lightbox with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && galleryLightbox.style.display === 'flex') {
            hideLightbox();
        }
    });
});

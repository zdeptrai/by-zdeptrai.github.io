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
            const percentage = parseFloat(percentageText.replace('%', ''));

            if (!isNaN(percentage)) {
                fillBar.style.width = percentage + '%';
                let r, g, b;
                r = Math.round(percentage * 2.55);
                b = Math.round(255 - (percentage * 2.55));
                g = 0;
                fillBar.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            }
        }
    });

    // =========================================================
    // SMOOTH SCROLLING FUNCTIONALITY
    // =========================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // =========================================================
    // GALLERY LIGHTBOX FUNCTIONALITY (UPDATED)
    // =========================================================
    const galleryLightbox = document.getElementById('gallery-lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxTitle = document.getElementById('lightbox-title');
    const closeBtn = document.querySelector('#gallery-lightbox .close-btn');
    const prevItemBtn = document.querySelector('#gallery-lightbox .prev-item');
    const nextItemBtn = document.querySelector('#gallery-lightbox .next-item');
    const downloadBtn = document.getElementById('download-btn');
    const copyUrlBtn = document.getElementById('copy-url-btn');

    let galleryItemsData = [];
    let currentIndex = 0;

    // Function to show the lightbox with specific content
    function showLightbox(index) {
        currentIndex = index;
        const item = galleryItemsData[currentIndex];

        lightboxImage.style.display = 'none';
        lightboxVideo.style.display = 'none';
        lightboxVideo.pause();
        lightboxVideo.currentTime = 0;

        lightboxTitle.textContent = item.title;
        
        // Update utility buttons' data-url attribute
        downloadBtn.href = item.fullUrl;
        copyUrlBtn.setAttribute('data-url', item.fullUrl);

        if (item.resourceType === 'image') {
            lightboxImage.src = item.fullUrl;
            lightboxImage.style.display = 'block';
            downloadBtn.download = item.title + '.jpg'; // Suggest a filename
        } else if (item.resourceType === 'video') {
            lightboxVideo.src = item.fullUrl;
            lightboxVideo.style.display = 'block';
            lightboxVideo.load();
            lightboxVideo.play();
            downloadBtn.download = item.title + '.mp4'; // Suggest a filename
        }

        galleryLightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Function to hide the lightbox
    function hideLightbox() {
        galleryLightbox.style.display = 'none';
        lightboxVideo.pause();
        lightboxVideo.currentTime = 0;
        document.body.style.overflow = '';
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

    // Event listener for copy URL button
    copyUrlBtn.addEventListener('click', async () => {
        const url = copyUrlBtn.getAttribute('data-url');
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(url);
                alert('URL đã được sao chép vào clipboard!');
            } catch (err) {
                console.error('Không thể sao chép URL:', err);
                alert('Không thể sao chép URL. Vui lòng thử lại.');
            }
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                alert('URL đã được sao chép vào clipboard!');
            } catch (err) {
                console.error('Không thể sao chép URL:', err);
                alert('Không thể sao chép URL. Vui lòng thử lại.');
            }
            document.body.removeChild(textArea);
        }
    });

    // Populate galleryItemsData array on page load
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        galleryItemsData.push({
            fullUrl: item.dataset.fullUrl,
            resourceType: item.dataset.resourceType,
            title: item.dataset.title,
            index: index
        });

        item.addEventListener('click', () => {
            showLightbox(index);
        });
    });

    // Event Listeners for Lightbox Controls
    closeBtn.addEventListener('click', hideLightbox);
    prevItemBtn.addEventListener('click', () => navigateGallery(-1));
    nextItemBtn.addEventListener('click', () => navigateGallery(1));

    galleryLightbox.addEventListener('click', (e) => {
        if (e.target === galleryLightbox) {
            hideLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (galleryLightbox.style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                navigateGallery(-1);
            } else if (e.key === 'ArrowRight') {
                navigateGallery(1);
            } else if (e.key === 'Escape') {
                hideLightbox();
            }
        }
    });
});

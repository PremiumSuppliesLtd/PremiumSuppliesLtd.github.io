/**
 * Brands Page Scrollytelling Logic
 */

const brandsConfig = {
    frameCount: 192,
    images: [],
    loadedCount: 0,
    currentFrame: 0,
    canvas: null,
    ctx: null,
    scrollContainer: null,
    sectionHeight: 0, // Height of the scroll container
    imagesPath: "FV MANGO Sequence/", // Adjust path based on actual location relative to index.html
    imagePrefix: "", // Using numbered files directly 00001.jpg
    imageSuffix: ".jpg",
    isLoaded: false
};

// Initialize the Brands page
function initBrandsPage() {
    brandsConfig.canvas = document.getElementById('brands-canvas');
    if (!brandsConfig.canvas) {
        console.error("Brands canvas not found!");
        return;
    }
    brandsConfig.ctx = brandsConfig.canvas.getContext('2d');
    brandsConfig.scrollContainer = document.getElementById('brands-scroll-container');

    // Set initial canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Start Loading Images
    preloadImages();

    // Bind Scroll Event
    // We attach to window because the main page body scrolls
    window.addEventListener('scroll', handleScroll);
}

function preloadImages() {
    const loaderText = document.querySelector('.loader-text');

    for (let i = 1; i <= brandsConfig.frameCount; i++) {
        const img = new Image();
        // Pad number with zeros to 5 digits (e.g. 00001)
        const frameNum = String(i).padStart(5, '0');
        img.src = `${brandsConfig.imagesPath}${frameNum}${brandsConfig.imageSuffix}`;

        img.onload = () => {
            brandsConfig.loadedCount++;
            if (loaderText) {
                const pct = Math.round((brandsConfig.loadedCount / brandsConfig.frameCount) * 100);
                loaderText.textContent = `Loading WpDev sequence... ${pct}%`;
            }
            if (brandsConfig.loadedCount === brandsConfig.frameCount) {
                finishLoading();
            }
        };

        img.onerror = () => {
            console.error(`Failed to load frame ${i}`);
            // Still count it as loaded to avoid blocking
            brandsConfig.loadedCount++;
            if (brandsConfig.loadedCount === brandsConfig.frameCount) {
                finishLoading();
            }
        };

        brandsConfig.images.push(img);
    }
}

function finishLoading() {
    brandsConfig.isLoaded = true;
    const loader = document.getElementById('brands-loader');
    if (loader) loader.classList.add('hidden');

    // Initial draw
    requestAnimationFrame(() => drawFrame(0));
}

function resizeCanvas() {
    if (!brandsConfig.canvas) return;

    // Fill the viewport
    brandsConfig.canvas.width = window.innerWidth * window.devicePixelRatio;
    brandsConfig.canvas.height = window.innerHeight * window.devicePixelRatio;

    // Force redraw
    if (brandsConfig.isLoaded) {
        drawFrame(brandsConfig.currentFrame);
    }
}

function drawFrame(index) {
    if (index < 0 || index >= brandsConfig.frameCount) return;

    const img = brandsConfig.images[index];
    if (!img) return;

    const canvas = brandsConfig.canvas;
    const ctx = brandsConfig.ctx;
    const w = canvas.width;
    const h = canvas.height;

    // Maintain aspect ratio (contain)
    const imgAspect = img.width / img.height;
    const canvasAspect = w / h;

    let drawW, drawH, offsetX, offsetY;

    if (canvasAspect > imgAspect) {
        // Canvas is wider than image -> limit by height
        drawH = h;
        drawW = h * imgAspect;
        offsetY = 0;
        offsetX = (w - drawW) / 2;
    } else {
        // Canvas is taller than image -> limit by width
        drawW = w;
        drawH = w / imgAspect;
        offsetX = 0;
        offsetY = (h - drawH) / 2;
    }

    ctx.clearRect(0, 0, w, h);
    // ctx.imageSmoothingEnabled = true; // Default is usually true
    // ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

function handleScroll() {
    if (!brandsConfig.isLoaded) return;

    // Only process if Brands page is visible
    const page = document.getElementById('page-brands');
    if (page.style.display === 'none') return;

    const container = brandsConfig.scrollContainer;
    if (!container) return;

    // Calculate progress relative to the container in the document
    const rect = container.getBoundingClientRect();
    const scrollTop = -rect.top; // How far we've scrolled into the container
    const scrollHeight = rect.height - window.innerHeight; // Total scrollable distance

    if (scrollHeight <= 0) return;

    let progress = scrollTop / scrollHeight;
    progress = Math.max(0, Math.min(1, progress)); // Clamp 0 to 1

    // Map to frame
    const frameIndex = Math.floor(progress * (brandsConfig.frameCount - 1));

    if (frameIndex !== brandsConfig.currentFrame) {
        brandsConfig.currentFrame = frameIndex;
        requestAnimationFrame(() => drawFrame(frameIndex));
    }

    updateOverlays(progress);
}

function updateOverlays(progress) {
    // 0% - Title
    toggleOverlay('overlay-1', progress >= 0 && progress < 0.2);

    // 25% - Precision
    toggleOverlay('overlay-2', progress >= 0.2 && progress < 0.5);

    // 60% - Layered
    toggleOverlay('overlay-3', progress >= 0.5 && progress < 0.85);

    // 90% - Scroll back
    toggleOverlay('overlay-4', progress >= 0.85);
}

function toggleOverlay(id, isActive) {
    const el = document.getElementById(id);
    if (!el) return;

    if (isActive) {
        el.classList.add('active');
    } else {
        el.classList.remove('active');
    }
}

// Hook into existing navigation
// Note: We need to make sure initBrandsPage is called when needed or just once on load.
// We'll expose it globally so the main script can call it if needed, or we just run it.
window.initBrandsPage = initBrandsPage;

// Since resources are heavy, we might want to lazy init when the page is first shown
let brandsInitialized = false;
function loadBrandsIfNeeded() {
    if (!brandsInitialized) {
        initBrandsPage();
        brandsInitialized = true;
    }
}

// Expose for nav button
window.openBrandsPage = function (btn) {
    showPage('page-brands', btn);
    loadBrandsIfNeeded();
    // Force a resize/scroll check
    setTimeout(() => {
        resizeCanvas();
        handleScroll();
    }, 100);
};

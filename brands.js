/**
 * Brands Page Scrollytelling Logic (Multi-Sequence Support)
 */

const brandSequences = [
    {
        id: 'fv',
        containerId: 'container-fv',
        canvasId: 'canvas-fv',
        loaderId: 'loader-fv',
        frameCount: 192,
        imagesPath: "FV MANGO Sequence/",
        imagePrefix: "",
        imageSuffix: ".jpg",
        images: [],
        loadedCount: 0,
        currentFrame: 0,
        isLoaded: false,
        ctx: null,
        canvas: null,
        container: null,
        overlays: [
            { id: 'fv-overlay-1', start: 0, end: 0.2 },
            { id: 'fv-overlay-2', start: 0.2, end: 0.5 },
            { id: 'fv-overlay-3', start: 0.5, end: 0.85 },
            { id: 'fv-overlay-4', start: 0.85, end: 1.0 } // 1.0 implies until end or next
        ]
    },
    {
        id: 'frosti',
        containerId: 'container-frosti',
        canvasId: 'canvas-frosti',
        loaderId: 'loader-frosti',
        frameCount: 192,
        imagesPath: "Frosti Berries/",
        imagePrefix: "",
        imageSuffix: ".jpg",
        images: [],
        loadedCount: 0,
        currentFrame: 0,
        isLoaded: false,
        ctx: null,
        canvas: null,
        container: null,
        overlays: [
            { id: 'frosti-overlay-1', start: 0, end: 0.2 },
            { id: 'frosti-overlay-2', start: 0.2, end: 0.5 },
            { id: 'frosti-overlay-3', start: 0.5, end: 0.85 },
            { id: 'frosti-overlay-4', start: 0.85, end: 1.0 }
        ]
    },
    {
        id: 'nuziwa',
        containerId: 'container-nuziwa',
        canvasId: 'canvas-nuziwa',
        loaderId: 'loader-nuziwa',
        frameCount: 192,
        imagesPath: "Nuziwa Almond/",
        imagePrefix: "",
        imageSuffix: ".jpg",
        images: [],
        loadedCount: 0,
        currentFrame: 0,
        isLoaded: false,
        ctx: null,
        canvas: null,
        container: null,
        overlays: [
            { id: 'nuziwa-overlay-1', start: 0, end: 0.2 },
            { id: 'nuziwa-overlay-2', start: 0.2, end: 0.5 },
            { id: 'nuziwa-overlay-3', start: 0.5, end: 0.85 },
            { id: 'nuziwa-overlay-4', start: 0.85, end: 1.0 }
        ]
    },
    {
        id: 'kericho',
        containerId: 'container-kericho',
        canvasId: 'canvas-kericho',
        loaderId: 'loader-kericho',
        frameCount: 192,
        imagesPath: "Kericho Gold/",
        imagePrefix: "",
        imageSuffix: ".jpg",
        images: [],
        loadedCount: 0,
        currentFrame: 0,
        isLoaded: false,
        ctx: null,
        canvas: null,
        container: null,
        overlays: [
            { id: 'kericho-overlay-1', start: 0, end: 0.2 },
            { id: 'kericho-overlay-2', start: 0.2, end: 0.5 },
            { id: 'kericho-overlay-3', start: 0.5, end: 0.85 },
            { id: 'kericho-overlay-4', start: 0.85, end: 1.0 }
        ]
    }
];

// Initialize the Brands page
function initBrandsPage() {
    brandSequences.forEach(seq => {
        seq.canvas = document.getElementById(seq.canvasId);
        seq.container = document.getElementById(seq.containerId);

        if (!seq.canvas || !seq.container) {
            console.error(`Elements not found for sequence: ${seq.id}`);
            return;
        }

        seq.ctx = seq.canvas.getContext('2d');

        // Start Loading Images
        preloadImages(seq);
    });

    // Set initial canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Bind Scroll Event
    window.addEventListener('scroll', handleScroll);
}

function preloadImages(seq) {
    const loaderText = document.querySelector(`#${seq.loaderId} .loader-text`);

    for (let i = 1; i <= seq.frameCount; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(5, '0');
        img.src = `${seq.imagesPath}${frameNum}${seq.imageSuffix}`;

        img.onload = () => {
            seq.loadedCount++;
            if (loaderText) {
                const pct = Math.round((seq.loadedCount / seq.frameCount) * 100);
                loaderText.textContent = `Loading... ${pct}%`;
            }
            if (seq.loadedCount === seq.frameCount) {
                finishLoading(seq);
            }
        };

        img.onerror = () => {
            console.error(`Failed to load frame ${i} for ${seq.id}`);
            seq.loadedCount++;
            if (seq.loadedCount === seq.frameCount) {
                finishLoading(seq);
            }
        };

        seq.images.push(img);
    }
}

function finishLoading(seq) {
    seq.isLoaded = true;
    const loader = document.getElementById(seq.loaderId);
    if (loader) loader.classList.add('hidden');

    // Initial draw
    requestAnimationFrame(() => drawFrame(seq, 0));
}

function resizeCanvas() {
    brandSequences.forEach(seq => {
        if (!seq.canvas) return;

        // Fill the viewport
        seq.canvas.width = window.innerWidth * window.devicePixelRatio;
        seq.canvas.height = window.innerHeight * window.devicePixelRatio;

        // Force redraw if loaded
        if (seq.isLoaded) {
            drawFrame(seq, seq.currentFrame);
        }
    });
}

function drawFrame(seq, index) {
    if (index < 0 || index >= seq.frameCount) return;

    const img = seq.images[index];
    if (!img) return;

    const canvas = seq.canvas;
    const ctx = seq.ctx;
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
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

function handleScroll() {
    // Only process if Brands page is visible
    const page = document.getElementById('page-brands');
    if (page.style.display === 'none') return;

    brandSequences.forEach(seq => {
        if (!seq.isLoaded || !seq.container) return;

        const rect = seq.container.getBoundingClientRect();
        const scrollTop = -rect.top; // How far we've scrolled into the container
        const scrollHeight = rect.height - window.innerHeight; // Total scrollable distance

        // If untracked or totally out of view logic can be added here, 
        // but for continuous scrolling we just check bounds:

        // Simple Viewport Check: Is any part of the container actionable?
        // We only animate if we are actively scrolling INSIDE this container
        // But we must clamp 0 or 1 if we are above or below to ensure it finishes or sits at start

        if (scrollTop < -window.innerHeight || scrollTop > scrollHeight + window.innerHeight) {
            // Far out of view, maybe skip drawing? 
            // For now, we process to ensure state is correct (e.g. if we scrolled fast past it)
        }

        let progress = scrollTop / scrollHeight;
        progress = Math.max(0, Math.min(1, progress)); // Clamp 0 to 1

        const frameIndex = Math.floor(progress * (seq.frameCount - 1));

        if (frameIndex !== seq.currentFrame) {
            seq.currentFrame = frameIndex;
            requestAnimationFrame(() => drawFrame(seq, frameIndex));
        }

        updateOverlays(seq, progress);
    });
}

function updateOverlays(seq, progress) {
    seq.overlays.forEach(overlay => {
        const isActive = progress >= overlay.start && progress < overlay.end;

        // Special case for last item to stay active until very end if desired, 
        // or strictly follow ranges. The config uses 0.85 to 1.0.
        // If we want the last one to persist:
        if (overlay.end === 1.0 && progress >= overlay.start) {
            toggleOverlay(overlay.id, true);
        } else {
            toggleOverlay(overlay.id, isActive);
        }
    });
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

// Global Init
window.initBrandsPage = initBrandsPage;

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

// Feature options - update these paths to match your actual files
const getImageUrl = (path) => {
    return path;
};

// Force reload an image
function forceImageReload(imgElement, src) {
    imgElement.src = src;
}

const FEATURE_OPTIONS = {
    head: Array.from({ length: 7 }, (_, i) => ({
        id: `head${i + 1}`,
        baseSrc: `assets/head/head${i + 1}.png`,
        name: `Head ${i + 1}`
    })),
    eyes: Array.from({ length: 7 }, (_, i) => ({
        id: `eyes${i + 1}`,
        baseSrc: `assets/eyes/eyes${i + 1}.png`,
        name: `Eyes ${i + 1}`
    })),
    nose: Array.from({ length: 10 }, (_, i) => ({
        id: `nose${i + 1}`,
        baseSrc: `assets/nose/nose${i + 1}.png`,
        name: `Nose ${i + 1}`
    })),
    mouth: Array.from({ length: 14 }, (_, i) => ({
        id: `mouth${i + 1}`,
        baseSrc: `assets/mouth/mouth${i + 1}.png`,
        name: `Mouth ${i + 1}`
    })),
    hair: Array.from({ length: 10 }, (_, i) => ({
        id: `hair${i + 1}`,
        baseSrc: `assets/hair/hair${i + 1}.png`,
        name: `Hair ${i + 1}`
    }))
};

// State
let currentFeature = 'head';
let selectedFeatures = {
    head: null,
    eyes: null,
    nose: null,
    mouth: null,
    hair: null
};
let loadedImages = new Map(); // Store loaded images

// DOM Elements
const faceSvg = document.getElementById('face-svg');
const faceSvgCopy1 = document.getElementById('face-svg-copy-1');
const faceSvgCopy2 = document.getElementById('face-svg-copy-2');
const faceSvgCopy3 = document.getElementById('face-svg-copy-3');
const featureOptions = document.querySelector('.feature-options');
const tabs = document.querySelectorAll('.tab');
const randomizeButton = document.getElementById('randomize');
const printButton = document.getElementById('print');
const nameInput = document.getElementById('name-input');
const nameDisplay = document.getElementById('name-display');
const nameDisplayCopy1 = document.getElementById('name-display-copy-1');
const nameDisplayCopy2 = document.getElementById('name-display-copy-2');
const nameDisplayCopy3 = document.getElementById('name-display-copy-3');

// Preload all feature images
function preloadAllImages() {
    Object.values(FEATURE_OPTIONS).forEach(options => {
        options.forEach(option => {
            if (!loadedImages.has(option.baseSrc)) {
                const image = new Image();
                image.onload = () => {
                    loadedImages.set(option.baseSrc, image);
                };
                image.src = option.baseSrc;
            }
        });
    });
}

// Initialize
function init() {
    // Preload all images
    preloadAllImages();

    // Set up tab click handlers
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFeature = tab.dataset.feature;
            updateFeatureOptions();
        });
    });

    // Set up randomize button
    randomizeButton.addEventListener('click', randomizeFeatures);

    // Set up print button
    printButton.addEventListener('click', downloadFace);

    // Set up name input
    nameInput.addEventListener('input', (e) => {
        const name = e.target.value.toUpperCase();
        nameDisplay.textContent = name;
        nameDisplayCopy1.textContent = name;
        nameDisplayCopy2.textContent = name;
        nameDisplayCopy3.textContent = name;
    });

    // Set default features if none are selected
    if (!selectedFeatures.head) {
        Object.keys(FEATURE_OPTIONS).forEach(feature => {
            selectedFeatures[feature] = FEATURE_OPTIONS[feature][0];
        });
    }

    // Update the display
    updateFeatureOptions();
    updateFaceDisplay();
}

// Update feature options display
function updateFeatureOptions() {
    featureOptions.innerHTML = '';
    const options = FEATURE_OPTIONS[currentFeature];
    
    options.forEach(option => {
        const div = document.createElement('div');
        div.className = `feature-option ${selectedFeatures[currentFeature]?.id === option.id ? 'selected' : ''}`;
        const img = document.createElement('img');
        img.alt = option.name;
        div.appendChild(img);
        
        // Use cached image if available
        if (loadedImages.has(option.baseSrc)) {
            img.src = loadedImages.get(option.baseSrc).src;
        } else {
            // Load image and store it
            const image = new Image();
            image.onload = () => {
                img.src = image.src;
                loadedImages.set(option.baseSrc, image);
            };
            image.src = option.baseSrc;
        }
        
        if (selectedFeatures[currentFeature]?.id === option.id) {
            const checkmark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            checkmark.setAttribute('viewBox', '0 0 32 32');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M13 24l-9-9l1.414-1.414L13 21.171L26.586 7.586L28 9L13 24z');
            checkmark.appendChild(path);
            div.appendChild(checkmark);
        }
        
        div.addEventListener('click', () => selectFeature(option));
        featureOptions.appendChild(div);
    });
}

// Select a feature
function selectFeature(option) {
    selectedFeatures[currentFeature] = option;
    updateFeatureOptions();
    updateFaceDisplay();
}

// Update face display
function updateFaceDisplay() {
    faceSvg.innerHTML = '';
    faceSvgCopy1.innerHTML = '';
    faceSvgCopy2.innerHTML = '';
    faceSvgCopy3.innerHTML = '';
    const layerOrder = ['head', 'eyes', 'nose', 'mouth', 'hair'];
    
    layerOrder.forEach(featureType => {
        const feature = selectedFeatures[featureType];
        if (feature) {
            // Create images for all copies
            const createImage = (svgElement) => {
                const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                image.setAttribute('href', feature.baseSrc);
                image.setAttribute('x', '0');
                image.setAttribute('y', '0');
                image.setAttribute('width', '500');
                image.setAttribute('height', '500');
                image.setAttribute('preserveAspectRatio', 'none');
                svgElement.appendChild(image);
            };

            // Add images to all SVGs
            createImage(faceSvg);
            createImage(faceSvgCopy1);
            createImage(faceSvgCopy2);
            createImage(faceSvgCopy3);
        }
    });
}

// Randomize all features
function randomizeFeatures() {
    Object.keys(selectedFeatures).forEach(feature => {
        const options = FEATURE_OPTIONS[feature];
        const randomIndex = Math.floor(Math.random() * options.length);
        selectedFeatures[feature] = options[randomIndex];
    });

    updateFeatureOptions();
    updateFaceDisplay(); // Now we can update immediately since images are already loaded
}

// Download face as PNG
function downloadFace() {
    const canvas = document.createElement('canvas');
    const scale = 2; // Scale factor for higher quality
    canvas.width = 300 * scale; // Reduced width
    canvas.height = 350 * scale; // Reduced height
    const ctx = canvas.getContext('2d');
    
    // Enable high quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const layerOrder = ['head', 'eyes', 'nose', 'mouth', 'hair'];
    const images = layerOrder.map(featureType => {
        const feature = selectedFeatures[featureType];
        if (feature) {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => resolve(img);
                img.src = feature.baseSrc;
            });
        }
        return Promise.resolve(null);
    });

    Promise.all(images).then(loadedImages => {
        // Draw face layers
        loadedImages.forEach(img => {
            if (img) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.width); // Maintain aspect ratio
            }
        });
        
        // Draw name
        ctx.fillStyle = '#014EFF';
        ctx.font = `${24 * scale}px Drowner`; // Reduced font size
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(nameDisplay.textContent, canvas.width / 2, canvas.width + (25 * scale)); // Adjusted position
        
        // Convert to PNG
        const pngUrl = canvas.toDataURL('image/png');
        
        // Open in new tab
        const newTab = window.open();
        newTab.document.write(`
            <html>
                <head>
                    <title>Face Generator - Download</title>
                    <style>
                        @font-face {
                            font-family: 'Drowner';
                            src: url('assets/Drowner-Free.otf') format('opentype');
                            font-weight: normal;
                            font-style: normal;
                            font-display: swap;
                        }
                        body {
                            font-family: 'Drowner', sans-serif;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            margin: 0;
                            padding: 20px;
                            background: #f5f5f5;
                            color: #014EFF;
                        }
                        img {
                            width: 300px;
                            height: auto;
                            margin: 20px 0;
                            border: 2px solid #014EFF;
                        }
                        .instructions {
                            text-align: center;
                            max-width: 300px;
                            line-height: 1.5;
                            margin: 20px 0;
                            font-size: 18px;
                            font-family: 'Drowner', sans-serif;
                        }
                    </style>
                </head>
                <body>
                    <div class="instructions">
                        <p>1. Save to camera roll</p>
                        <p>2. Open Tiny Print app</p>
                        <p>3. Select Photo Printing and print your face!</p>
                    </div>
                    <img src="${pngUrl}" alt="Generated Face">
                </body>
            </html>
        `);
    });
}

// Start the application
init(); 
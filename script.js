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
const downloadButton = document.getElementById('download');
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

    // Set up download button
    downloadButton.addEventListener('click', downloadFace);

    // Set up print button
    printButton.addEventListener('click', printFace);

    // Set up name input
    nameInput.addEventListener('input', (e) => {
        const name = e.target.value;
        nameDisplay.textContent = name;
        [nameDisplayCopy1, nameDisplayCopy2, nameDisplayCopy3].forEach(copy => {
            copy.textContent = name;
        });
    });

    // Generate random face on load
    randomizeFeatures();
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
    // Clear the face SVG
    faceSvg.innerHTML = '';
    
    // Create a new image element
    const faceImage = document.createElement('img');
    faceImage.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentSeed}&${getFeatureParams()}&cache=${Date.now()}`;
    faceImage.style.width = '100%';
    faceImage.style.height = '100%';
    
    // Add the image to the SVG
    faceSvg.appendChild(faceImage);
    
    // Update all copies for printing
    [faceSvgCopy1, faceSvgCopy2, faceSvgCopy3].forEach(copy => {
        copy.innerHTML = '';
        const copyImage = faceImage.cloneNode(true);
        copy.appendChild(copyImage);
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
    canvas.width = 500 * scale;
    canvas.height = 550 * scale; // Increased height to accommodate name
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
        if (nameDisplay.textContent) {
            // Load the IoCaps font
            const font = new FontFace('IoCaps', 'url(assets/IoCaps-Regular.otf)');
            font.load().then(() => {
                document.fonts.add(font);
                ctx.font = `${24 * scale}px IoCaps`; // Scale font size
                ctx.textAlign = 'center';
                ctx.fillStyle = 'black';
                ctx.fillText(nameDisplay.textContent, canvas.width/2, 530 * scale);
                
                // Create download link
                const pngUrl = canvas.toDataURL('image/png', 1.0); // Maximum quality
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = 'face.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        } else {
            // If no name, just download without waiting for font
            const pngUrl = canvas.toDataURL('image/png', 1.0); // Maximum quality
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = 'face.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });
}

// Print face
function printFace() {
    window.print();
}

// Start the application
init(); 
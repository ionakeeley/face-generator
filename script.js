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

// DOM Elements
const faceSvg = document.getElementById('face-svg');
const featureOptions = document.querySelector('.feature-options');
const tabs = document.querySelectorAll('.tab');
const randomizeButton = document.getElementById('randomize');
const downloadButton = document.getElementById('download');
const nameInput = document.getElementById('name-input');
const nameDisplay = document.getElementById('name-display');

// Initialize
function init() {
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

    // Set up name input
    nameInput.addEventListener('input', (e) => {
        nameDisplay.textContent = e.target.value.toUpperCase();
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
        forceImageReload(img, option.baseSrc);
        
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
    // Define the order of layers (back to front)
    const layerOrder = ['head', 'eyes', 'nose', 'mouth', 'hair'];
    
    layerOrder.forEach(featureType => {
        const feature = selectedFeatures[featureType];
        if (feature) {
            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttribute('href', feature.baseSrc);
            image.setAttribute('x', '0');
            image.setAttribute('y', '0');
            image.setAttribute('width', '500');
            image.setAttribute('height', '500');
            image.setAttribute('preserveAspectRatio', 'none');
            faceSvg.appendChild(image);
        }
    });
}

// Randomize all features
function randomizeFeatures() {
    // First update the selected features
    Object.keys(selectedFeatures).forEach(feature => {
        const options = FEATURE_OPTIONS[feature];
        const randomIndex = Math.floor(Math.random() * options.length);
        selectedFeatures[feature] = options[randomIndex];
    });

    // Update the UI immediately
    updateFeatureOptions();

    // Preload all images before updating the display
    const layerOrder = ['head', 'eyes', 'nose', 'mouth', 'hair'];
    const imagePromises = layerOrder.map(featureType => {
        const feature = selectedFeatures[featureType];
        if (feature) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = feature.baseSrc;
            });
        }
        return Promise.resolve(null);
    });

    // Once all images are loaded, update the display
    Promise.all(imagePromises).then(() => {
        updateFaceDisplay();
    });
}

// Download face as PNG
function downloadFace() {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    
    const layerOrder = ['head', 'eyes', 'nose', 'mouth', 'hair'];
    const images = layerOrder.map(featureType => {
        const feature = selectedFeatures[featureType];
        if (feature) {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => resolve(img);
                img.src = getImageUrl(feature.baseSrc);
            });
        }
        return Promise.resolve(null);
    });

    Promise.all(images).then(loadedImages => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        loadedImages.forEach(img => {
            if (img) {
                ctx.drawImage(img, 0, 0, 500, 500);
            }
        });
        
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'face.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

// Start the application
init(); 
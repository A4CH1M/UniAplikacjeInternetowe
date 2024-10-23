// Inicjalizacja mapy Leaflet
const map = L.map('map', { zoomControl: false }).setView([52.2297, 21.0122], 13);
const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Dodanie przycisków zoom jako kontrolki
L.control.zoom({ position: 'topright' }).addTo(map);

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
  }

// Pobieranie lokalizacji użytkownika
document.getElementById('location-button').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            alert(`Twoja lokalizacja to: ${lat}, ${lon}`);
            L.marker([lat, lon]).addTo(map);
            map.setView([lat, lon], 13);
        });
    } else {
        alert("Twoja przeglądarka nie wspiera geolokalizacji.");
    }
});

document.getElementById('download-button').addEventListener('click', () => {
    leafletImage(map, function(err, canvas) {
        if (err) {
            console.error("Błąd przy generowaniu obrazu mapy:", err);
            return;
        }

        const mapCanvas = document.getElementById('map-canvas');
        const context = mapCanvas.getContext('2d');
        mapCanvas.width = canvas.width;
        mapCanvas.height = canvas.height;
        context.drawImage(canvas, 0, 0);
        createPuzzle(mapCanvas);
    });
});

function createPuzzle(canvas) {
    const puzzleSize = 100;
    const pieces = [];

    puzzlePosition = []

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            puzzlePosition.push([i, j]);
        }
    }
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = puzzleSize;
            pieceCanvas.height = puzzleSize;
            const context = pieceCanvas.getContext('2d');
            
            const pos = getRandomInt(puzzlePosition.length);

            // Wycinamy fragment obrazu mapy
            context.drawImage(canvas, col * puzzleSize, row * puzzleSize, puzzleSize, puzzleSize, 0, 0, puzzleSize, puzzleSize);
            
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.style.backgroundImage = `url(${pieceCanvas.toDataURL()})`;
            piece.style.top = `${pos[0] * piece.style.height}px`;
            piece.style.left = `${pos[1] * piece.style.width}px`;
            console.log((r + c) + ' ' + piece.style.top + ' ' + piece.style.top);
            piece.draggable = true;

            puzzlePosition.splice(pos, 1);

            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragover', handleDragOver);
            piece.addEventListener('drop', handleDrop);

            document.getElementById('puzzle-container').appendChild(piece);
            pieces.push(piece);
        }
    }
}

// Obsługa mechanizmu Drag & Drop
let draggedPiece = null;

function handleDragStart(event) {
    draggedPiece = event.target;
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const target = event.target;

    if (target.className === 'puzzle-piece') {
        const tempTop = target.style.top;
        const tempLeft = target.style.left;
        target.style.top = draggedPiece.style.top;
        target.style.left = draggedPiece.style.left;
        draggedPiece.style.top = tempTop;
        draggedPiece.style.left = tempLeft;
        
        checkPuzzleCompletion();
    }
}

// Sprawdzanie czy puzzle są na właściwym miejscu
function checkPuzzleCompletion() {
    let allCorrect = true;
    
    const pieces = document.querySelectorAll('.puzzle-piece');
    pieces.forEach((piece, index) => {
        const correctTop = Math.floor(index / 4) * 100 + 'px';
        const correctLeft = (index % 4) * 100 + 'px';
        
        if (piece.style.top !== correctTop || piece.style.left !== correctLeft) {
            allCorrect = false;
        }
    });
    
    if (allCorrect) {
        new Notification("Gratulacje! Puzzle ułożone poprawnie.");
    }
}

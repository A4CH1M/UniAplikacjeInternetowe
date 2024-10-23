"use strict";

const map = L.map('map', { zoomControl: false }).setView([52.2297, 21.0122], 13);
const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.control.zoom({ position: 'topright' }).addTo(map);

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

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

const createPuzzle = (canvas) => {
    const puzzleSize = 100;
    const pieces = [];

    const puzzlePosition = []

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            puzzlePosition.push([i, j]);
        }
    }
    
    console.log(puzzlePosition[0]);

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = puzzleSize;
            pieceCanvas.height = puzzleSize;
            const context = pieceCanvas.getContext('2d');
            
            const pos = getRandomInt(puzzlePosition.length);

            // console.log(puzzlePosition[pos][0]);

            context.drawImage(canvas, col * puzzleSize, row * puzzleSize, puzzleSize, puzzleSize, 0, 0, puzzleSize, puzzleSize);
            
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.style.backgroundImage = `url(${pieceCanvas.toDataURL()})`;

            document.getElementById('puzzle-container').appendChild(piece);

            const pieceHeight = piece.offsetHeight;
            const pieceWidth = piece.offsetWidth;

            console.log(pieceHeight);
            piece.style.top = `${puzzlePosition[pos][0] * pieceHeight}px`;
            piece.style.left = `${puzzlePosition[pos][1] * pieceWidth}px`;
            // console.log(piece.style.top + ' ' + piece.style.top);
            piece.draggable = true;

            puzzlePosition.splice(pos, 1);

            // console.log(puzzlePosition.length);

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

const handleDragStart = (event) => {
    draggedPiece = event.target;
}

const handleDragOver = (event) => {
    event.preventDefault();
}

const handleDrop = (event) => {
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

const createDropZoneGrid = () => {
    const dropZone = document.getElementById('drop-zone');

    dropZone.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const dropCell = document.createElement('div');
        dropCell.className = 'drop-cell';
        dropCell.style.width = '100px';
        dropCell.style.height = '100px';
        dropCell.style.border = '1px solid black';
        dropCell.addEventListener('dragover', handleDragOver);
        dropCell.addEventListener('drop', handleDropToGrid);
        dropZone.appendChild(dropCell);
    }
}

const handleDropToGrid = (event) => {
    event.preventDefault();
    const dropCell = event.target;

    if (draggedPiece && dropCell.className === 'drop-cell') {
        dropCell.appendChild(draggedPiece);
        draggedPiece.style.position = 'static';
    }
}

// Sprawdzanie czy puzzle są na właściwym miejscu
const checkPuzzleCompletion = () => {
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

document.getElementById('download-button').addEventListener('click', () => {

    document.getElementById('loading-spinner').style.display = 'block';
    // document.getElementById('drop-zone').innerHtml;
    leafletImage(map, function(err, canvas) {
        document.getElementById('loading-spinner').style.display = 'none';
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


createDropZoneGrid();
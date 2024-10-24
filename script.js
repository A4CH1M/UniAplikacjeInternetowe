"use strict";

const map = L.map('map', { zoomControl: false }).setView([52.2297, 21.0122], 13);
const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.control.zoom({ position: 'topright' }).addTo(map);

let piecesPlaced = 0;

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

const notifyUser = (message) => {
    if (!("Notification" in window)) {
        alert("Twoja przeglądarka nie obsługuje powiadomień.");
    }
    else if (Notification.permission === "granted") {
        console.log("LTSK");
        new Notification(message);
    }
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("SKDJLZP");
                new Notification("Gratulacje", {
                    body: "Puzzle ułożone!"
                });
            }
        });
    }
    console.log('No i w pizdu...');
}

document.getElementById('location-button').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            //alert(`Twoja lokalizacja to: ${lat}, ${lon}`);
            L.marker([lat, lon]).addTo(map);
            map.setView([lat, lon], 13);
        });
    } else {
        alert("Twoja przeglądarka nie wspiera geolokalizacji.");
    }
});

// Generowanie mapy i puzzli
document.getElementById('download-button').addEventListener('click', () => {
    document.getElementById('loading-spinner').style.display = 'block';

    document.getElementById('drop-zone').innerHTML = '';
    createDropZoneGrid();

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

const createPuzzle = (canvas) => {

    const puzzleWidth = 150;
    const puzzleHeight = 100; 

    const puzzleContainer = document.getElementById('puzzle-container');
    puzzleContainer.innerHTML = '';


    const puzzlePosition = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            puzzlePosition.push([i, j]);
        }
    }

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = puzzleWidth;
            pieceCanvas.height = puzzleHeight;
            const context = pieceCanvas.getContext('2d');
            context.drawImage(canvas, col * puzzleWidth, row * puzzleHeight, puzzleWidth, puzzleHeight, 0, 0, puzzleWidth, puzzleHeight);

            const piece = document.createElement('div');
            piece.id = `${row * 4 + col}`;
            piece.className = 'puzzle-piece';
            piece.style.backgroundImage = `url(${pieceCanvas.toDataURL()})`;
            piece.style.width = `${puzzleWidth - 2}px`;
            piece.style.height = `${puzzleHeight - 2}px`;

            piece.style.position = 'absolute';

            const pos = getRandomInt(puzzlePosition.length);

            piece.style.top = `${puzzlePosition[pos][0] * puzzleHeight}px`;
            piece.style.left = `${puzzlePosition[pos][1] * puzzleWidth}px`;

            puzzlePosition.splice(pos, 1);

            piece.draggable = true;

            piece.addEventListener('dragstart', handleDragStart);

            puzzleContainer.appendChild(piece);
        }
    }
}

let draggedPiece = null;

const handleDragStart = (event) => {
    draggedPiece = event.target;
}

const handleDragOver = (event) => {
    event.preventDefault();
}

const createDropZoneGrid = () => {
    piecesPlaced = 0;
    const dropZone = document.getElementById('drop-zone');
    dropZone.innerHTML = '';

    for (let i = 0; i < 16; i++) {
        const dropCell = document.createElement('div');
        dropCell.className = 'drop-cell';
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
        piecesPlaced++;
        dropCell.appendChild(draggedPiece);
        draggedPiece.style.position = 'static';
        checkPuzzleCompletion();
    }
}

const checkPuzzleCompletion = () => {
    let allCorrect = true;

    const pieces = document.getElementById('drop-zone').querySelectorAll('.puzzle-piece');

    if (pieces.length != 16) {
        return;
    }

    pieces.forEach((piece, index) => {
        // const correctTop = Math.floor(index / 4) * 100 + 'px';
        // const correctLeft = (index % 4) * 100 + 'px';

        // if (piece.style.top !== correctTop || piece.style.left !== correctLeft) {
        //     allCorrect = false;
        // }
        console.log("piece id: " + piece.id + " curr idx: " + index);
        if (piece.id != index) {
            allCorrect = false;
        }
    });

    if (allCorrect) {
        //console.log("Gratulacje! Puzzle ułożone poprawnie.")
        notifyUser();
    }
}

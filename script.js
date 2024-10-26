"use strict";

const map = L.map('map', { zoomControl: false }).setView([52.2297, 21.0122], 13);
const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.control.zoom({ position: 'topright' }).addTo(map);

const requestNotificationPermission = () => {
    if ('Notification' in window) {
        Notification.requestPermission().then((permission) => {
            localStorage.setItem('notificationPermission', permission);
        });
    }
};

const notifyUser = () => {
    const permission = localStorage.getItem('notificationPermission');

    if (permission === 'granted') {
        const options = {
            body: 'Puzzle zostały poprawnie ułożone!',
        };
        new Notification('Gratulacje!', options);
    } else {
        alert('Gratulacje! Puzzle zostały poprawnie ułożone');
    }
};

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

window.addEventListener('load', () => {
    requestNotificationPermission();
});

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

    if (draggedPiece == null) {
        return;
    }

    if (dropCell.className === 'drop-cell') {
        dropCell.appendChild(draggedPiece);
    }
    else if (dropCell.className === 'puzzle-piece') {
        if (draggedPiece === dropCell) {
            return;
        }

        const tmpId = draggedPiece.id;
        const tmpBackground = draggedPiece.style.backgroundImage;
        const top = draggedPiece.style.top;
        const left = draggedPiece.style.left;

        draggedPiece.id = dropCell.id;
        draggedPiece.style.backgroundImage = dropCell.style.backgroundImage;

        dropCell.id = tmpId;
        dropCell.style.backgroundImage = tmpBackground;

        if (draggedPiece.parentElement.id === 'puzzle-container') {
            return;
        }
    }

    draggedPiece.style.position = 'static';
    checkPuzzleCompletion();
}

const finishImage = (pieces) => {
    draggedPiece = null;
    for (let piece of pieces) {
        piece.style.width = '150px';
        piece.style.height = '100px';
        piece.style.border = '0px';
        piece.setAttribute('draggable', false);
        piece.removeEventListener('dragstart', handleDragStart);
    }

    const dropCells = document.getElementById('drop-zone').querySelectorAll('.drop-cell');

    for (let cell of dropCells) {
        cell.style.border = '0px';
    }

}

const checkPuzzleCompletion = () => {
    let allCorrect = true;

    const pieces = document.getElementById('drop-zone').querySelectorAll('.puzzle-piece');

    if (pieces.length != 16) {
        return;
    }

    pieces.forEach((piece, index) => {
        if (piece.id != index) {
            allCorrect = false;
        }
    });

    if (allCorrect) {
        finishImage(pieces)        
        setTimeout(() => {
            notifyUser();
        }, 0);
    }
}

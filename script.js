"use strict";

const map = L.map('map').setView([52.2297, 21.0122], 13);
const tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);

let marker = null;

// requests permission to use notifications
const requestNotificationPermission = () => {
    if ('Notification' in window) {
        Notification.requestPermission();
    }
};

// sends puzzle completion notification to user
const notifyUser = () => {
    if (Notification.permission === 'granted') {
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

// requests permission to use notifications after page loading
window.addEventListener('load', () => {
    requestNotificationPermission();
});

// downloads current location and displays it in #map div
document.getElementById('location-button').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            if (marker != null) {
                marker.remove();
            }
            
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            marker = L.marker([lat, lon]).addTo(map);
            map.setView([lat, lon], 13);
        });
    } else {
        alert("Twoja przeglądarka nie wspiera geolokalizacji.");
    }
});

// downloads map from #map div and creates puzzle pieces
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

// cuts image in canvas into 16 pieces and places them shuffled in #puzzle-container div
const createPuzzle = (canvas) => {
    // puzzle sizes
    const puzzleWidth = 150;
    const puzzleHeight = 100; 

    const puzzleContainer = document.getElementById('puzzle-container');
    puzzleContainer.innerHTML = ''; // clear previous grid (in case there were puzzle pieces)

    // add all posible multiplier permutations into an array
    const offsetMultipliers = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            offsetMultipliers.push([i, j]);
        }
    }

    // puzzle shuffle
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            // cuts piece from canvas
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = puzzleWidth;
            pieceCanvas.height = puzzleHeight;
            const context = pieceCanvas.getContext('2d');
            context.drawImage(canvas, col * puzzleWidth, row * puzzleHeight, puzzleWidth, puzzleHeight, 0, 0, puzzleWidth, puzzleHeight);

            // create next puzzle
            const piece = document.createElement('div');
            piece.id = `${row * 4 + col}`;
            piece.className = 'puzzle-piece';
            piece.style.backgroundImage = `url(${pieceCanvas.toDataURL()})`;
            piece.style.width = `${puzzleWidth - 2}px`;
            piece.style.height = `${puzzleHeight - 2}px`;

            piece.style.position = 'absolute';

            // get offset multiplier and then calculate position in #puzzle-container div
            const pos = getRandomInt(offsetMultipliers.length);
            piece.style.top = `${offsetMultipliers[pos][0] * puzzleHeight}px`;
            piece.style.left = `${offsetMultipliers[pos][1] * puzzleWidth}px`;
        
            offsetMultipliers.splice(pos, 1); // remove used offset multiplier from list

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

// function creates visible grid in drop-zone so that it is clear where destination cells are
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

// drag&drop behaviour after dropping a puzzle
const handleDropToGrid = (event) => {
    event.preventDefault();
    const dropCell = event.target;

    if (draggedPiece == null) {
        return;
    }

    // if puzzle is placed on emplty cell in drop-zone
    if (dropCell.className === 'drop-cell') {
        dropCell.appendChild(draggedPiece);
    }
    // if puzzle is placed on another puzzle
    else if (dropCell.className === 'puzzle-piece') {
        if (draggedPiece === dropCell) {
            return;
        }

        // switch their ids and map image piece
        const tmpId = draggedPiece.id;
        const tmpBackground = draggedPiece.style.backgroundImage;

        draggedPiece.id = dropCell.id;
        draggedPiece.style.backgroundImage = dropCell.style.backgroundImage;

        dropCell.id = tmpId;
        dropCell.style.backgroundImage = tmpBackground;

        // if the piece dragged was not in drop-cell
        if (draggedPiece.parentElement.id === 'puzzle-container') {
            return;
        }
    }

    draggedPiece.style.position = 'static';
    checkPuzzleCompletion();
}

// function combines puzzles into one image 
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

// function checks wether the puzzle is arranged correctly
const checkPuzzleCompletion = () => {
    let allCorrect = true;

    const pieces = document.getElementById('drop-zone').querySelectorAll('.puzzle-piece');

    // check if all pieces are in #drop-zone div
    if (pieces.length != 16) {
        return;
    }

    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].id != i) {
            allCorrect = false;
        }
    }

    if (allCorrect) {
        finishImage(pieces)
        // wait until event handler finishes and then send notification of puzlle completion     
        setTimeout(() => {
            notifyUser();
        }, 0);
    }
}

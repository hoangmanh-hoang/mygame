const questions = [
    { question: "What is the name of a computer program that can perform human tasks? (2 words)", answer: "AI AGENT" },
    { question: "A machine that can carry out complex actions automatically is a __.", answer: "ROBOT" },
    { question: "This device helps you type and enter information into the computer.", answer: "KEYBOARD" },
    { question: "What do you click on to open a file or program?", answer: "ICON" },
    { question: "The main screen of a computer is called the __.", answer: "DESKTOP" },
    { question: "To talk to someone far away using the internet, you can make a video __.", answer: "CALL" },
    { question: "The device that shows you pictures and text from the computer.", answer: "MONITOR" },
    { question: "The small arrow you move on the screen is the __.", answer: "CURSOR" },
    { question: "What is a collection of computers connected together?", answer: "NETWORK" },
    { question: "Finding and fixing mistakes in computer code is called __.", answer: "DEBUGGING" }, // ĐÃ SỬA LỖI Ở ĐÂY
    { question: "The digital space where you can save documents and pictures (2 words).", answer: "CLOUD STORAGE" },
    { question: "A general term for the programs that run on a computer.", answer: "SOFTWARE" },
    { question: "What does 'WWW' stand for?", answer: "WORLD WIDE WEB" },
    { question: "A private digital letter sent over the internet.", answer: "EMAIL" },
    { question: "The button you press on the mouse is the __.", answer: "CLICK" },
    { question: "A series of steps for a computer to solve a problem is an __.", answer: "ALGORITHM" }
];

const OBSTACLE_ANSWER = "AI AGENT";
const OBSTACLE_POINTS = 1000;

let currentQuestionIndex = -1;
let currentTileId = -1;
let scores = { 1: 0, 2: 0 };
let revealedSmallTilesCount = 0; 
const totalSmallTiles = 16; 
let timerInterval;
const TIME_LIMIT = 45; 
let answeredTiles = new Set(); 
let incorrectTiles = new Set(); 

document.addEventListener('DOMContentLoaded', () => {
    createTiles();
    updateScoreDisplay();
});

function createTiles() {
    const grid = document.getElementById('hidden-picture-grid');
    grid.innerHTML = '';
    
    // Tạo 16 ô nhỏ
    for (let i = 1; i <= totalSmallTiles; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.id = `tile-${i}`;
        tile.textContent = i;
        tile.onclick = () => selectTile(i);
        grid.appendChild(tile);
    }
    
    // Tạo Ô Lớn (Chướng Ngại Vật) và thêm vào lưới
    const centerTile = document.createElement('div');
    centerTile.id = 'tile-center';
    centerTile.className = 'tile-large';
    centerTile.textContent = 'OBSTACLE TILE';
    grid.appendChild(centerTile);
}

function updateScoreDisplay() {
    document.getElementById('team1-score').textContent = `Team 1 Score: ${scores[1]}`;
    document.getElementById('team2-score').textContent = `Team 2 Score: ${scores[2]}`;
}

function selectTile(tileIndex) {
    // Các ô trung tâm bị ô lớn che phủ (vị trí 7, 8, 11, 12 trong lưới 4x4)
    if ([7, 8, 11, 12].includes(tileIndex) && !document.getElementById('tile-center').classList.contains('open')) {
        alert("This tile is covered by the Obstacle Tile! You must answer the Obstacle Challenge to reveal it.");
        return;
    }
    
    if (answeredTiles.has(tileIndex) || incorrectTiles.has(tileIndex)) {
        return; 
    }

    currentTileId = tileIndex;
    currentQuestionIndex = tileIndex - 1; 

    document.getElementById('question-text').textContent = `Question ${tileIndex}: ${questions[currentQuestionIndex].question}`;
    document.getElementById('answer-input').value = ''; 
    document.getElementById('feedback').textContent = 'Enter team\'s answer above and Teacher click to confirm correctness.';
    
    const teamButtonsDiv = document.querySelector('#question-modal .team-buttons');
    teamButtonsDiv.innerHTML = `
        <button onclick="checkAnswer(1)">Team 1 Answered</button>
        <button onclick="checkAnswer(2)">Team 2 Answered</button>
    `;

    document.getElementById('question-modal').classList.remove('hidden');
    
    startTimer(TIME_LIMIT);
}

function startTimer(duration) {
    let timer = duration;
    const timerDisplay = document.getElementById('timer-display');
    timerDisplay.textContent = timer;

    clearInterval(timerInterval); 
    timerInterval = setInterval(() => {
        timer--;
        timerDisplay.textContent = timer;

        if (timer <= 5) {
            timerDisplay.style.color = 'red';
        } else {
            timerDisplay.style.color = '#e74c3c';
        }

        if (timer <= 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = "TIME'S UP!";
        }
    }, 1000);
}

function confirmCorrect(teamNumber) {
    clearInterval(timerInterval); 
    
    const points = 100;
    scores[teamNumber] += points;
    document.getElementById('feedback').textContent = `✅ Correct! Team ${teamNumber} scores +${points} points and opens the tile!`;
    
    revealSmallTile(currentTileId, true); 
    updateScoreDisplay();

    setTimeout(() => {
        closeModal();
    }, 1500);
}

function confirmIncorrect(teamNumber) {
    clearInterval(timerInterval); 
    
    const correctAnswer = questions[currentQuestionIndex].answer;
    document.getElementById('feedback').textContent = `❌ Incorrect! Team ${teamNumber} missed. Correct answer: ${correctAnswer}.`;
    
    revealSmallTile(currentTileId, false); 

    setTimeout(() => {
        closeModal();
    }, 3000);
}

function checkAnswer(teamNumber) {
    const userAnswer = document.getElementById('answer-input').value.trim().toUpperCase();
    const correctAnswer = questions[currentQuestionIndex].answer.toUpperCase();
    
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = `**Is this answer correct?**<br>Team Answer: ${userAnswer}<br>Correct Answer: ${correctAnswer}`;
    
    const teamButtonsDiv = document.querySelector('#question-modal .team-buttons');
    teamButtonsDiv.innerHTML = `
        <button class="correct-btn" onclick="confirmCorrect(${teamNumber})">✅ Correct</button>
        <button class="incorrect-btn" onclick="confirmIncorrect(${teamNumber})">❌ Incorrect</button>
    `;
    
    clearInterval(timerInterval); 
}

function revealSmallTile(tileId, isCorrect) {
    const tile = document.getElementById(`tile-${tileId}`);
    if (!tile) return;

    if (isCorrect) {
        if (!answeredTiles.has(tileId)) {
            tile.classList.add('open'); 
            answeredTiles.add(tileId);
            revealedSmallTilesCount++;
        }
    } else {
        if (!answeredTiles.has(tileId) && !incorrectTiles.has(tileId)) {
            tile.classList.add('incorrect'); 
            tile.textContent = '❌';
            incorrectTiles.add(tileId);
        }
    }
    checkWinCondition();
}
// ----------------------------------------------------------------------
function startObstacleChallenge() {
    closeModal();
    document.getElementById('obstacle-answer-input').value = '';
    document.getElementById('obstacle-feedback').textContent = '';
    
    const teamButtonsDiv = document.querySelector('#obstacle-modal .team-buttons');
    teamButtonsDiv.innerHTML = `
        <button onclick="checkObstacleAnswer(1)">Team 1 Answered</button>
        <button onclick="checkObstacleAnswer(2)">Team 2 Answered</button>
    `;
    document.querySelectorAll('#obstacle-modal .team-buttons button').forEach(btn => btn.disabled = false);

    document.getElementById('obstacle-modal').classList.remove('hidden');
}

function checkObstacleAnswer(teamNumber) {
    const userAnswer = document.getElementById('obstacle-answer-input').value.trim().toUpperCase();
    const feedback = document.getElementById('obstacle-feedback');
    
    document.querySelectorAll('#obstacle-modal .team-buttons button').forEach(btn => btn.disabled = true);

    if (userAnswer === OBSTACLE_ANSWER) {
        scores[teamNumber] += OBSTACLE_POINTS;
        feedback.textContent = `🏆 GRAND SUCCESS! Team ${teamNumber} scores +${OBSTACLE_POINTS} points!`;
        updateScoreDisplay();
        
        // Mở ô lớn ở giữa
        document.getElementById('tile-center').classList.add('open');
        
        // Đánh dấu 4 ô nhỏ dưới ô lớn là đã mở
        [7, 8, 11, 12].forEach(id => {
            const tile = document.getElementById(`tile-${id}`);
            if (tile && !tile.classList.contains('open')) {
                tile.classList.add('open');
                answeredTiles.add(id);
                // Chúng ta không tăng revealedSmallTilesCount ở đây vì nó sẽ được tính khi checkWinCondition
                // Tuy nhiên, để đảm bảo tính toán thắng lợi đúng, ta sẽ kiểm tra tất cả các ô nhỏ
            }
        });
        
        // Kiểm tra xem đã mở hết 16 ô chưa
        revealedSmallTilesCount = answeredTiles.size;
        checkWinCondition(); 
        
        setTimeout(() => {
            document.getElementById('obstacle-modal').classList.add('hidden');
        }, 3000);

    } else {
        feedback.textContent = `❌ Incorrect! The challenge remains open for the other team.`;
        setTimeout(() => {
            document.querySelectorAll('#obstacle-modal .team-buttons button').forEach(btn => btn.disabled = false);
        }, 1500);
    }
}

function closeModal() {
    clearInterval(timerInterval); 
    document.getElementById('question-modal').classList.add('hidden');
    document.getElementById('obstacle-modal').classList.add('hidden');

    const teamButtonsDivQuestion = document.querySelector('#question-modal .team-buttons');
    teamButtonsDivQuestion.innerHTML = `
        <button onclick="checkAnswer(1)">Team 1 Answered</button>
        <button onclick="checkAnswer(2)">Team 2 Answered</button>
    `;
    document.querySelectorAll('#obstacle-modal .team-buttons button').forEach(btn => btn.disabled = false);
}

function checkWinCondition() {
    // Cập nhật lại số ô đã mở, bao gồm cả 4 ô dưới ô lớn nếu đã trả lời chướng ngại vật
    let count = 0;
    for (let i = 1; i <= totalSmallTiles; i++) {
        if (answeredTiles.has(i)) {
            count++;
        }
    }
    revealedSmallTilesCount = count;
    
    // Kết thúc game khi 16 ô nhỏ đã mở
    if (revealedSmallTilesCount === totalSmallTiles) {
        // Đảm bảo ô lớn mở
        document.getElementById('tile-center').classList.add('open');
        document.getElementById('obstacle-challenge-btn').disabled = true; 
        
        let winnerText = '';
        if (scores[1] > scores[2]) {
            winnerText = `Team 1 WINS with ${scores[1]} points!`;
        } else if (scores[2] > scores[1]) {
            winnerText = `Team 2 WINS with ${scores[2]} points!`;
        } else {
            winnerText = `It's a TIE! Both teams scored ${scores[1]} points!`;
        }
        
        document.getElementById('winner-text').textContent = winnerText;
        document.getElementById('final-reveal').classList.remove('hidden');
    }
}

function resetGame() {
    window.location.reload(); 

}

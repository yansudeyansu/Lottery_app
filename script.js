// グローバル変数
let isRunning = false;
let currentInterval;
let winnerIndex = -1;
let lotteryCount = 0; // 抽選回数をカウント

// 当選者の指定
let specifiedWinners = {
    '当選画像1.png': true,
    '当選画像2.png': true,
    '当選画像3.png': true
};

function createConfetti(round = 0) {
    // 回数に応じて異なる色セットを使用
    const colorSets = [
        ['#ffd700', '#ffa500', '#ffff00'], // 1回目：金色系
        ['#00bfff', '#1e90ff', '#87ceeb'], // 2回目：青系
        ['#ff69b4', '#ff1493', '#ffb6c1']  // 3回目：ピンク系
    ];
    const colors = colorSets[round];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 3;
        confetti.style.animation = `fall ${duration}s linear ${delay}s`;
        
        document.body.appendChild(confetti);

        confetti.addEventListener('animationend', () => {
            confetti.remove();
        });
    }
}

function createSparkles(container, round = 0) {
    const colors = [
        '#ffd700', // 1回目：金
        '#00bfff', // 2回目：青
        '#ff69b4'  // 3回目：ピンク
    ];
    
    for (let i = 0; i < 20; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.backgroundColor = colors[round];
        sparkle.style.animation = `sparkle-animation 1s linear ${Math.random()}s`;
        container.appendChild(sparkle);

        sparkle.addEventListener('animationend', () => {
            sparkle.remove();
        });
    }
}

function preloadImages() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = '';

    return Promise.all(employees.map(employee => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(`画像の読み込みに失敗しました: ${employee.image}`);
            img.src = employee.image;
        });
    })).catch(error => {
        errorMessage.textContent = error;
        throw error;
    });
}

function setupImages() {
    const container = document.getElementById('imageContainer');
    container.innerHTML = '';
    
    employees.forEach((employee, index) => {
        const img = document.createElement('img');
        img.src = employee.image;
        img.className = 'employee-image';
        img.id = `employee-${index}`;
        if (index === 0) img.classList.add('active');
        container.appendChild(img);
    });
}

function showRandomImage() {
    const currentActive = document.querySelector('.employee-image.active');
    if (currentActive) currentActive.classList.remove('active');
    
    // 当選画像1,2,3以外の画像からランダムに選択
    const availableIndices = employees
        .map((employee, index) => {
            const isWinnerImage = 
                employee.image.includes('当選画像1.png') ||
                employee.image.includes('当選画像2.png') ||
                employee.image.includes('当選画像3.png');
            return isWinnerImage ? -1 : index;
        })
        .filter(index => index !== -1);
    
    if (availableIndices.length === 0) {
        console.error('通常の画像が見つかりません');
        return;
    }
    
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const randomImage = document.getElementById(`employee-${randomIndex}`);
    if (randomImage) {
        randomImage.classList.add('active');
    }
}

function setWinner(index) {
    const winnerImage = document.getElementById(`employee-${index}`);
    const container = document.getElementById('imageContainer');
    const winnerFlash = document.querySelector('.winner-flash');
    
    document.querySelectorAll('.employee-image').forEach(img => {
        img.classList.remove('active');
    });
    
    // 抽選回数に応じて異なる演出を適用
    container.classList.remove('winner-1', 'winner-2', 'winner-3');
    const round = (lotteryCount % 3);
    container.classList.add(`winner-${round + 1}`);
    
    winnerFlash.classList.add('active');
    setTimeout(() => {
        winnerFlash.classList.remove('active');
    }, 500);

    winnerImage.classList.add('active');
    
    createConfetti(round);
    createSparkles(container, round);
    
    document.querySelector('.drum-roll').classList.remove('active');
}

function startLottery() {
    if (isRunning) return;
    
    isRunning = true;
    document.getElementById('startButton').disabled = true;
    document.getElementById('imageContainer').classList.remove('winner-1', 'winner-2', 'winner-3');
    
    // タイトルを更新
    const title = document.getElementById('lotteryTitle');
    const round = (lotteryCount % 3) + 1;
    title.textContent = `第${round}回 抽選`;
    title.className = `lottery-${round}`;
    
    document.querySelector('.drum-roll').classList.add('active');
    
    let duration = 0;
    const maxDuration = 3000;
    const initialInterval = 50;
    
    function updateInterval() {
        if (duration >= maxDuration) {
            clearInterval(currentInterval);
            isRunning = false;
            document.getElementById('resetButton').disabled = false;
            
            // 当選画像の番号を決定（1, 2, 3の順番でループ）
            const winnerNumber = (lotteryCount % 3) + 1;
            const targetImage = `当選画像${winnerNumber}.png`;
            
            // 指定された当選画像を持つ社員を探す
            const winner = employees.findIndex(emp => emp.image.includes(targetImage));
            
            if (winner !== -1 && specifiedWinners[targetImage]) {
                winnerIndex = winner;
                setWinner(winnerIndex);
                console.log(`${targetImage} が当選しました`);
            } else {
                console.error(`${targetImage} が見つからないか、指定されていません`);
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.textContent = `エラー: 正しい当選者が見つかりません`;
            }
            
            lotteryCount++;
            return;
        }
        
        showRandomImage();
        duration += initialInterval;
        
        const newInterval = initialInterval + (duration / maxDuration) * 200;
        clearInterval(currentInterval);
        currentInterval = setInterval(updateInterval, newInterval);
    }
    
    currentInterval = setInterval(updateInterval, initialInterval);
}

function resetLottery() {
    document.getElementById('startButton').disabled = false;
    document.getElementById('resetButton').disabled = true;
    document.getElementById('imageContainer').classList.remove('winner-1', 'winner-2', 'winner-3');
    
    document.querySelectorAll('.employee-image').forEach(img => {
        img.classList.remove('active');
    });
    document.getElementById('employee-0').classList.add('active');
    
    document.querySelectorAll('.sparkle').forEach(sparkle => sparkle.remove());
    
    // タイトルをリセット
    const title = document.getElementById('lotteryTitle');
    const nextRound = (lotteryCount % 3) + 1;
    title.textContent = `第${nextRound}回 抽選`;
    title.className = `lottery-${nextRound}`;
    
    winnerIndex = -1;
}

// 初期化
window.onload = async () => {
    try {
        await preloadImages();
        setupImages();
    } catch (error) {
        console.error('初期化エラー:', error);
    }
};
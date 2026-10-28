document.addEventListener('DOMContentLoaded', () => {
    // Inicialização dos Ícones do Lucide
    if (window.lucide) {
        lucide.createIcons();
    }

    // -------------------------------------------------------------
    // 1. Criar Efeito de Pétalas Caindo
    // -------------------------------------------------------------
    function createPetals() {
        const container = document.getElementById('petals');
        if (!container) return;
        const petalCount = 18;

        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('div');
            petal.className = 'petal';

            const size = Math.random() * 14 + 10;
            const left = Math.random() * 100;
            const duration = Math.random() * 8 + 6;
            const delay = Math.random() * 5;

            petal.style.width = `${size}px`;
            petal.style.height = `${size * 1.3}px`;
            petal.style.left = `${left}%`;
            petal.style.animationDuration = `${duration}s`;
            petal.style.animationDelay = `${delay}s`;

            container.appendChild(petal);
        }
    }
    createPetals();

    // -------------------------------------------------------------
    // 2. Flip Cards (Mitos & Verdades)
    // -------------------------------------------------------------
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });

    // -------------------------------------------------------------
    // 3. Lógica do Minijogo Educativo
    // -------------------------------------------------------------
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const startOverlay = document.getElementById('gameStartOverlay');
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    const finalScoreText = document.getElementById('finalScoreText');
    const btnStartGame = document.getElementById('btnStartGame');
    const btnRestartGame = document.getElementById('btnRestartGame');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');

    let gameLoop = null;
    let score = 0;
    let isGameOver = false;
    let isPlaying = false;
    let spawnInterval = null;
    let gameTimer = null;

    // Objeto Jogador (Cesta)
    const player = {
        x: 170,
        y: 350,
        width: 60,
        height: 20,
        speed: 6,
        dx: 0
    };

    // Itens que caem
    const items = [];
    const itemTypes = [
        { symbol: '💖', type: 'good', points: 10 },
        { symbol: '🍎', type: 'good', points: 10 },
        { symbol: '🏃‍♀️', type: 'good', points: 10 },
        { symbol: '🎗️', type: 'good', points: 15 },
        { symbol: '🚬', type: 'bad', points: -10 },
        { symbol: '🍺', type: 'bad', points: -10 }
    ];

    function spawnItem() {
        if (!isPlaying) return;
        const randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        items.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            size: 26,
            speed: Math.random() * 2 + 2,
            ...randomItem
        });
    }

    function update() {
        if (isGameOver || !isPlaying) return;

        // Mover jogador
        player.x += player.dx;
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

        // Mover itens
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.y += item.speed;

            // Colisão com o jogador
            if (
                item.y + item.size >= player.y &&
                item.x + item.size >= player.x &&
                item.x <= player.x + player.width
            ) {
                score += item.points;
                if (score < 0) score = 0;
                items.splice(i, 1);
                continue;
            }

            // Removendo itens fora da tela
            if (item.y > canvas.height) {
                items.splice(i, 1);
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenhar Jogador
        ctx.fillStyle = '#db2777';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(player.x, player.y, player.width, player.height, 10);
        } else {
            ctx.rect(player.x, player.y, player.width, player.height);
        }
        ctx.fill();

        // Desenhar Itens
        ctx.font = '22px sans-serif';
        items.forEach(item => {
            ctx.fillText(item.symbol, item.x, item.y);
        });

        // Desenhar Pontuação
        ctx.fillStyle = '#831843';
        ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`Pontos: ${score}`, 15, 30);
    }

    function loop() {
        update();
        draw();
        if (isPlaying) {
            gameLoop = requestAnimationFrame(loop);
        }
    }

    function startGame() {
        // Limpa intervalos/temporizadores anteriores se existirem
        if (spawnInterval) clearInterval(spawnInterval);
        if (gameTimer) clearTimeout(gameTimer);

        score = 0;
        items.length = 0;
        isGameOver = false;
        isPlaying = true;
        player.x = 170;

        if (startOverlay) startOverlay.classList.add('hidden');
        if (gameOverOverlay) gameOverOverlay.classList.add('hidden');

        spawnInterval = setInterval(() => {
            if (isPlaying) spawnItem();
            else clearInterval(spawnInterval);
        }, 800);

        // Cronômetro do Jogo (15 segundos)
        gameTimer = setTimeout(() => {
            endGame();
        }, 15000);

        loop();
    }

    function endGame() {
        isPlaying = false;
        isGameOver = true;
        if (gameLoop) cancelAnimationFrame(gameLoop);
        if (spawnInterval) clearInterval(spawnInterval);
        if (gameTimer) clearTimeout(gameTimer);

        if (finalScoreText) finalScoreText.innerText = `Sua pontuação: ${score} pontos!`;
        if (gameOverOverlay) gameOverOverlay.classList.remove('hidden');
    }

    // Eventos do teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') player.dx = -player.speed;
        if (e.key === 'ArrowRight') player.dx = player.speed;
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
    });

    // Eventos dos botões touch / mouse
    if (btnLeft) {
        btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); player.dx = -player.speed; });
        btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); player.dx = 0; });
        btnLeft.addEventListener('mousedown', () => { player.dx = -player.speed; });
        btnLeft.addEventListener('mouseup', () => { player.dx = 0; });
    }

    if (btnRight) {
        btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); player.dx = player.speed; });
        btnRight.addEventListener('touchend', (e) => { e.preventDefault(); player.dx = 0; });
        btnRight.addEventListener('mousedown', () => { player.dx = player.speed; });
        btnRight.addEventListener('mouseup', () => { player.dx = 0; });
    }

    if (btnStartGame) btnStartGame.addEventListener('click', startGame);
    if (btnRestartGame) btnRestartGame.addEventListener('click', startGame);
});
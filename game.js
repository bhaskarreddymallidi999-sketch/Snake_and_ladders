// Game State & Logic Module
document.addEventListener('DOMContentLoaded', () => {
    const LADDERS = { 2: 38, 7: 14, 8: 31, 15: 26, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 78: 98, 87: 94 };
    const SNAKES = { 16: 6, 46: 25, 49: 11, 62: 19, 64: 60, 74: 53, 89: 68, 92: 88, 95: 75, 99: 80 };

    let gameMode = 'cpu';
    let players = [
        { id: 0, name: 'Player 1', color: 'emerald', position: 0, isCpu: false },
        { id: 1, name: 'Computer', color: 'rose', position: 0, isCpu: true }
    ];
    let currentTurnIndex = 0;
    let isRolling = false;

    const colorMap = {
        emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
        rose: { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
        indigo: { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
        amber: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
    };

    function initBoard() {
        const grid = document.getElementById('boardGrid');
        grid.innerHTML = '';

        for (let row = 9; row >= 0; row--) {
            let colIndices = Array.from({ length: 10 }, (_, i) => i);
            if (row % 2 === 1) colIndices.reverse();

            colIndices.forEach(col => {
                const cellNum = row * 10 + col + 1;
                const cell = document.createElement('div');
                cell.id = `cell-${cellNum}`;
                cell.className = `relative flex flex-col justify-between p-1 border border-slate-700/60 text-xs font-semibold ${cellNum % 2 === 0 ? 'bg-slate-800/40' : 'bg-slate-800/70'}`;
                
                const numSpan = document.createElement('span');
                numSpan.className = 'text-[10px] text-slate-500 font-bold select-none';
                numSpan.innerText = cellNum;
                cell.appendChild(numSpan);

                if (LADDERS[cellNum]) {
                    const badge = document.createElement('div');
                    badge.className = 'absolute top-1 right-1 text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded border border-emerald-500/30 select-none';
                    badge.innerHTML = `<i class="fa-solid fa-ladder"></i> ${LADDERS[cellNum]}`;
                    cell.appendChild(badge);
                } else if (SNAKES[cellNum]) {
                    const badge = document.createElement('div');
                    badge.className = 'absolute top-1 right-1 text-[9px] bg-rose-500/20 text-rose-400 px-1 rounded border border-rose-500/30 select-none';
                    badge.innerHTML = `<i class="fa-solid fa-worm"></i> ${SNAKES[cellNum]}`;
                    cell.appendChild(badge);
                }

                const tokenContainer = document.createElement('div');
                tokenContainer.id = `tokens-cell-${cellNum}`;
                tokenContainer.className = 'flex flex-wrap items-center justify-center gap-1 mt-auto mb-1';
                cell.appendChild(tokenContainer);

                grid.appendChild(cell);
            });
        }

        drawBoardSvgLines();
        renderPlayersList();
        updateTurnDisplay();
        renderTokens();
    }

    function drawBoardSvgLines() {
        const svg = document.getElementById('boardSvgOverlay');
        svg.innerHTML = '';

        function getCellCoords(num) {
            const gridElem = document.getElementById('boardGrid');
            const cellElem = document.getElementById(`cell-${num}`);
            if (!gridElem || !cellElem) return { x: 0, y: 0 };
            const gRect = gridElem.getBoundingClientRect();
            const cRect = cellElem.getBoundingClientRect();
            return {
                x: (cRect.left + cRect.width / 2) - gRect.left,
                y: (cRect.top + cRect.height / 2) - gRect.top
            };
        }

        Object.entries(LADDERS).forEach(([start, end]) => {
            const startPt = getCellCoords(parseInt(start));
            const endPt = getCellCoords(parseInt(end));
            if (startPt.x && endPt.x) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', startPt.x);
                line.setAttribute('y1', startPt.y);
                line.setAttribute('x2', endPt.x);
                line.setAttribute('y2', endPt.y);
                line.setAttribute('stroke', '#10b981');
                line.setAttribute('stroke-width', '4');
                line.setAttribute('stroke-linecap', 'round');
                line.setAttribute('stroke-dasharray', '6 4');
                svg.appendChild(line);
            }
        });

        Object.entries(SNAKES).forEach(([start, end]) => {
            const startPt = getCellCoords(parseInt(start));
            const endPt = getCellCoords(parseInt(end));
            if (startPt.x && endPt.x) {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const dx = endPt.x - startPt.x;
                const dy = endPt.y - startPt.y;
                const cx = (startPt.x + endPt.x) / 2 + dy * 0.2;
                const cy = (startPt.y + endPt.y) / 2 - dx * 0.2;
                path.setAttribute('d', `M ${startPt.x} ${startPt.y} Q ${cx} ${cy} ${endPt.x} ${endPt.y}`);
                path.setAttribute('stroke', '#f43f5e');
                path.setAttribute('stroke-width', '4');
                path.setAttribute('stroke-linecap', 'round');
                path.setAttribute('fill', 'none');
                svg.appendChild(path);
            }
        });
    }

    function renderPlayersList() {
        const container = document.getElementById('playersListContainer');
        container.innerHTML = '';

        players.forEach((p, idx) => {
            const cfg = colorMap[p.color];
            const isCurrent = idx === currentTurnIndex;
            const card = document.createElement('div');
            card.className = `flex items-center justify-between p-3 rounded-xl border transition ${isCurrent ? 'bg-slate-700/60 border-emerald-500/50 shadow-md' : 'bg-slate-700/20 border-slate-700/40'}`;
            card.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center text-white font-bold shadow-md">
                        <i class="fa-solid ${p.isCpu ? 'fa-robot' : 'fa-user'}"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-sm text-white">${p.name}</h4>
                        <p class="text-xs text-slate-400">Position: <span class="font-semibold text-slate-200">${p.position === 0 ? 'Start' : p.position}</span></p>
                    </div>
                </div>
                <span class="text-xs px-2.5 py-1 rounded-full border font-semibold ${cfg.badge}">${p.position === 100 ? 'Winner! 🏆' : (isCurrent ? 'Current Turn' : 'Waiting')}</span>
            `;
            container.appendChild(card);
        });
    }

    function renderTokens() {
        for (let i = 1; i <= 100; i++) {
            const container = document.getElementById(`tokens-cell-${i}`);
            if (container) container.innerHTML = '';
        }

        players.forEach((p, idx) => {
            if (p.position > 0 && p.position <= 100) {
                const container = document.getElementById(`tokens-cell-${p.position}`);
                if (container) {
                    const token = document.createElement('div');
                    const cfg = colorMap[p.color];
                    const isActive = idx === currentTurnIndex;
                    token.className = `token w-6 h-6 rounded-full ${cfg.bg} border-2 border-white flex items-center justify-center text-[10px] font-extrabold text-white shadow-lg ${isActive ? 'active-token z-20' : 'z-10'}`;
                    token.innerText = p.name.charAt(0).toUpperCase();
                    token.title = `${p.name} (Cell ${p.position})`;
                    container.appendChild(token);
                }
            }
        });
    }

    function updateTurnDisplay() {
        const p = players[currentTurnIndex];
        const cfg = colorMap[p.color];
        
        const bannerAvatar = document.getElementById('turnAvatar');
        bannerAvatar.className = `w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${cfg.bg}`;
        bannerAvatar.innerHTML = `<i class="fa-solid ${p.isCpu ? 'fa-robot' : 'fa-user'}"></i>`;

        document.getElementById('turnPlayerName').innerText = `${p.name}'s Turn`;
        document.getElementById('turnSubText').innerText = p.isCpu ? 'Computer is thinking...' : 'Roll the dice to move forward!';

        const rollBtn = document.getElementById('rollBtn');
        if (p.isCpu) {
            rollBtn.disabled = true;
            rollBtn.classList.add('opacity-50', 'cursor-not-allowed');
            setTimeout(executeCpuTurn, 1000);
        } else {
            rollBtn.disabled = false;
            rollBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    function handleRoll() {
        if (isRolling) return;
        const activePlayer = players[currentTurnIndex];
        if (activePlayer.isCpu) return;

        isRolling = true;
        SoundManager.playSound('roll');

        const diceFace = document.getElementById('diceFace');
        const diceBox = document.getElementById('diceBox');
        diceBox.classList.add('animate-spin');

        let counter = 0;
        const rollInterval = setInterval(() => {
            const randomVal = Math.floor(Math.random() * 6) + 1;
            diceFace.innerHTML = `<i class="fa-solid fa-dice-${['one','two','three','four','five','six'][randomVal-1]}"></i>`;
            counter++;
            if (counter > 10) {
                clearInterval(rollInterval);
                diceBox.classList.remove('animate-spin');
                const finalRoll = Math.floor(Math.random() * 6) + 1;
                diceFace.innerHTML = `<i class="fa-solid fa-dice-${['one','two','three','four','five','six'][finalRoll-1]}"></i>`;
                processPlayerMove(finalRoll);
            }
        }, 50);
    }

    function executeCpuTurn() {
        if (isRolling) return;
        isRolling = true;
        SoundManager.playSound('roll');

        const diceFace = document.getElementById('diceFace');
        let counter = 0;
        const rollInterval = setInterval(() => {
            const randomVal = Math.floor(Math.random() * 6) + 1;
            diceFace.innerHTML = `<i class="fa-solid fa-dice-${['one','two','three','four','five','six'][randomVal-1]}"></i>`;
            counter++;
            if (counter > 10) {
                clearInterval(rollInterval);
                const finalRoll = Math.floor(Math.random() * 6) + 1;
                diceFace.innerHTML = `<i class="fa-solid fa-dice-${['one','two','three','four','five','six'][finalRoll-1]}"></i>`;
                processPlayerMove(finalRoll);
            }
        }, 50);
    }

    function processPlayerMove(roll) {
        const p = players[currentTurnIndex];
        let targetPos = p.position === 0 ? roll : p.position + roll;

        if (targetPos > 100) {
            targetPos = p.position;
            checkSpecialTile(p, targetPos, roll);
        } else {
            animateStepByStep(p, p.position, targetPos, roll);
        }
    }

    function animateStepByStep(player, startPos, finalTarget, roll) {
        let currentPos = startPos;
        function step() {
            if (currentPos < finalTarget) {
                currentPos++;
                player.position = currentPos;
                SoundManager.playSound('step');
                renderTokens();
                renderPlayersList();
                setTimeout(step, 200);
            } else {
                setTimeout(() => checkSpecialTile(player, finalTarget, roll), 300);
            }
        }
        if (startPos === 0) {
            player.position = roll;
            SoundManager.playSound('step');
            renderTokens();
            renderPlayersList();
            setTimeout(() => checkSpecialTile(player, roll, roll), 300);
        } else {
            step();
        }
    }

    function checkSpecialTile(player, pos, roll) {
        if (LADDERS[pos]) {
            SoundManager.playSound('ladder');
            player.position = LADDERS[pos];
            renderTokens();
            renderPlayersList();
        } else if (SNAKES[pos]) {
            SoundManager.playSound('snake');
            player.position = SNAKES[pos];
            renderTokens();
            renderPlayersList();
        }

        if (player.position === 100) {
            SoundManager.playSound('win');
            showWinModal(player);
            return;
        }

        if (roll === 6) {
            const sixBadge = document.getElementById('consecutiveSixes');
            sixBadge.classList.remove('hidden');
            setTimeout(() => sixBadge.classList.add('hidden'), 2500);
            isRolling = false;
            updateTurnDisplay();
            return;
        }

        currentTurnIndex = (currentTurnIndex + 1) % players.length;
        isRolling = false;
        updateTurnDisplay();
        renderPlayersList();
    }

    function showWinModal(winner) {
        document.getElementById('winnerText').innerText = `${winner.name} Wins!`;
        document.getElementById('winModal').classList.remove('hidden');
    }

    function resetGame() {
        players.forEach(p => p.position = 0);
        currentTurnIndex = 0;
        isRolling = false;
        initBoard();
    }

    // UI Event Listeners
    document.getElementById('rollBtn').addEventListener('click', handleRoll);
    document.getElementById('diceBox').addEventListener('click', handleRoll);
    document.getElementById('restartBtn').addEventListener('click', resetGame);
    document.getElementById('soundToggleBtn').addEventListener('click', () => {
        const active = SoundManager.toggleSound();
        document.getElementById('soundIcon').className = active 
            ? "fa-solid fa-volume-high text-emerald-400" 
            : "fa-solid fa-volume-xmark text-slate-400";
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('setupModal').classList.remove('hidden');
    });
    document.getElementById('closeSetupBtn').addEventListener('click', () => {
        document.getElementById('setupModal').classList.add('hidden');
    });

    document.getElementById('modeCpuBtn').addEventListener('click', () => {
        gameMode = 'cpu';
        document.getElementById('modeCpuBtn').className = "p-3 rounded-xl border font-medium text-sm transition flex items-center justify-center space-x-2 bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm";
        document.getElementById('modePvpBtn').className = "p-3 rounded-xl border font-medium text-sm transition flex items-center justify-center space-x-2 bg-slate-700/40 border-slate-600 text-slate-300";
        document.getElementById('p2LabelTitle').innerText = "Computer Name & Color";
        document.getElementById('p2NameInput').value = "Computer";
    });

    document.getElementById('modePvpBtn').addEventListener('click', () => {
        gameMode = 'pvp';
        document.getElementById('modePvpBtn').className = "p-3 rounded-xl border font-medium text-sm transition flex items-center justify-center space-x-2 bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm";
        document.getElementById('modeCpuBtn').className = "p-3 rounded-xl border font-medium text-sm transition flex items-center justify-center space-x-2 bg-slate-700/40 border-slate-600 text-slate-300";
        document.getElementById('p2LabelTitle').innerText = "Player 2 Name & Color";
        document.getElementById('p2NameInput').value = "Player 2";
    });

    document.getElementById('startGameBtn').addEventListener('click', () => {
        const p1Name = document.getElementById('p1NameInput').value.trim() || 'Player 1';
        const p1Color = document.getElementById('p1ColorSelect').value;
        const p2Name = document.getElementById('p2NameInput').value.trim() || (gameMode === 'cpu' ? 'Computer' : 'Player 2');
        const p2Color = document.getElementById('p2ColorSelect').value;

        players = [
            { id: 0, name: p1Name, color: p1Color, position: 0, isCpu: false },
            { id: 1, name: p2Name, color: p2Color, position: 0, isCpu: gameMode === 'cpu' }
        ];

        currentTurnIndex = 0;
        isRolling = false;
        document.getElementById('gameModeBadge').innerText = gameMode === 'cpu' ? 'Player vs CPU' : '2 Player Mode';
        document.getElementById('setupModal').classList.add('hidden');
        initBoard();
    });

    document.getElementById('winSettingsBtn').addEventListener('click', () => {
        document.getElementById('winModal').classList.add('hidden');
        document.getElementById('setupModal').classList.remove('hidden');
    });

    document.getElementById('winPlayAgainBtn').addEventListener('click', () => {
        document.getElementById('winModal').classList.add('hidden');
        resetGame();
    });

    document.getElementById('sourceCodeBtn').addEventListener('click', () => {
        document.getElementById('codeSnippetContent').textContent = document.documentElement.outerHTML;
        document.getElementById('codeModal').classList.remove('hidden');
    });

    document.getElementById('closeCodeBtn').addEventListener('click', () => {
        document.getElementById('codeModal').classList.add('hidden');
    });

    document.getElementById('copyCodeBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(document.documentElement.outerHTML).then(() => {
            const btnText = document.getElementById('copyBtnText');
            btnText.innerText = "Copied!";
            setTimeout(() => btnText.innerText = "Copy Code", 2000);
        });
    });

    window.addEventListener('resize', drawBoardSvgLines);
    initBoard();
});
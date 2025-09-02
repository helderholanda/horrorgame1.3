// ======== VARIÁVEIS ========
let questions = [];
let currentQuestion = 0;
let score = 0;
let round = 1;
let roundWins = 0;
let unusedQuestions = [];
let questionDeck = [];
const totalRounds = 3;
const roundTarget = 6;

// ======== RESULTADOS RODADA ========
const roundResults = [
    { winGif: "https://media.tenor.com/Xhn-02DnvOUAAAAM/dragging-almost-there.gif", 
      loseGif: "https://media.tenor.com/xhiOmnHXs9cAAAAM/patrick-star.gif" }
];

// ======== DOM ========
const startBtn = document.getElementById("startBtn");
const startGif = document.getElementById("startGif");
const quizContainer = document.getElementById("quizContainer");
const questionText = document.getElementById("questionText");
const totalQuestionsP = document.getElementById("totalQuestions");
const optionsDiv = document.getElementById("options");
const roundCounter = document.getElementById("roundCounter");
const soundStart = document.getElementById("soundStart");
const soundClick = document.getElementById("soundClick");
const soundLaugh = document.getElementById("soundLaugh");
const bgMusic = document.getElementById("bgMusic");

// ======== FUNÇÕES ========
async function loadData() {
    try {
        const qResponse = await fetch("questions.json");
        questions = await qResponse.json();
    } catch (err) {
        console.error("Erro ao carregar dados:", err);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createShuffledDeck() {
    if (unusedQuestions.length < 10) {
        unusedQuestions = shuffleArray([...questions]);
    }
    questionDeck = unusedQuestions.slice(0, 10);
    unusedQuestions = unusedQuestions.slice(10);
}

function updateRoundCounter() {
    roundCounter.textContent = `Rodada ${round} de ${totalRounds}`;
}

function showQuestion() {
    if (currentQuestion >= questionDeck.length) { showRoundResult(); return; }
    const q = questionDeck[currentQuestion];
    questionText.textContent = q.text;
    totalQuestionsP.textContent = `Pergunta ${currentQuestion + 1} de ${questionDeck.length}`;
    optionsDiv.innerHTML = "";

    let optionsShuffled = q.options.map((opt, idx) => ({ opt, idx }));
    optionsShuffled = shuffleArray(optionsShuffled);
    optionsShuffled.forEach(item => {
        const btn = document.createElement("button");
        btn.textContent = item.opt;
        btn.className = "btn";
        btn.addEventListener("click", () => {
            soundClick.play();
            checkAnswer(item.idx);
        });
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected) {
    if (selected === questionDeck[currentQuestion].correct) score++;
    currentQuestion++;
    showQuestion();
}

function showRoundResult() {
    optionsDiv.innerHTML = "";
    soundLaugh.play();
    const roundWon = score >= roundTarget;
    if (roundWon) roundWins++;

    const resultMsg = `Rodada ${round} concluída! Acertos: ${score} / Erros: ${questionDeck.length - score} <br>Você ${roundWon ? 'ganhou' : 'perdeu'} esta rodada!`;
    questionText.innerHTML = resultMsg;
    totalQuestionsP.textContent = "";

    const resultGif = document.createElement("div");
    resultGif.className = "gif-container";
    resultGif.innerHTML = `<img src="${roundWon ? roundResults[0].winGif : roundResults[0].loseGif}" alt="Resultado">`;
    optionsDiv.appendChild(resultGif);

    const nextBtn = document.createElement("button");
    nextBtn.className = "btn";
    if (round === totalRounds) {
        nextBtn.textContent = "Ver Resultado";
        nextBtn.addEventListener("click", showGameResult);
    } else {
        nextBtn.textContent = "Próxima Rodada";
        nextBtn.addEventListener("click", () => {
            round++;
            currentQuestion = 0; score = 0;
            createShuffledDeck(); updateRoundCounter(); showQuestion();
        });
    }
    optionsDiv.appendChild(nextBtn);

    const quitBtn = document.createElement("button");
    quitBtn.textContent = "Sou um bebê chorão, desisto";
    quitBtn.className = "btn";
    quitBtn.addEventListener("click", showGameResult);
    optionsDiv.appendChild(quitBtn);
}

function showGameResult() {
    optionsDiv.innerHTML = "";
    roundCounter.textContent = "";
    questionText.innerHTML = `Fim do jogo! Você venceu ${roundWins} de ${totalRounds} rodadas.`;
    const finalGif = document.createElement("div");
    finalGif.className = "gif-container";
    finalGif.innerHTML = `<img src="https://i.makeagif.com/media/1-12-2016/KM8sKE.gif" alt="Fim do jogo">`;
    optionsDiv.appendChild(finalGif);

    const restartBtn = document.createElement("button");
    restartBtn.textContent = "Jogar Novamente";
    restartBtn.className = "btn";
    restartBtn.addEventListener("click", restartGame);
    optionsDiv.appendChild(restartBtn);
}

function restartGame() {
    round = 1; roundWins = 0; currentQuestion = 0; score = 0;
    optionsDiv.innerHTML = ""; questionText.textContent = "";
    unusedQuestions = shuffleArray([...questions]);
    createShuffledDeck(); updateRoundCounter(); showQuestion();
}

// ======== AJUSTE DINÂMICO DO FUNDO GIF ========
function adjustBackground() {
    const body = document.body;
    const isMobile = window.innerWidth <= 800;

    if (isMobile) {
        body.style.backgroundPosition = 'center top';
        body.style.backgroundSize = 'cover';
    } else {
        body.style.backgroundPosition = 'center center';
        body.style.backgroundSize = 'cover';
    }
}

adjustBackground();
window.addEventListener('resize', adjustBackground);

// ======== INÍCIO ========
startBtn.addEventListener("click", async () => {
    await loadData();
    soundStart.play();
    bgMusic.volume = 1.0;
    bgMusic.play().catch(() => console.log("Erro ao tocar a música de fundo."));
    startBtn.style.display = "none"; 
    startGif.style.display = "none";
    quizContainer.style.display = "flex";
    unusedQuestions = shuffleArray([...questions]);
    createShuffledDeck(); updateRoundCounter(); showQuestion();
}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registrado!"))
    .catch(err => console.error("Erro ao registrar Service Worker:", err));
});

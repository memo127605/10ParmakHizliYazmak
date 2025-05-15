document.addEventListener('DOMContentLoaded', () => {
    const previousWords = document.getElementById('previousWords');
    const currentWords = document.getElementById('currentWords');
    const typingInput = document.getElementById('typingInput');
    const wpmDisplay = document.getElementById('wpm');
    const accuracyDisplay = document.getElementById('accuracy');
    const timerDisplay = document.getElementById('timer');
    const restartBtn = document.getElementById('restartBtn');
    const resultModal = document.getElementById('resultModal');
    const closeModal = document.getElementById('closeModal');
    const startBtn = document.getElementById('startBtn');

    let currentWordIndex = 0;
    let correctWords = 0;
    let wrongWords = 0;
    let keystrokes = 0;
    let startTime = null;
    let timerInterval = null;
    let timeLeft = 60;
    let currentLineWords = [];
    let nextLineWords = [];
    let typedWord = '';
    let typedWords = [];

    // Tab değiştirme işlevi
    const tabButtons = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Tab butonlarını güncelle
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Formları güncelle
            authForms.forEach(form => {
                if (form.id === `${tabName}Form`) {
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                }
            });
        });
    });

    // Tema değiştirme işlevi
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.className = `${savedTheme}-theme`;

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.className.includes('light') ? 'dark' : 'light';
        body.className = `${currentTheme}-theme`;
        localStorage.setItem('theme', currentTheme);
    });

    // Kelime karıştırma fonksiyonu
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Yeni kelime satırları oluşturma
    function createNewLines() {
        const shuffledWords = shuffleArray([...words]);
        currentLineWords = shuffledWords.slice(0, 8);
        nextLineWords = shuffledWords.slice(8, 16);
        displayWords();
    }

    // Kelimeleri ekranda gösterme
    function displayWords() {
        previousWords.innerHTML = nextLineWords.map(word => `<span>${word}</span>`).join(' ');
        currentWords.innerHTML = currentLineWords.map((word, index) => {
            let className = '';
            if (index === currentWordIndex) {
                className = 'current';
            } else if (index < currentWordIndex) {
                // Önceki kelimeler için doğru/yanlış kontrolü
                const isCorrect = typedWords[index] === currentLineWords[index];
                className = isCorrect ? 'correct' : 'incorrect';
            }
            return `<span class="${className}">${word}</span>`;
        }).join(' ');
    }

    // Zamanlayıcı başlatma
    function startTimer() {
        timeLeft = 60;
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `${timeLeft}s`;
            
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    // Oyunu bitirme
    function endGame() {
        clearInterval(timerInterval);
        typingInput.disabled = true;
        
        const timePassed = (60 - timeLeft) / 60;
        const wpm = Math.round((correctWords / timePassed) || 0);
        const accuracy = Math.round((correctWords / (correctWords + wrongWords)) * 100) || 0;
        
        // Sonuç modalını güncelle
        document.getElementById('correctWords').textContent = correctWords;
        document.getElementById('wrongWords').textContent = wrongWords;
        document.getElementById('keystrokes').textContent = keystrokes;
        document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
        document.getElementById('finalWpm').textContent = `${wpm} KDK`;
        
        // Modalı göster
        resultModal.classList.add('active');
    }

    // Oyunu yeniden başlatma
    function restartGame() {
        currentWordIndex = 0;
        correctWords = 0;
        wrongWords = 0;
        keystrokes = 0;
        timeLeft = 60;
        typedWord = '';
        typedWords = [];
        clearInterval(timerInterval);
        
        wpmDisplay.textContent = '0 KDK';
        accuracyDisplay.textContent = '100%';
        timerDisplay.textContent = '60s';
        typingInput.disabled = false;
        typingInput.value = '';
        
        createNewLines();
    }

    // Kelime kontrolü
    function checkWord() {
        const currentWord = currentLineWords[currentWordIndex];
        
        // Yazılan kelimeyi kaydet ve renklendirme için kontrol et
        typedWords[currentWordIndex] = typedWord;
        const spans = currentWords.getElementsByTagName('span');
        
        if (typedWord === currentWord) {
            correctWords++;
            spans[currentWordIndex].classList.remove('current');
            spans[currentWordIndex].classList.add('correct');
        } else {
            wrongWords++;
            spans[currentWordIndex].classList.remove('current');
            spans[currentWordIndex].classList.add('incorrect');
        }

        currentWordIndex++;
        typedWord = '';
        typingInput.value = '';

        // Satır sonuna gelindiyse
        if (currentWordIndex >= currentLineWords.length) {
            currentWordIndex = 0;
            currentLineWords = nextLineWords;
            nextLineWords = shuffleArray([...words]).slice(0, 8);
            typedWords = [];
        }

        // İstatistikleri güncelle
        const accuracy = Math.round((correctWords / (correctWords + wrongWords)) * 100);
        accuracyDisplay.textContent = `${accuracy}%`;
        
        displayWords();
    }

    // Tuş vuruşlarını dinleme
    typingInput.addEventListener('keydown', (e) => {
        if (!startTime) {
            startTime = new Date();
            startTimer();
        }

        if (e.key === ' ') {
            e.preventDefault();
            if (typedWord.length > 0) {
                checkWord();
            }
        }
    });

    typingInput.addEventListener('input', (e) => {
        keystrokes++;
        typedWord = e.target.value.trim();
        
        // Anlık kelime kontrolü
        const currentWord = currentLineWords[currentWordIndex];
        const spans = currentWords.getElementsByTagName('span');
        const currentSpan = spans[currentWordIndex];
        
        // Harf harf kontrol
        if (typedWord.length === 0) {
            currentSpan.className = 'current';
        } else if (currentWord.startsWith(typedWord)) {
            currentSpan.className = 'current correct';
        } else {
            currentSpan.className = 'current incorrect';
        }
    });

    // Modal kapatma
    closeModal.addEventListener('click', () => {
        resultModal.classList.remove('active');
        restartGame();
    });

    // Yeniden başlatma butonu
    restartBtn.addEventListener('click', restartGame);

    // Başlangıçta input alanını devre dışı bırak
    typingInput.disabled = true;

    // Başlat butonuna tıklandığında
    startBtn.addEventListener('click', () => {
        startBtn.style.display = 'none'; // Başlat butonunu gizle
        typingInput.disabled = false; // Input alanını etkinleştir
        typingInput.focus(); // Input alanına odaklan
        startTimer(); // Zamanlayıcıyı başlat
        initializeTest(); // Testi başlat
    });

    // Oyunu başlat
    createNewLines();

    // Form gönderme işlemleri
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Giriş işlemleri burada yapılacak
        console.log('Giriş yapılıyor...');
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Kayıt işlemleri burada yapılacak
        console.log('Kayıt yapılıyor...');
    });
}); 
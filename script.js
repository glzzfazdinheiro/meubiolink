const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initParticles() {
    const particleCount = 80;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            alpha: Math.random() * 0.5 + 0.2,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.2,
        });
    }
}

function drawParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
    }
    animationId = requestAnimationFrame(drawParticles);
}

function startParticles() {
    resizeCanvas();
    initParticles();
    drawParticles();
}

window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

window.addEventListener('load', startParticles);

const avatarImg = document.getElementById('avatar-img');
avatarImg.addEventListener('error', () => {
    avatarImg.classList.add('error');
    avatarImg.src = '';
});

const audio = document.getElementById("main-audio");
const playIcon = document.getElementById("play-icon");
const muteIcon = document.getElementById("mute-icon");
const playPauseBtn = document.getElementById("play-pause-btn");
const muteBtn = document.getElementById("mute-btn");
const card = document.getElementById("main-card");
const musicWidget = document.getElementById("music-widget");
const trackLabel = document.getElementById("current-track-label");

const playlist = [
    "Juice WRLD - All Girls Are The Same.mp3",
    "Travis Scott - goosebumps.mp3",
    "musica3.mp3"
];
let currentTrack = 0;

function getCleanTrackName(filename) {
    return filename.replace(/\.mp3$/i, '').replace(/_/g, ' ');
}

function updateTrackDisplay() {
    const rawName = playlist[currentTrack % playlist.length];
    trackLabel.textContent = `🎵 ${getCleanTrackName(rawName)}`;
}

function loadTrack(index) {
    const track = playlist[index % playlist.length];
    audio.src = `music/${track}`;
    audio.load();
    updateTrackDisplay();
}

function syncIcons() {
    playIcon.className = audio.paused ? "fas fa-play" : "fas fa-pause";
    muteIcon.className = (audio.muted || audio.volume === 0) ? "fas fa-volume-mute" : "fas fa-volume-up";
}

function togglePlayPause() {
    if (audio.paused) {
        audio.play().catch(e => console.log("Erro ao tocar:", e));
    } else {
        audio.pause();
    }
    syncIcons();
}

let lastVolume = 0.5;
function toggleMute() {
    if (audio.muted) {
        audio.muted = false;
        audio.volume = lastVolume;
    } else {
        lastVolume = audio.volume;
        audio.muted = true;
    }
    syncIcons();
}

function startExperience() {
    const enterScreen = document.getElementById("enter-screen");
    enterScreen.style.opacity = "0";
    setTimeout(() => {
        enterScreen.style.visibility = "hidden";
        card.classList.add("show");
        musicWidget.classList.add("visible");
    }, 200);
    
    audio.volume = 0.5;
    lastVolume = 0.5;
    audio.muted = false;
    loadTrack(currentTrack);
    audio.play().catch(e => console.log("Autoplay bloqueado, verifique se há músicas na pasta 'music'"));
    syncIcons();
}

audio.addEventListener('ended', () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    audio.play();
    syncIcons();
});

audio.addEventListener('play', syncIcons);
audio.addEventListener('pause', syncIcons);
audio.addEventListener('volumechange', syncIcons);

playPauseBtn.addEventListener('click', togglePlayPause);
muteBtn.addEventListener('click', toggleMute);

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (!isTouchDevice && card) {
    card.addEventListener('mousemove', (e) => {
        if (!card.classList.contains('show')) return;
        const { clientX, clientY } = e;
        const { left, top, width, height } = card.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const rotateX = ((clientY - centerY) / (height / 2)) * -15;
        const rotateY = ((clientX - centerX) / (width / 2)) * 15;
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = `rotateX(0deg) rotateY(0deg)`;
    });
}

const discordBtn = document.getElementById("discord-copy-btn");
const toast = document.getElementById("copyToast");
const modal = document.getElementById("discordModal");
const modalConfirm = document.getElementById("modalConfirm");
const modalCancel = document.getElementById("modalCancel");
const textoParaCopiar = "inimigodapoliciacivil";

function showToastNearIcon(iconElement, message = "✅ Username copiado!") {
    const rect = iconElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top - 10;
    toast.style.left = `${centerX}px`;
    toast.style.top = `${centerY}px`;
    toast.textContent = message;
    toast.classList.remove("show");
    setTimeout(() => {
        toast.classList.add("show");
    }, 10);
    setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}

function fallbackCopyText(text, callback) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        console.error("Fallback falhou", err);
    }
    document.body.removeChild(textarea);
    if (callback) callback(success);
}

async function copiarUsernameEGatilhoModal(iconElement) {
    let copied = false;
    try {
        await navigator.clipboard.writeText(textoParaCopiar);
        copied = true;
    } catch (err) {
        console.warn("Clipboard API falhou, usando fallback");
        fallbackCopyText(textoParaCopiar, (success) => {
            copied = success;
            if (!copied) {
                showToastNearIcon(iconElement, "❌ Erro ao copiar");
            } else {
                showToastNearIcon(iconElement, "✅ Copiado!");
                modal.style.display = "flex";
            }
        });
        return;
    }
    if (copied) {
        showToastNearIcon(iconElement, "✅ Copiado!");
        modal.style.display = "flex";
    } else {
        showToastNearIcon(iconElement, "❌ Erro ao copiar");
    }
}

if (discordBtn) {
    discordBtn.addEventListener("click", (e) => {
        e.preventDefault();
        copiarUsernameEGatilhoModal(discordBtn);
    });
}

modalConfirm.addEventListener("click", () => {
    modal.style.display = "none";
    window.open("https://discord.com/users/inimigodapoliciacivil", "_blank");
});
modalCancel.addEventListener("click", () => {
    modal.style.display = "none";
});
modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});
/* ================== ELEMENTOS ================== */
const personagem = document.getElementById('personagem');
const enemyContainer = document.getElementById('enemy-container');
const bulletContainer = document.getElementById('bullet-container');
const placar = document.getElementById('placar');
const ammoText = document.getElementById('ammo-count');
const gameOverText = document.getElementById('game-over-text');
const restartBtn = document.getElementById('restart-btn');

restartBtn.addEventListener('click', () => {
  location.reload();
});

/* ================== ÁUDIO ================== */
const bgMusic = new Audio('./audio/desert_theme.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;

let audioIniciado = false;

function iniciarAudio() {
  if (audioIniciado) return;
  bgMusic.play().catch(() => {});
  audioIniciado = true;
}

/* ================== ESTADO ================== */
let pontos = 0;
let isGameOver = false;

/* ================== MUNIÇÃO ================== */
const maxAmmo = 6;
let ammo = maxAmmo;

function atualizarAmmo() {
  ammoText.innerText = `${ammo}/${maxAmmo}`;
}
atualizarAmmo();

/* ================== BOSS ================== */
let bossAtivo = false;
let boss = null;
let bossAttackInterval = null;
let bossLife = 6;
let bossDefeated = false;
let bossFinalizado = false;

/* ================== PULO ================== */
function pular() {
  if (isGameOver) return;
  if (personagem.classList.contains('animar-pulo')) return;

  personagem.classList.add('animar-pulo', 'jumping-image');
  setTimeout(() => {
    personagem.classList.remove('animar-pulo', 'jumping-image');
  }, 500);
}

/* ================== TIRO DO PLAYER ================== */
function atirar() {
  if (isGameOver || ammo <= 0) return;

  ammo--;
  atualizarAmmo();

  const bullet = document.createElement('div');
  bullet.classList.add('bullet');

  const p = personagem.getBoundingClientRect();
  bullet.style.left = (p.right - 10) + 'px';
  bullet.style.top = (p.top + p.height / 2) + 'px';

  bulletContainer.appendChild(bullet);
  setTimeout(() => bullet.remove(), 1200);
}

/* ================== CONTROLES ================== */
document.addEventListener('keydown', e => {
  iniciarAudio();

  if (e.code === 'Space') pular();
  if (e.code === 'KeyX') atirar();
});

/* ================== SPAWN INIMIGOS ================== */
function criarElemento() {
  if (isGameOver) return;

  const el = document.createElement('div');
  const r = Math.random();

  let tipo = r < 0.4 ? 'cactus' : r < 0.75 ? 'scorpion' : 'box';
  el.classList.add(tipo, 'move');
  el.dataset.pontuado = "false";

  enemyContainer.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

const gerador = setInterval(criarElemento, 1800);

/* ================== BOSS SPAWN ================== */
function spawnBoss() {
  if (bossAtivo || bossFinalizado) return;

  bossAtivo = true;
  bossDefeated = false;
  bossLife = 5;

  boss = document.createElement('div');
  boss.classList.add('boss');
  document.body.appendChild(boss);

  bossAttackInterval = setInterval(atirarPoison, 3000);
}

/* ================== ATAQUE DO BOSS ================== */
function atirarPoison() {
  if (isGameOver || !bossAtivo || bossDefeated) return;

  const poison = document.createElement('div');
  poison.classList.add('poison');

  const br = boss.getBoundingClientRect();
  poison.style.left = (br.left - 20) + 'px';
  poison.style.top = (br.top + br.height / 2) + 'px';

  enemyContainer.appendChild(poison);
  setTimeout(() => poison.remove(), 2300);
}

/* ================== DERROTA DO BOSS ================== */
function derrotarBoss() {
  bossDefeated = true;
  bossFinalizado = true;

  boss.style.backgroundImage = "url('./img/Boss_defeat.png')";
  clearInterval(bossAttackInterval);

  document.querySelectorAll('.poison').forEach(p => p.remove());

  setTimeout(() => {
    boss.remove();
    bossAtivo = false;
    gameWin();
  }, 2000);
}

/* ================== LOOP PRINCIPAL ================== */
const loop = setInterval(() => {
  if (isGameOver) return;

  const p = personagem.getBoundingClientRect();

  if (pontos >= 150 && !bossAtivo && !bossFinalizado) {
    spawnBoss();
  }

  document.querySelectorAll('.bullet').forEach(b => {
    const br = b.getBoundingClientRect();

    document.querySelectorAll('.scorpion').forEach(s => {
      const sr = s.getBoundingClientRect();
      if (br.right > sr.left && br.left < sr.right && br.bottom > sr.top && br.top < sr.bottom) {
        s.remove();
        b.remove();
        pontos += 10;
      }
    });

    if (bossAtivo && boss && !bossDefeated) {
      const bosr = boss.getBoundingClientRect();
      if (br.right > bosr.left && br.left < bosr.right && br.bottom > bosr.top && br.top < bosr.bottom) {
        b.remove();
        bossLife--;
        if (bossLife <= 0) derrotarBoss();
      }
    }

    document.querySelectorAll('.poison').forEach(pz => {
      const pr = pz.getBoundingClientRect();
      if (br.right > pr.left && br.left < pr.right && br.bottom > pr.top && br.top < pr.bottom) {
        b.remove();
        pz.remove();
      }
    });
  });

  document.querySelectorAll('.cactus, .scorpion').forEach(e => {
    const er = e.getBoundingClientRect();
    if (p.left < er.right && p.right > er.left && p.bottom < er.top + 20 && e.dataset.pontuado === "false") {
      pontos += 5;
      e.dataset.pontuado = "true";
    }
  });

  document.querySelectorAll('.box').forEach(box => {
    const br = box.getBoundingClientRect();
    if (p.right - 40 > br.left && p.left + 40 < br.right && p.bottom - 20 > br.top) {
      ammo = Math.min(ammo + 2, maxAmmo);
      atualizarAmmo();
      box.remove();
    }
  });

  document.querySelectorAll('.cactus, .scorpion, .poison').forEach(e => {
    const er = e.getBoundingClientRect();
    if (p.right - 40 > er.left && p.left + 40 < er.right && p.bottom - 20 > er.top) {
      gameOver();
    }
  });

  placar.innerText = pontos;
}, 20);

/* ================== GAME OVER ================== */
function gameOver() {
  if (isGameOver) return;
  isGameOver = true;

  bgMusic.pause();
  bgMusic.currentTime = 0;

  gameOverText.style.display = 'block';
  clearInterval(gerador);
  clearInterval(loop);
  clearInterval(bossAttackInterval);
}

/* ================== GAME WIN ================== */
function gameWin() {
  if (isGameOver) return;
  isGameOver = true;

  bgMusic.pause();
  bgMusic.currentTime = 0;

  clearInterval(gerador);
  clearInterval(loop);
  clearInterval(bossAttackInterval);

  document.getElementById('game-win').style.display = 'flex';
  document.getElementById('win-score').innerText = `Pontuação final: ${pontos}`;
  document.getElementById('win-message').innerText =
    "Você cruzou o deserto sem medo, enfrentou monstros, poeira e veneno. " +
    "O sol se põe no horizonte enquanto o Cowboy Mercenário segue seu caminho, " +
    "vitorioso, lendário e impossível de parar.";
}

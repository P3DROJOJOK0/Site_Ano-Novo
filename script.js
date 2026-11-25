const ano = new Date().getFullYear() + 1;
document.getElementById('ano').textContent = ano;
document.querySelectorAll('.anoTxt').forEach(e => e.textContent = ano);

/* ===== Contagem até 1º de janeiro ===== */
let fAnt = Infinity;
function contar() {
  const f = new Date(new Date().getFullYear() + 1, 0, 1) - new Date(), p = n => String(n).padStart(2, '0');
  [['d', Math.floor(f / 864e5)], ['h', Math.floor(f / 36e5) % 24], ['m', Math.floor(f / 6e4) % 60], ['s', Math.floor(f / 1e3) % 60]].forEach(([id, v]) => {
    const el = document.getElementById(id), t = p(v);
    if (el.textContent !== t) { el.textContent = t; el.classList.remove('tic'); void el.offsetWidth; el.classList.add('tic'); }
  });
  if (f > fAnt + 1000) celebrar(); // virou o ano com a página aberta
  fAnt = f;
}
contar(); setInterval(contar, 1000);

/* ===== Fogos (foguetes com rastro), brilhos do mouse e confete ===== */
const cv = document.getElementById('fx'), c = cv.getContext('2d');
let fogos = [], confetes = [], foguetes = [], brilhos = [], ultimo = 0;
const ajustar = () => { cv.width = innerWidth; cv.height = innerHeight; };
addEventListener('resize', ajustar); ajustar();

function lancar(x) {
  foguetes.push({ x: x ?? Math.random() * cv.width * .8 + cv.width * .1, y: cv.height, vy: -(9 + Math.random() * 3), alvo: cv.height * (.12 + Math.random() * .35) });
}
function explodir(x, y, forma) {
  const cor = Math.floor(Math.random() * 360), tipo = forma || ['bola', 'anel', 'estrela'][Math.floor(Math.random() * 3)], n = 64;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.28;
    const v = tipo === 'anel' ? 3.3 : tipo === 'estrela' ? (i % 2 ? 1.6 : 3.8) : Math.random() * 3.2 + 1.2;
    fogos.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 1, cor: cor + (tipo === 'bola' ? Math.random() * 30 : 0) });
  }
}
function confete() {
  const cores = ['#ffd76a', '#ff6b9d', '#5ec8ff', '#7cfc8a', '#c77dff', '#fff'];
  for (let i = 0; i < 150; i++) {
    confetes.push({ x: Math.random() * cv.width, y: -20 - Math.random() * 250, w: 6 + Math.random() * 6, h: 10 + Math.random() * 6,
      vy: 2 + Math.random() * 3, vx: Math.random() * 2 - 1, r: Math.random() * 6, vr: Math.random() * .2 - .1,
      cor: cores[Math.floor(Math.random() * cores.length)] });
  }
}
function quadro(t) {
  c.clearRect(0, 0, cv.width, cv.height);
  if (!document.hidden && t - ultimo > 1300) { lancar(); ultimo = t; }
  foguetes.forEach(r => {
    r.y += r.vy; r.vy *= .985;
    brilhos.push({ x: r.x, y: r.y, vx: 0, vy: .3, vida: .5, cor: 40 });
    c.fillStyle = '#fff'; c.beginPath(); c.arc(r.x, r.y, 2.5, 0, 6.28); c.fill();
    if (r.y <= r.alvo || r.vy > -2.2) { explodir(r.x, r.y); r.fim = true; }
  });
  foguetes = foguetes.filter(r => !r.fim);
  fogos.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += .04; p.vx *= .99; p.vida -= .011;
    c.fillStyle = `hsla(${p.cor},100%,65%,${Math.max(p.vida, 0)})`;
    c.beginPath(); c.arc(p.x, p.y, 2.2, 0, 6.28); c.fill();
  });
  fogos = fogos.filter(p => p.vida > 0);
  brilhos.forEach(b => {
    b.x += b.vx; b.y += b.vy; b.vida -= .03;
    c.fillStyle = `hsla(${b.cor},100%,70%,${Math.max(b.vida, 0)})`;
    c.beginPath(); c.arc(b.x, b.y, 1.7, 0, 6.28); c.fill();
  });
  brilhos = brilhos.filter(b => b.vida > 0);
  confetes.forEach(k => {
    k.y += k.vy; k.x += k.vx + Math.sin(k.r); k.r += k.vr;
    c.save(); c.translate(k.x, k.y); c.rotate(k.r); c.fillStyle = k.cor; c.fillRect(-k.w / 2, -k.h / 2, k.w, k.h); c.restore();
  });
  confetes = confetes.filter(k => k.y < cv.height + 30);
  requestAnimationFrame(quadro);
}
requestAnimationFrame(quadro);
document.getElementById('btnConfete').addEventListener('click', confete);
addEventListener('pointerdown', e => { if (!e.target.closest('button,a,input,textarea')) { lancar(e.clientX); } });
let ultBrilho = 0;
addEventListener('pointermove', e => {
  const t = performance.now(); if (t - ultBrilho < 35) return; ultBrilho = t;
  brilhos.push({ x: e.clientX, y: e.clientY, vx: Math.random() - .5, vy: Math.random() * .8, vida: .7, cor: 40 + Math.random() * 20 });
});

/* ===== Celebração (virada real ou simulada) ===== */
const ov = document.getElementById('celebra'), celNum = document.getElementById('celNum'), celTxt = document.getElementById('celTxt');
let celTimer, simulando = false;
function celebrar() {
  ov.hidden = false; celNum.textContent = `🎆 ${ano} 🎆`; celTxt.textContent = 'FELIZ ANO NOVO!';
  confete(); setTimeout(confete, 1500);
  let k = 0; const iv = setInterval(() => { lancar(); lancar(); if (++k > 14) clearInterval(iv); }, 450);
  clearTimeout(celTimer); celTimer = setTimeout(() => { ov.hidden = true; }, 9000);
}
function simular() {
  if (simulando) return; simulando = true;
  ov.hidden = false; celTxt.textContent = 'Prepare o brinde...';
  let n = 5; celNum.textContent = n;
  const iv = setInterval(() => {
    n--;
    if (n > 0) celNum.textContent = n; else { clearInterval(iv); simulando = false; celebrar(); }
  }, 1000);
}
document.getElementById('btnSim').addEventListener('click', simular);
document.getElementById('fechaCel').addEventListener('click', () => { ov.hidden = true; });
addEventListener('keydown', e => { if (e.key === 'Escape') ov.hidden = true; });

/* ===== Champanhe + mensagens ===== */
const desejos = [
  'Que 365 dias de oportunidades cheguem até você. 🌟',
  'Que você ria muito, ame muito e se preocupe pouco. 😄',
  'Que os seus melhores sonhos virem planos e os planos virem realidade. 🚀',
  'Que o novo ano traga saúde de sobra e paz de verdade. 🕊️',
  'Leve a gratidão do que passou e a coragem do que vem. 💪',
  'Que cada mês do ano seja um motivo novo para comemorar. 🥳',
  'Que você seja a sorte de alguém e encontre muita sorte também. 🍀'
];
let ultimoDesejo = -1;
document.getElementById('btnAbrir').addEventListener('click', () => {
  let i; do { i = Math.floor(Math.random() * desejos.length); } while (i === ultimoDesejo);
  ultimoDesejo = i;
  const el = document.getElementById('deseja');
  el.textContent = desejos[i];
  el.classList.remove('nova'); void el.offsetWidth; el.classList.add('nova');
  confete(); explodir(innerWidth / 2, innerHeight / 3);
});

/* ===== Cor da roupa ===== */
const cores = [
  { n: 'Branco',   c: '#ffffff', t: 'Paz',           d: 'paz, harmonia e dias tranquilos' },
  { n: 'Amarelo',  c: '#ffd400', t: 'Prosperidade',  d: 'dinheiro, sorte e muita fartura' },
  { n: 'Vermelho', c: '#e11d2e', t: 'Amor',          d: 'amor, paixão e relações cheias de carinho' },
  { n: 'Verde',    c: '#22a45d', t: 'Saúde',         d: 'saúde, esperança e energia para recomeçar' },
  { n: 'Azul',     c: '#2f7de1', t: 'Tranquilidade', d: 'calma, proteção e equilíbrio na mente' },
  { n: 'Rosa',     c: '#ff7eb6', t: 'Amizade',       d: 'amizades verdadeiras e um romance suave' },
  { n: 'Laranja',  c: '#ff8a1f', t: 'Sucesso',       d: 'sucesso, criatividade e muita alegria' },
  { n: 'Roxo',     c: '#8e44ec', t: 'Transformação', d: 'espiritualidade e coragem para se transformar' }
];
const paleta = document.getElementById('paleta'), resCor = document.getElementById('resCor');
cores.forEach(o => {
  const b = document.createElement('button');
  b.className = 'cor'; b.style.setProperty('--c', o.c); b.title = o.n;
  b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); b.setAttribute('aria-label', o.n);
  b.addEventListener('click', () => {
    paleta.querySelectorAll('.cor').forEach(x => x.setAttribute('aria-checked', x === b));
    resCor.innerHTML = `<div class="papel"><svg viewBox="0 0 120 120"><path d="M40 10 L10 30 L22 52 L34 46 V108 H86 V46 L98 52 L110 30 L80 10 Q60 28 40 10 Z"
      fill="${o.c}" stroke="rgba(0,0,0,.4)" stroke-width="3" stroke-linejoin="round"/></svg><div><h3></h3><p></p></div></div>`;
    resCor.querySelector('h3').textContent = `${o.n}: ${o.t}`;
    resCor.querySelector('p').textContent = `Em ${ano}, eu quero ter ${o.d}. Vista ${o.n.toLowerCase()} na virada! 🥂`;
    explodir(innerWidth / 2, innerHeight / 3);
  });
  paleta.appendChild(b);
});

/* ===== Metas ===== */
const lista = document.getElementById('lista'), vazio = document.getElementById('vazio');
let metas = [];
try { metas = JSON.parse(localStorage.getItem('metas-ano-novo')) || []; } catch (e) {}
function salvar() { try { localStorage.setItem('metas-ano-novo', JSON.stringify(metas)); } catch (e) {} }
function desenhar() {
  lista.innerHTML = '';
  vazio.hidden = metas.length > 0;
  metas.forEach((m, i) => {
    const li = document.createElement('li');
    li.className = m.ok ? 'feita' : '';
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = m.ok; cb.setAttribute('aria-label', 'Concluir meta');
    cb.addEventListener('change', () => { m.ok = cb.checked; salvar(); desenhar(); if (m.ok) explodir(innerWidth / 2, innerHeight / 2); });
    const sp = document.createElement('span'); sp.textContent = m.t;
    const bt = document.createElement('button'); bt.textContent = '✕'; bt.setAttribute('aria-label', 'Remover meta');
    bt.addEventListener('click', () => { metas.splice(i, 1); salvar(); desenhar(); });
    li.append(cb, sp, bt); lista.appendChild(li);
  });
}
document.getElementById('formMeta').addEventListener('submit', e => {
  e.preventDefault();
  const inp = document.getElementById('meta'), t = inp.value.trim();
  if (!t) return;
  metas.push({ t, ok: false }); inp.value = ''; salvar(); desenhar();
});
desenhar();

/* ===== Estrelas e balões ===== */
for (let i = 0; i < 60; i++) {
  const e = document.createElement('i'); e.className = 'estrela';
  e.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${Math.random() * 3}s`;
  document.body.appendChild(e);
}
['#ff6b9d', '#ffd76a', '#5ec8ff', '#c77dff', '#7cfc8a', '#ff8a1f', '#ff4d6d', '#fff'].forEach((cor, i) => {
  const b = document.createElement('i'); b.className = 'balao';
  b.style.cssText = `--c:${cor};--x:${6 + i * 12}%;--t:${14 + (i % 4) * 4}s;--dl:-${i * 2.5}s`;
  document.body.appendChild(b);
});

/* ===== Faixa "Feliz Ano Novo" em vários idiomas ===== */
const idiomas = ['Feliz Ano Novo', 'Happy New Year', 'Feliz Año Nuevo', 'Bonne Année', 'Frohes Neues Jahr',
  'Felice Anno Nuovo', 'あけましておめでとう', 'С Новым годом', 'Gelukkig Nieuwjaar', 'Gott Nytt År'];
document.getElementById('trilho').innerHTML = [...idiomas, ...idiomas].map(t => `<span>✦ ${t}</span>`).join('');

/* ===== Réveillon pelo mundo ===== */
const mundo = [
  ['🇰🇮', 'Kiribati', 'A ilha de Kiritimati está entre os primeiros lugares do planeta a receber o Ano Novo.'],
  ['🇦🇺', 'Austrália', 'Sydney é famosa pelos fogos sobre a Ópera e a Harbour Bridge.'],
  ['🇯🇵', 'Japão', 'Templos tocam o sino 108 vezes para afastar as preocupações do ano que passou.'],
  ['🇪🇸', 'Espanha', 'Comem-se 12 uvas, uma a cada badalada da meia-noite, fazendo 12 desejos.'],
  ['🇮🇹', 'Itália', 'A lentilha na ceia simboliza moedas e fartura para o ano novo.'],
  ['🇩🇰', 'Dinamarca', 'Há quem quebre pratos velhos na porta dos amigos: quanto mais cacos, mais sorte.'],
  ['🇬🇧', 'Escócia', 'No Hogmanay, todos cantam “Auld Lang Syne”, de mãos dadas, à meia-noite.'],
  ['🇧🇷', 'Brasil', 'Roupa branca, flores para Iemanjá, sete ondinhas e muita festa na praia.']
];
document.getElementById('cartas').innerHTML = mundo.map(([f, n, t]) =>
  `<article class="carta"><b>${f}</b><h3>${n}</h3><p>${t}</p></article>`).join('');

/* ===== Palavra do ano ===== */
const palavraOut = document.getElementById('palavraOut'), palavraIn = document.getElementById('palavraIn');
function revelar(txt) {
  palavraOut.innerHTML = `<small>Minha palavra para ${ano}</small><strong></strong>`;
  palavraOut.querySelector('strong').textContent = txt;
  explodir(innerWidth / 2, innerHeight / 2);
}
document.getElementById('formPalavra').addEventListener('submit', e => {
  e.preventDefault(); const t = palavraIn.value.trim(); if (t) revelar(t);
});
['Coragem', 'Gratidão', 'Leveza', 'Foco', 'Alegria', 'Fé', 'Equilíbrio'].forEach(w => {
  const b = document.createElement('button'); b.type = 'button'; b.textContent = w;
  b.addEventListener('click', () => { palavraIn.value = w; revelar(w); });
  document.getElementById('sugestoes').appendChild(b);
});

/* ===== Checklist da virada ===== */
const itens = ['👗 Separar a roupa da cor escolhida', '🍇 Preparar as uvas, a lentilha ou a romã', '💰 Guardar uma notinha na carteira',
  '🥂 Gelar o champanhe (ou o suco!)', '✍️ Escrever as minhas metas', '📲 Mandar mensagem para um amigo querido',
  '🤗 Abraçar quem eu amo', '🎆 Assistir aos fogos à meia-noite'];
let feitos = [];
try { feitos = JSON.parse(localStorage.getItem('check-virada')) || []; } catch (e) {}
const ul = document.getElementById('check');
function atualizarProgresso() {
  const n = feitos.length;
  document.getElementById('barra').style.width = (n / itens.length * 100) + '%';
  document.getElementById('progTxt').textContent = n === itens.length ? '🎉 Tudo pronto para a virada!' : `${n} de ${itens.length} prontos`;
}
itens.forEach((t, i) => {
  const li = document.createElement('li'), cb = document.createElement('input'), sp = document.createElement('span');
  cb.type = 'checkbox'; cb.checked = feitos.includes(i); li.classList.toggle('feita', cb.checked);
  sp.textContent = t;
  cb.addEventListener('change', () => {
    feitos = cb.checked ? [...feitos, i] : feitos.filter(x => x !== i);
    li.classList.toggle('feita', cb.checked);
    try { localStorage.setItem('check-virada', JSON.stringify(feitos)); } catch (e) {}
    atualizarProgresso();
    if (feitos.length === itens.length) { confete(); explodir(innerWidth / 2, innerHeight / 3); }
  });
  li.append(cb, sp); ul.appendChild(li);
});
atualizarProgresso();

/* ===== Aparecer ao rolar + voltar ao topo ===== */
const observador = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); }), { threshold: .12 });
document.querySelectorAll('.bloco').forEach(el => { el.classList.add('reveal'); observador.observe(el); });
document.getElementById('btnTopo').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== Música: "Auld Lang Syne" (Web Audio) ===== */
const NT = { D4: 293.66, G4: 392, A4: 440, B4: 493.88, D5: 587.33, E5: 659.25 };
const tune = [['D4',1],['G4',1.5],['G4',.5],['G4',1],['B4',1],['A4',1.5],['G4',.5],['A4',1],['B4',1],['G4',1.5],['G4',.5],['B4',1],['D5',1],
  ['E5',3],['E5',1],['D5',1.5],['B4',.5],['B4',1],['G4',1],['A4',1.5],['G4',.5],['A4',1],['B4',1],['G4',3]];
const btnMusica = document.getElementById('btnMusica');
let ac, tocando = false, nota = 0, tm;
function tocar() {
  if (!tocando) return;
  const [n, b] = tune[nota], dur = b * .42, t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'triangle'; o.frequency.value = NT[n];
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.22, t + .03); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur);
  const o2 = ac.createOscillator(), g2 = ac.createGain(); o2.type = 'sine'; o2.frequency.value = NT[n] / 2;
  g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(.12, t + .05); g2.gain.exponentialRampToValueAtTime(.001, t + dur);
  o2.connect(g2).connect(ac.destination); o2.start(t); o2.stop(t + dur);
  nota = (nota + 1) % tune.length;
  tm = setTimeout(tocar, dur * 1000 + (nota === 0 ? 1200 : 0));
}
btnMusica.addEventListener('click', () => {
  ac = ac || new (window.AudioContext || window.webkitAudioContext)();
  tocando = !tocando;
  if (tocando) { ac.resume(); tocar(); } else clearTimeout(tm);
  btnMusica.textContent = tocando ? '⏸ Pausar' : '🎵 Música';
  btnMusica.setAttribute('aria-pressed', tocando);
});

/* ===== Quiz: qual é o seu estilo de virada? ===== */
const perguntas = [
  { q: 'Deu meia-noite! Onde você está?', r: [['Na pista de dança 💃', 'festa'], ['Na praia, pés na areia 🌊', 'zen'], ['Em casa com a família 🏡', 'caseiro'], ['Escrevendo as metas do ano ✍️', 'plano']] },
  { q: 'O que não pode faltar na mesa?', r: [['Lentilha 🥣', 'plano'], ['Champanhe e petiscos 🥂', 'festa'], ['Ceia caprichada para todos 🍽️', 'caseiro'], ['Frutas e algo leve 🍇', 'zen']] },
  { q: 'Sua maior meta para o ano é...', r: [['Viver momentos incríveis 🎢', 'festa'], ['Mais calma e saúde 🧘', 'zen'], ['Organizar a vida e a agenda 📅', 'plano'], ['Ficar perto de quem amo 💞', 'caseiro']] },
  { q: 'No dia 1º de janeiro você...', r: [['Dorme até tarde 😴', 'festa'], ['Caminha ao ar livre 🌳', 'zen'], ['Monta o planejamento 📝', 'plano'], ['Almoça com a família 🍲', 'caseiro']] }
];
const perfis = {
  festa:   ['🎉 Alma de Festa', 'Você transforma qualquer virada em celebração! Continue espalhando alegria e lembre de descansar também.'],
  zen:     ['🌊 Espírito Zen', 'Você recebe o ano com calma e leveza. Em ' + ano + ', proteja os seus momentos de silêncio.'],
  plano:   ['📝 Mente Planejadora', 'Você gosta de começar com um plano na mão. Que cada meta riscada da lista traga orgulho!'],
  caseiro: ['🏡 Coração Caseiro', 'Para você, o melhor da virada é quem está ao seu lado. Que ' + ano + ' tenha muitos abraços.']
};
const quizEl = document.getElementById('quiz');
let qi = 0, placar = {};
function quiz() {
  if (qi >= perguntas.length) {
    const top = Object.keys(placar).sort((a, b) => placar[b] - placar[a])[0], [titulo, texto] = perfis[top];
    quizEl.innerHTML = '<div class="papel"><h3></h3><p></p><button class="btn" id="refazer">Refazer quiz</button></div>';
    quizEl.querySelector('h3').textContent = titulo; quizEl.querySelector('p').textContent = texto;
    document.getElementById('refazer').onclick = () => { qi = 0; placar = {}; quiz(); };
    confete(); return;
  }
  const { q, r } = perguntas[qi];
  quizEl.innerHTML = `<small>Pergunta ${qi + 1} de ${perguntas.length}</small><h3></h3><div class="opcoes"></div>`;
  quizEl.querySelector('h3').textContent = q;
  r.forEach(([t, k]) => {
    const b = document.createElement('button'); b.className = 'opcao'; b.textContent = t;
    b.onclick = () => { placar[k] = (placar[k] || 0) + 1; qi++; quiz(); };
    quizEl.querySelector('.opcoes').appendChild(b);
  });
}
quiz();

/* ===== Biscoito da sorte ===== */
const sortes = [
  'Uma boa notícia chega mais cedo do que você imagina.', 'Alguém vai te surpreender com um gesto de carinho.',
  'Uma ideia antiga ganha vida nova neste ano.', 'O seu esforço de agora vai render frutos bonitos.',
  'Uma viagem, perto ou longe, vai te trazer boas histórias.', 'Você vai rir muito de algo que hoje parece difícil.',
  'Um reencontro especial está a caminho.', 'A sua gentileza voltará para você em dobro.',
  'Um pequeno passo corajoso vai abrir uma grande porta.', 'Mais um motivo para brindar vai aparecer logo no começo do ano.'
];
const bisc = document.getElementById('biscoito'), sorteTxt = document.getElementById('sorteTxt');
document.getElementById('btnSorte').addEventListener('click', () => {
  bisc.classList.remove('quebra'); void bisc.offsetWidth; bisc.classList.add('quebra');
  setTimeout(() => {
    sorteTxt.textContent = '“' + sortes[Math.floor(Math.random() * sortes.length)] + '”';
    sorteTxt.classList.remove('nova'); void sorteTxt.offsetWidth; sorteTxt.classList.add('nova');
    explodir(innerWidth / 2, innerHeight / 2, 'estrela');
  }, 600);
});

/* ===== Carta para o futuro ===== */
const cartaTxt = document.getElementById('cartaTxt'), cartaSalva = document.getElementById('cartaSalva');
function mostrarCarta() {
  let k = null; try { k = JSON.parse(localStorage.getItem('carta-ano-novo')); } catch (e) {}
  cartaSalva.innerHTML = '';
  if (!k) return;
  const box = document.createElement('div'); box.className = 'papel';
  const h = document.createElement('h3'), pp = document.createElement('p');
  h.textContent = `💌 Carta guardada em ${k.data}`; pp.textContent = k.texto; pp.style.whiteSpace = 'pre-wrap';
  box.append(h, pp); cartaSalva.appendChild(box);
}
document.getElementById('btnCarta').addEventListener('click', () => {
  const texto = cartaTxt.value.trim(); if (!texto) return;
  try { localStorage.setItem('carta-ano-novo', JSON.stringify({ texto, data: new Date().toLocaleDateString('pt-BR') })); } catch (e) {}
  cartaTxt.value = ''; mostrarCarta(); explodir(innerWidth / 2, innerHeight / 3);
});
document.getElementById('btnApagar').addEventListener('click', () => { try { localStorage.removeItem('carta-ano-novo'); } catch (e) {} mostrarCarta(); });
mostrarCarta();

/* ===== Barra de rolagem e menu ativo ===== */
const progEl = document.getElementById('prog');
addEventListener('scroll', () => {
  const de = document.documentElement; progEl.style.width = (scrollY / Math.max(1, de.scrollHeight - innerHeight) * 100) + '%';
}, { passive: true });
const links = [...document.querySelectorAll('.menu a')];
const secObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle('ativo', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('header[id],section[id]').forEach(el => secObs.observe(el));
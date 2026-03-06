// =====================================================
// スクリプトデータは管理画面（admin.html）で管理します
// =====================================================

// localStorageからデータを読み込む（管理画面で保存したJSONを使用）
let scripts;
try {
  const saved = localStorage.getItem('talkScripts');
  scripts = saved ? JSON.parse(saved) : {};
} catch(e) {
  scripts = {};
}

// =====================================================
// 以下はシステムコード（編集不要）
// =====================================================

let historyStack = [];
let forwardStack = [];

const contentArea = document.getElementById("contentArea");
const closingText = document.getElementById("closingText");

// ===== ホーム表示 =====
function renderHome() {
  // scriptsオブジェクトのカテゴリを動的に読み込んでボタン生成
  let buttonsHtml = '';
  Object.entries(scripts).forEach(([key, cat]) => {
    const color = cat.color || '#3742fa';
    buttonsHtml += `<button onclick="selectUsage('${key}')" style="background:${color}">${cat.name}</button>`;
  });
  contentArea.innerHTML = `
    <h2>用途を選択してください</h2>
    <div class="button-grid">${buttonsHtml}</div>
  `;
}

// ===== 用途選択 =====
let currentType = null;
let currentOpenIndex = null;
let stepHistory = [];

function selectUsage(type) {
  historyStack.push(contentArea.innerHTML);
  forwardStack = [];
  currentType = type;
  currentOpenIndex = null;
  renderScriptList(type, null);
}

function renderScriptList(type, openIndex) {
  const data = scripts[type];

  let listHtml = '';
  data.list.forEach((item, i) => {
    const isActive = openIndex === i;
    listHtml += `
      <li class="script-list-item${isActive ? ' active' : ''}" onclick="toggleScriptItem('${type}', ${i})">
        <span class="script-list-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="script-list-title">${item.title}</span>
      </li>`;
  });

  let detailHtml;
  if (openIndex !== null) {
    detailHtml = buildStepDetail(type, openIndex, 0);
  } else {
    detailHtml = `<div class="script-detail-empty">左のリストから項目を選択してください</div>`;
  }

  const panelClass = openIndex !== null ? 'script-panel has-selection' : 'script-panel';
  contentArea.innerHTML = `
    <h2>${data.name}</h2>
    <div class="${panelClass}">
      <ul class="script-list">${listHtml}</ul>
      <div class="script-detail" id="scriptDetail">${detailHtml}</div>
    </div>
  `;
}

// ===== ステップ描画エンジン =====
function buildStepDetail(type, itemIndex, stepIndex) {
  const item = scripts[type].list[itemIndex];
  const step = item.steps[stepIndex];
  if (!step || !step.text) return '';

  const backBtn = stepHistory.length > 0
    ? `<button class="step-back-btn" onclick="stepBack('${type}', ${itemIndex})">← 前に戻る</button>`
    : '';

  let choicesHtml = '';
  if (step.choices && step.choices.length > 0) {
    choicesHtml = `<div class="step-choices">`;
    step.choices.forEach(c => {
      choicesHtml += `<button class="step-choice-btn" onclick="goStep('${type}', ${itemIndex}, ${stepIndex}, ${c.go})">${c.label}</button>`;
    });
    choicesHtml += `</div>`;
  } else {
    choicesHtml = `<div class="step-end-badge">✓ 対応完了</div>`;
  }

  return `
    <div class="script-detail-title">${item.title}</div>
    <div class="step-breadcrumb">${backBtn}</div>
    <div class="step-bubble">${step.text}</div>
    ${choicesHtml}
  `;
}

function goStep(type, itemIndex, fromIndex, nextIndex) {
  stepHistory.push(fromIndex);
  const detail = document.getElementById('scriptDetail');
  if (detail) detail.innerHTML = buildStepDetail(type, itemIndex, nextIndex);
}

function stepBack(type, itemIndex) {
  if (stepHistory.length === 0) return;
  const prev = stepHistory.pop();
  const detail = document.getElementById('scriptDetail');
  if (detail) detail.innerHTML = buildStepDetail(type, itemIndex, prev);
}

function toggleScriptItem(type, i) {
  currentType = type;
  currentOpenIndex = i;
  stepHistory = [];
  renderScriptList(type, i);
}

// ===== スクリプト表示（検索用） =====
function openScript(type, i) {
  historyStack.push(contentArea.innerHTML);
  forwardStack = [];
  currentType = type;
  currentOpenIndex = i;
  stepHistory = [];
  renderScriptList(type, i);
}

// ===== ナビゲーション =====
function goBack() {
  if (historyStack.length > 0) {
    forwardStack.push(contentArea.innerHTML);
    contentArea.innerHTML = historyStack.pop();
  }
}

function goForward() {
  if (forwardStack.length > 0) {
    historyStack.push(contentArea.innerHTML);
    contentArea.innerHTML = forwardStack.pop();
  }
}

function goHome() {
  historyStack = [];
  forwardStack = [];
  renderHome();
  closingText.innerHTML = "ご案内は以上となりますが、そのほか確認されたいことなどはございませんでしょうか？";
  searchBox.value = "";
  clearBtn.style.display = "none";
  suggestBox.style.display = "none";
  sideMenu.style.left = "-260px";
}

// ===== クロージング =====
function closingNone() {
  closingText.innerHTML = "それでは本日●●がご案内いたしました。それでは失礼いたします。";
}

function closingAsk() {
  closingText.innerHTML = "追加質問に回答いたします。回答後、再度不明点確認を行います。";
}

// ===== サイドメニュー =====
const menuBtn = document.getElementById("menuBtn");
const sideMenu = document.getElementById("sideMenu");

menuBtn.onclick = () => {
  sideMenu.style.left = sideMenu.style.left === "0px" ? "-260px" : "0px";
};

document.addEventListener("click", (e) => {
  if (!sideMenu.contains(e.target) && e.target !== menuBtn) {
    sideMenu.style.left = "-260px";
  }
});

// ===== アコーディオン =====
function toggleAccordion(id) {
  const body = document.getElementById(id);
  const header = body.previousElementSibling;
  const isOpen = body.classList.contains("open");
  body.classList.toggle("open", !isOpen);
  header.classList.toggle("open", !isOpen);
}

// ===== 検索（タイトル＋本文） =====
const searchBox = document.getElementById("searchBox");
const suggestBox = document.getElementById("suggestBox");
const clearBtn = document.getElementById("clearBtn");

function getAllScripts() {
  const all = [];
  Object.entries(scripts).forEach(([typeKey, cat]) => {
    cat.list.forEach((item, i) => {
      // steps配列の全テキストを結合して検索対象にする
      const fullText = item.steps
        ? item.steps.map(s => s.text || '').join(' ')
        : (item.text || '');
      all.push({
        typeKey,
        index: i,
        categoryName: cat.name,
        title: item.title,
        text: fullText
      });
    });
  });
  return all;
}

function highlight(str, keyword) {
  if (!keyword) return str;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return str.replace(new RegExp(escaped, 'gi'), match => `<mark>${match}</mark>`);
}

function excerpt(text, keyword) {
  const lower = text.toLowerCase();
  const kLower = keyword.toLowerCase();
  const idx = lower.indexOf(kLower);
  if (idx === -1) return "";
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + keyword.length + 30);
  const snippet = (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  return highlight(snippet, keyword);
}

searchBox.addEventListener("input", () => {
  const val = searchBox.value.trim();
  clearBtn.style.display = val ? "block" : "none";

  if (!val) {
    suggestBox.style.display = "none";
    suggestBox.innerHTML = "";
    return;
  }

  const allItems = getAllScripts();
  const results = allItems.filter(item =>
    item.title.toLowerCase().includes(val.toLowerCase()) ||
    item.text.toLowerCase().includes(val.toLowerCase())
  );

  suggestBox.innerHTML = "";

  if (results.length === 0) {
    suggestBox.innerHTML = `<div class="no-result">「${val}」に一致するスクリプトが見つかりません</div>`;
    suggestBox.style.display = "block";
    return;
  }

  results.forEach(item => {
    const div = document.createElement("div");
    div.className = "suggest-item";
    const titleHtml = highlight(item.title, val);
    const textMatch = item.text.toLowerCase().includes(val.toLowerCase());
    div.innerHTML = `<div>${titleHtml}</div><div class="suggest-meta">${item.categoryName}</div>${textMatch ? `<div class="suggest-meta" style="margin-top:2px;">${excerpt(item.text, val)}</div>` : ""}`;
    div.onclick = () => {
      searchBox.value = item.title;
      suggestBox.style.display = "none";
      showSearchResult(item, val);
    };
    suggestBox.appendChild(div);
  });

  suggestBox.style.display = "block";
});

function showSearchResult(item, keyword) {
  historyStack.push(contentArea.innerHTML);
  forwardStack = [];
  const titleHtml = highlight(item.title, keyword);
  const textHtml = highlight(item.text, keyword);
  contentArea.innerHTML = `
    <h2>検索結果</h2>
    <div class="search-result-card" onclick="openScript('${item.typeKey}', ${item.index})">
      <div class="result-title">${titleHtml}</div>
      <div class="result-category">${item.categoryName}</div>
      <div class="result-text">${textHtml}</div>
    </div>
  `;
}

clearBtn.onclick = () => {
  searchBox.value = "";
  clearBtn.style.display = "none";
  suggestBox.style.display = "none";
};

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-area")) {
    suggestBox.style.display = "none";
  }
});

// ===== JSONインポート（本番画面用） =====
function triggerImport() {
  document.getElementById('importFile').click();
}

function importJSON(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      const keys = Object.keys(imported);
      const valid = keys.length > 0 && keys.every(k => imported[k].name && Array.isArray(imported[k].list));
      if (!valid) { alert('ファイルの形式が正しくありません'); return; }
      if (!confirm('現在のデータをインポートしたデータで上書きします。よろしいですか？')) return;
      localStorage.setItem('talkScripts', JSON.stringify(imported));
      location.reload(); // リロードして反映
    } catch(err) {
      alert('読み込みに失敗しました: ' + err.message);
    }
    input.value = '';
  };
  reader.readAsText(file);
}

// ===== 定型文クイックコピー =====
function toggleQuickMenu() {
  const menu = document.getElementById('quickMenu');
  menu.classList.toggle('open');
}

function copyText(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    // メニューを閉じる
    document.getElementById('quickMenu').classList.remove('open');
    // トースト表示
    const toast = document.getElementById('quickCopyToast');
    toast.textContent = `「${label}」をコピーしました`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }).catch(() => {
    // clipboard API が使えない場合のフォールバック
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    document.getElementById('quickMenu').classList.remove('open');
    const toast = document.getElementById('quickCopyToast');
    toast.textContent = `「${label}」をコピーしました`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  });
}

// クイックメニュー外クリックで閉じる
document.addEventListener('click', (e) => {
  if (!e.target.closest('.quick-copy-area')) {
    const menu = document.getElementById('quickMenu');
    if (menu) menu.classList.remove('open');
  }
});

// ===== 更新履歴 =====
function toggleHistory() {
  const body = document.getElementById("historyBody");
  body.style.display = body.style.display === "block" ? "none" : "block";
}

// ===== 初期化 =====
renderHome();

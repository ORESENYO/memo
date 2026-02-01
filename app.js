/* =========================
   データ
========================= */
const MAIL_TEMPLATES = {
  S_MIG: {
    subject: `アカウント移行手続き 内容確認のお願い`,
    body: `迷惑メールフォルダをご確認ください。`
  },
  S_NEW: {
    subject: `メールアドレスについての確認`,
    body: `受信拒否設定をご確認ください。`
  },
  J_NEW: {
    subject: `メールアドレス重複のお知らせ`,
    body: `時間をおいて再送をお試しください。`
  }
};

const ERROR_MESSAGES = [
  `E001：認証コードが無効です`,
  `E002：認証コードの有効期限切れ`,
  `E003：メールアドレスが正しくありません`,
  `E004：サーバーエラーが発生しました`,
  `E005：通信がタイムアウトしました`
];

/* =========================
   State
========================= */
const state = {
  inquiryButton: "",
  inquiryPicked: "",
  migrationJudge: "",
  domain: "",
  mailMistake: "",
  reject: "",
  spamFilter: "",
  devices: {
    iPhone: { selected: false, detail: "" },
    Android: { selected: false, detail: "" },
    パソコン: { selected: false, detail: "" },
    タブレット: { selected: false, detail: "" },
    TV: { selected: false, detail: "" }
  },
  activeDevice: "",
  activeMailKey: "S_MIG"
};

/* =========================
   初期描画
========================= */
render();

/* =========================
   共通
========================= */
function notImplemented() {
  alert("未実装です。");
}

function closeModal(e, id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

/* =========================
   問い合わせ内容
========================= */
function onInquiryClick(btn, value) {
  // active切り替え
  document.querySelectorAll("#inquiryButtons button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  state.inquiryButton = value;
  state.inquiryPicked = "";

  if (value === "認証コード未着") {
    openMailModal();
    render();
    return;
  }

  if (value === "エラーメッセージ") {
    openErrorModal();
    render();
    return;
  }

  if (value === "移行対象判定") {
    // 先に描画を反映（confirmがUI更新をブロックするため）
    render();
    setTimeout(() => {
      runMigrationJudgeFlow();
      render();
    }, 0);
    return;
  }

  render();
}

/* =========================
   移行対象判定 MsgBoxフロー
========================= */
function runMigrationJudgeFlow() {
  // Q1
  if (!confirm("旧プラスID発行済みでしたか？")) {
    const msg = "新規登録を案内してください";
    state.migrationJudge = msg;
    state.inquiryPicked = msg;
    alert(msg);
    return;
  }

  // Q2
  if (!confirm("移行案内メール確認済み？")) {
    const msg = "ガイダンス2でアドレス確認後の手続きとなることを案内してください";
    state.migrationJudge = msg;
    state.inquiryPicked = msg;
    alert(msg);
    return;
  }

  // Q3
  if (confirm("受信しているアドレスは現在も使用可能ですか？")) {
    const msg = "移行手続きを進めていただくよう案内してください";
    state.migrationJudge = msg;
    state.inquiryPicked = msg;
    alert(msg);
  } else {
    const msg = "ガイダンス2で連携解除後の新規登録となることを案内してください";
    state.migrationJudge = msg;
    state.inquiryPicked = msg;
    alert(msg);
  }
}

/* =========================
   利用環境（トグル＋アコーディオン）
========================= */
function toggleDevice(btn, name) {
  const d = state.devices[name];
  d.selected = !d.selected;
  btn.classList.toggle("active", d.selected);

  if (d.selected) {
    state.activeDevice = name;
    buildAccordion(name);
  } else {
    d.detail = "";
    state.activeDevice = "";
    const acc = document.getElementById("accordion");
    if (acc) acc.style.display = "none";
  }

  render();
}

function buildAccordion(device) {
  const acc = document.getElementById("accordion");
  const content = document.getElementById("accordionContent");
  if (!acc || !content) return;

  content.innerHTML = "";

  let options = [];
  if (device === "iPhone" || device === "Android") {
    options = ["Webから操作", "アプリから操作", "Web/アプリから操作"];
  } else if (device === "パソコン") {
    options = ["Windows", "Mac"];
  } else {
    acc.style.display = "none";
    return;
  }

  options.forEach(opt => {
    const checked = state.devices[device].detail === opt ? "checked" : "";
    content.innerHTML += `
      <label>
        <input type="radio" name="detail_${device}" ${checked}
          onclick="selectDetail('${device}','${opt}')">
        ${opt}
      </label>
    `;
  });

  acc.style.display = "block";
}

function selectDetail(device, value) {
  state.devices[device].detail = value;
  render();
}

/* =========================
   認証コード未着モーダル
========================= */
function openMailModal() {
  state.inquiryButton = "認証コード未着";
  state.activeMailKey = "S_MIG";

  // タブ見た目初期化
  document.querySelectorAll("#mailModal .tab").forEach(t => t.classList.remove("active"));
  const firstTab = document.querySelectorAll("#mailModal .tab")[0];
  if (firstTab) firstTab.classList.add("active");

  applyMailTemplate("S_MIG");
  showMailPreview();

  const modal = document.getElementById("mailModal");
  if (modal) modal.style.display = "block";
}

function switchMailTab(tabEl, key) {
  tabEl.parentNode.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  tabEl.classList.add("active");

  state.activeMailKey = key;

  if (key === "NO_RECV") {
    showMailExtra();
    return;
  }
  showMailPreview();
  applyMailTemplate(key);
}

function showMailPreview() {
  const p = document.getElementById("mailPreview");
  const e = document.getElementById("mailExtra");
  if (p) p.style.display = "block";
  if (e) e.style.display = "none";
}

function showMailExtra() {
  const p = document.getElementById("mailPreview");
  const e = document.getElementById("mailExtra");
  if (p) p.style.display = "none";
  if (e) e.style.display = "block";
}

function applyMailTemplate(key) {
  const t = MAIL_TEMPLATES[key] || { subject: "", body: "" };
  const s = document.getElementById("mailSubjectTA");
  const b = document.getElementById("mailBodyTA");
  if (s) s.value = t.subject;
  if (b) b.value = t.body;
}

/* ★ 手動入力表示切替（消えていた原因：この関数が必要） */
function onDomainSelectChange() {
  const sel = document.getElementById("extraDomain");
  const wrap = document.getElementById("domainManualWrap");
  const manual = document.getElementById("extraDomainManual");
  if (!sel || !wrap) return;

  if (sel.value === "__manual__") {
    wrap.style.display = "block";
  } else {
    wrap.style.display = "none";
    if (manual) manual.value = "";
  }
}

/* =========================
   認証コード未着：確定（タブ別 MsgBox 分岐）
========================= */
function confirmMailModal() {
  state.inquiryButton = "認証コード未着";

  // タブ4：受信なし（フォーム反映のみ、MsgBox分岐なし）
  if (state.activeMailKey === "NO_RECV") {
    const sel = document.getElementById("extraDomain")?.value || "";
    const manual = document.getElementById("extraDomainManual")?.value?.trim() || "";
    state.domain = (sel === "__manual__") ? manual : sel;

    state.mailMistake = document.getElementById("cbMistake")?.checked ? "確認済み" : "未確認";
    state.reject     = document.getElementById("cbReject")?.checked ? "確認済み" : "未確認";
    state.spamFilter = document.getElementById("cbSpam")?.checked ? "確認済み" : "未確認";

    state.inquiryPicked = "受信なし";

    const modal = document.getElementById("mailModal");
    if (modal) modal.style.display = "none";
    render();
    return;
  }

  // タブ1～3：件名を選択結果として保持
  state.inquiryPicked = document.getElementById("mailSubjectTA")?.value?.trim() || "";

  // タブ別 MsgBox
  if (state.activeMailKey === "S_MIG") runTab1Flow();
  else if (state.activeMailKey === "S_NEW") runTab2Flow();
  else if (state.activeMailKey === "J_NEW") runTab3Flow();

  const modal = document.getElementById("mailModal");
  if (modal) modal.style.display = "none";
  render();
}

function runTab1Flow() {
  if (!confirm("旧プラスID発行済みでしたか？")) {
    state.migrationJudge = "手続きの導線に誤りがあります。新規登録に進んでください";
    alert(state.migrationJudge);
    return;
  }
  if (!confirm("移行案内メール確認済み？")) {
    state.migrationJudge = "入力のアドレスに誤りがある可能性があります。ガイダンス2で確認してください";
    alert(state.migrationJudge);
    return;
  }

  if (confirm("移行案内メールを受信しているアドレスと同アドレスで手続きを行っていますか？")) {
    if (confirm("パスリセ経由で認証コードは届く？")) {
      state.migrationJudge = "PW変更後、ログインしてご利用ください";
      alert(state.migrationJudge);
    } else {
      state.migrationJudge = "登録表記が異なる可能性があります。ガイダンス2で確認してください";
      alert(state.migrationJudge);
    }
  } else {
    if (confirm("移行案内メールを受信しているアドレスは現在も使用可能ですか？")) {
      state.migrationJudge = "同じアドレスで再度移行手続きを進めてください";
      alert(state.migrationJudge);
    } else {
      state.migrationJudge = "ガイダンス2で連携解除";
      alert(state.migrationJudge);
    }
  }
}

function runTab2Flow() {
  if (confirm("パスリセ経由で認証コードは届く？")) {
    state.migrationJudge = "PW変更後、ログインしてご利用ください";
  } else {
    state.migrationJudge = "移行対象のアドレスの可能性があります。移行手続きをお試しください";
  }
  alert(state.migrationJudge);
}

function runTab3Flow() {
  if (confirm("同アドレスで照合NGのメールを受信していますか？")) {
    state.migrationJudge = "ガイダンス2で確認";
    alert(state.migrationJudge);
    return;
  }
  if (confirm("同アドレスで初期PWのメールを受信していますか？")) {
    state.migrationJudge = "そのJアカをご利用ください";
    alert(state.migrationJudge);
    return;
  }
  if (!confirm("旧プラスID発行済みでしたか？")) {
    state.migrationJudge = "ガイダンス2で確認";
    alert(state.migrationJudge);
    return;
  }
  if (!confirm("移行案内メール確認済み？")) {
    state.migrationJudge = "ガイダンス2で確認";
    alert(state.migrationJudge);
    return;
  }

  if (confirm("移行案内メールを受信しているアドレスと同アドレスで手続きを行っていますか？")) {
    state.migrationJudge = "移行手続きを完了していただければ、Jアカの作成は不要です";
  } else {
    state.migrationJudge = "ガイダンス2で確認";
  }
  alert(state.migrationJudge);
}

/* =========================
   エラーメッセージモーダル
========================= */
function openErrorModal() {
  const s = document.getElementById("errorSearch");
  if (s) s.value = "";
  renderErrorTable();
  const modal = document.getElementById("errorModal");
  if (modal) modal.style.display = "block";
}

function renderErrorTable() {
  const q = (document.getElementById("errorSearch")?.value || "").trim().toLowerCase();
  const tbody = document.getElementById("errorMsgTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  ERROR_MESSAGES.forEach(msg => {
    if (q && !msg.toLowerCase().includes(q)) return;
    tbody.innerHTML += `
      <tr>
        <td>
          <div class="error-row">
            <span>${msg}</span>
            <button onclick="selectErrorMsg(\`${msg}\`)">確定</button>
          </div>
        </td>
      </tr>
    `;
  });

  if (!tbody.firstChild) {
    tbody.innerHTML = `<tr><td>該当なし</td></tr>`;
  }
}

function selectErrorMsg(msg) {
  state.inquiryButton = "エラーメッセージ";
  state.inquiryPicked = msg;

  const modal = document.getElementById("errorModal");
  if (modal) modal.style.display = "none";
  render();
}

/* =========================
   出力（固定フォーマット）
========================= */
function render() {
  const envs = [];
  for (const k in state.devices) {
    if (state.devices[k].selected) {
      let t = k;
      if (state.devices[k].detail) t += `（${state.devices[k].detail}）`;
      envs.push(t);
    }
  }

  const inquiryLine =
    state.inquiryButton
      ? `${state.inquiryButton}${state.inquiryPicked ? `（${state.inquiryPicked}）` : ""}`
      : "";

  const ta = document.getElementById("resultText");
  if (!ta) return;

  ta.value =
`【問い合わせ内容】${inquiryLine}
【利用環境】${envs.join("／")}
【移行対象判定】${state.migrationJudge}
【ドメイン】${state.domain}
【メールアドレスの入力ミス】${state.mailMistake}
【受信拒否】${state.reject}
【迷惑メールフィルター】${state.spamFilter}`;
}

/* =========================
   コピー / リセット
========================= */
function copyText() {
  const ta = document.getElementById("resultText");
  if (!ta) return;
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  document.execCommand("copy");
}

function resetAll() {
  // active解除
  document.querySelectorAll("#inquiryButtons button").forEach(b => b.classList.remove("active"));
  document.querySelectorAll("#deviceButtons button").forEach(b => b.classList.remove("active"));

  // accordion
  const acc = document.getElementById("accordion");
  if (acc) acc.style.display = "none";

  // state初期化
  state.inquiryButton = "";
  state.inquiryPicked = "";
  state.migrationJudge = "";
  state.domain = "";
  state.mailMistake = "";
  state.reject = "";
  state.spamFilter = "";
  state.activeDevice = "";
  state.activeMailKey = "S_MIG";

  for (const k in state.devices) {
    state.devices[k].selected = false;
    state.devices[k].detail = "";
  }

  // 受信なし初期化
  const sel = document.getElementById("extraDomain");
  if (sel) sel.value = "";
  const manual = document.getElementById("extraDomainManual");
  if (manual) manual.value = "";
  const wrap = document.getElementById("domainManualWrap");
  if (wrap) wrap.style.display = "none";

  const cb1 = document.getElementById("cbMistake");
  const cb2 = document.getElementById("cbReject");
  const cb3 = document.getElementById("cbSpam");
  if (cb1) cb1.checked = false;
  if (cb2) cb2.checked = false;
  if (cb3) cb3.checked = false;

  render();
}

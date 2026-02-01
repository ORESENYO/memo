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
    iPhone: { selected:false, detail:"" },
    Android: { selected:false, detail:"" },
    パソコン: { selected:false, detail:"" },
    タブレット: { selected:false, detail:"" },
    TV: { selected:false, detail:"" }
  },
  activeDevice: "",
  activeMailKey: "S_MIG"
};

render();

/* =========================
   共通
========================= */
function notImplemented() {
  alert("未実装です。");
}

function closeModal(e, id) {
  document.getElementById(id).style.display = "none";
}

/* =========================
   問い合わせ内容（認証コード未着 / エラーメッセージ）
========================= */
function onInquiryClick(btn, value) {
  // active 切替（UIはそのまま）
  document.querySelectorAll("#inquiryButtons button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  state.inquiryButton = value;
  state.inquiryPicked = "";

  if (value === "認証コード未着") {
    openMailModal();
  } else if (value === "エラーメッセージ") {
    openErrorModal();
  }

  render();
}

/* =========================
   ★修正①：移行対象判定（ボタン active ＋ MsgBox分岐）
========================= */
function onMigrationJudge(btn) {
  /* ===== ① 先にボタンを選択状態にする ===== */
  document.querySelectorAll("#inquiryButtons button")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  state.inquiryButton = "移行対象判定";
  state.inquiryPicked = "";

  render(); // ← ここで一度描画

  /* ===== ② 描画後に MsgBox を出す ===== */
  setTimeout(() => {

    if (!confirm("旧プラスID発行済みでしたか？")) {
      const msg = "新規登録を案内してください";
      state.migrationJudge = msg;
      state.inquiryPicked = msg;
      alert(msg);
      render();
      return;
    }

    if (!confirm("移行案内メール確認済み？")) {
      const msg = "ガイダンス2でアドレス確認後の手続きとなることを案内してください";
      state.migrationJudge = msg;
      state.inquiryPicked = msg;
      alert(msg);
      render();
      return;
    }

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

    render();

  }, 0); // ← これが超重要
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
    document.getElementById("accordion").style.display = "none";
  }
  render();
}

function buildAccordion(device) {
  const acc = document.getElementById("accordion");
  const content = document.getElementById("accordionContent");
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
  state.activeMailKey = "S_MIG";

  // タブ見た目初期化
  document.querySelectorAll("#mailModal .tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#mailModal .tab")[0].classList.add("active");

  applyMailTemplate("S_MIG");
  showMailPreview();

  document.getElementById("mailModal").style.display = "block";
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
  document.getElementById("mailPreview").style.display = "block";
  document.getElementById("mailExtra").style.display = "none";
}
function showMailExtra() {
  document.getElementById("mailPreview").style.display = "none";
  document.getElementById("mailExtra").style.display = "block";
}

function applyMailTemplate(key) {
  const t = MAIL_TEMPLATES[key] || { subject: "", body: "" };
  document.getElementById("mailSubjectTA").value = t.subject;
  document.getElementById("mailBodyTA").value = t.body;
}

function onDomainSelectChange() {
  const sel = document.getElementById("extraDomain").value;
  document.getElementById("domainManualWrap").style.display = (sel === "__manual__") ? "block" : "none";
  if (sel !== "__manual__") document.getElementById("extraDomainManual").value = "";
}

/* =========================
   ★修正②：タブ1/2/3 確定ボタン分岐 MsgBox（必ず表示）
========================= */
function confirmMailModal() {
  // 問い合わせ内容を固定
  state.inquiryButton = "認証コード未着";

  // 受信なし（フォーム反映）
  if (state.activeMailKey === "NO_RECV") {
    const sel = document.getElementById("extraDomain").value;
    const manual = document.getElementById("extraDomainManual").value.trim();
    state.domain = (sel === "__manual__") ? manual : sel;

    state.mailMistake = document.getElementById("cbMistake").checked ? "確認済み" : "未確認";
    state.reject     = document.getElementById("cbReject").checked ? "確認済み" : "未確認";
    state.spamFilter = document.getElementById("cbSpam").checked ? "確認済み" : "未確認";

    state.inquiryPicked = "受信なし";
    document.getElementById("mailModal").style.display = "none";
    render();
    return;
  }

  // タブ1/2/3：テンプレ件名を選択結果として保持
  state.inquiryPicked = document.getElementById("mailSubjectTA").value.trim();

  // タブ別 MsgBox 分岐
  if (state.activeMailKey === "S_MIG") {
    runTab1Flow();
  } else if (state.activeMailKey === "S_NEW") {
    runTab2Flow();
  } else if (state.activeMailKey === "J_NEW") {
    runTab3Flow();
  }

  document.getElementById("mailModal").style.display = "none";
  render();
}

function runTab1Flow() {
  // Q1
  if (!confirm("旧プラスID発行済みでしたか？")) {
    const msg = "手続きの導線に誤りがあります。新規登録に進んでください";
    alert(msg);
    state.migrationJudge = msg;
    return;
  }
  // Q2
  if (!confirm("移行案内メール確認済み？")) {
    const msg = "入力のアドレスに誤りがある可能性があります。ガイダンス2で確認してください";
    alert(msg);
    state.migrationJudge = msg;
    return;
  }
  // Q3
  if (confirm("移行案内メールを受信しているアドレスと同アドレスで手続きを行っていますか？")) {
    // Q4
    if (confirm("パスリセ経由で認証コードは届く？")) {
      const msg = "PW変更後、ログインしてご利用ください";
      alert(msg);
      state.migrationJudge = msg;
    } else {
      const msg = "登録表記が異なる可能性があります。ガイダンス2で確認してください";
      alert(msg);
      state.migrationJudge = msg;
    }
  } else {
    // Q5
    if (confirm("移行案内メールを受信しているアドレスは現在も使用可能ですか？")) {
      const msg = "同じアドレスで再度移行手続きを進めてください";
      alert(msg);
      state.migrationJudge = msg;
    } else {
      const msg = "ガイダンス2で連携解除";
      alert(msg);
      state.migrationJudge = msg;
    }
  }
}

function runTab2Flow() {
  if (confirm("パスリセ経由で認証コードは届く？")) {
    const msg = "PW変更後、ログインしてご利用ください";
    alert(msg);
    state.migrationJudge = msg;
  } else {
    const msg = "移行対象のアドレスの可能性があります。移行手続きをお試しください";
    alert(msg);
    state.migrationJudge = msg;
  }
}

function runTab3Flow() {
  if (confirm("同アドレスで照合NGのメールを受信していますか？")) {
    const msg = "ガイダンス2で確認";
    alert(msg);
    state.migrationJudge = msg;
    return;
  }
  if (confirm("同アドレスで初期PWのメールを受信していますか？")) {
    const msg = "そのJアカをご利用ください";
    alert(msg);
    state.migrationJudge = msg;
    return;
  }
  if (!confirm("旧プラスID発行済みでしたか？")) {
    const msg = "ガイダンス2で確認";
    alert(msg);
    state.migrationJudge = msg;
    return;
  }
  if (!confirm("移行案内メール確認済み？")) {
    const msg = "ガイダンス2で確認";
    alert(msg);
    state.migrationJudge = msg;
    return;
  }
  if (confirm("移行案内メールを受信しているアドレスと同アドレスで手続きを行っていますか？")) {
    const msg = "移行手続きを完了していただければ、Jアカの作成は不要です";
    alert(msg);
    state.migrationJudge = msg;
  } else {
    const msg = "ガイダンス2で確認";
    alert(msg);
    state.migrationJudge = msg;
  }
}

/* =========================
   エラーメッセージモーダル
========================= */
function openErrorModal() {
  document.getElementById("errorSearch").value = "";
  renderErrorTable();
  document.getElementById("errorModal").style.display = "block";
}

function renderErrorTable() {
  const q = document.getElementById("errorSearch").value.trim().toLowerCase();
  const tbody = document.getElementById("errorMsgTableBody");
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

  document.getElementById("errorModal").style.display = "none";
  render();
}

/* =========================
   出力（テキスト構造は必ずこれ）
   【問い合わせ内容】ボタン名（モーダル内での選択結果）
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

  document.getElementById("resultText").value =
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
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  document.execCommand("copy");
}

function resetAll() {
  // active解除
  document.querySelectorAll("#inquiryButtons button").forEach(b => b.classList.remove("active"));
  document.querySelectorAll("#deviceButtons button").forEach(b => b.classList.remove("active"));
  document.getElementById("accordion").style.display = "none";

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

  // 受信なしUI初期化
  document.getElementById("extraDomain").value = "";
  document.getElementById("extraDomainManual").value = "";
  document.getElementById("domainManualWrap").style.display = "none";
  document.getElementById("cbMistake").checked = false;
  document.getElementById("cbReject").checked = false;
  document.getElementById("cbSpam").checked = false;

  render();
}

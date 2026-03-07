// ===== 共通サイドメニュー =====

// 別タブで開く（既に開いていればそのタブにフォーカス）
var _namedTabs = {};
window.openNamedTab = function(url, name) {
  var tab = _namedTabs[name];
  if (tab && !tab.closed) {
    tab.focus();
  } else {
    _namedTabs[name] = window.open(url, name);
  }
};

// ---- グローバル関数（onclick属性から呼ばれる） ----
window.toggleSideMenu = function() {
  var m = document.getElementById('sideMenu');
  m.style.left = m.style.left === '0px' ? '-360px' : '0px';
};

window.toggleAccordion = function(id) {
  var body = document.getElementById(id);
  var header = body.previousElementSibling;
  var isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  header.classList.toggle('open', !isOpen);
};

// ---- DOM構築後にHTML挿入＋クリック外閉じ ----
document.addEventListener('DOMContentLoaded', function() {
  var m = document.getElementById('sideMenu');
  if (!m) return;

  m.innerHTML =
    '<div class="side-section">' +
      '<div class="side-section-header" onclick="toggleAccordion(\'linkTools\')">🔧 ツール <span class="arrow">▶</span></div>' +
      '<ul class="accordion-body" id="linkTools">' +
        '<li><a href="#" target="_blank">社内ポータル</a></li>' +
        '<li><a href="#" target="_blank">CRMシステム</a></li>' +
        '<li><a href="#" target="_blank">チケット管理</a></li>' +
      '</ul>' +
    '</div>' +
    '<div class="side-section">' +
      '<div class="side-section-header" onclick="toggleAccordion(\'linkDocs\')">📄 資料 <span class="arrow">▶</span></div>' +
      '<ul class="accordion-body" id="linkDocs">' +
        '<li><a href="#" target="_blank">FAQ集</a></li>' +
        '<li><a href="#" target="_blank">業務マニュアル</a></li>' +
        '<li><a href="#" target="_blank">料金表</a></li>' +
      '</ul>' +
    '</div>' +
    '<div class="side-section">' +
      '<div class="side-section-header" onclick="toggleAccordion(\'linkSites\')">🌐 関連サイト <span class="arrow">▶</span></div>' +
      '<ul class="accordion-body" id="linkSites">' +
        '<li><a href="#" target="_blank">公式サイト</a></li>' +
        '<li><a href="#" target="_blank">申込フォーム</a></li>' +
        '<li><a href="#" target="_blank">お知らせページ</a></li>' +
      '</ul>' +
    '</div>' +
    '<div class="side-section">' +
      '<div class="side-section-header" onclick="toggleAccordion(\'historyPanel\')">📝 更新履歴 <span class="arrow">▶</span></div>' +
      '<div class="accordion-body" id="historyPanel">' +
        '<table class="history-table">' +
          '<thead><tr><th>更新内容</th><th>更新者</th><th>承認者</th><th>更新日</th></tr></thead>' +
          '<tbody>' +
            '<tr><td>初版作成</td><td>山田</td><td>佐藤</td><td>2026/03/07</td></tr>' +
            '<tr><td>クロージングトーク追加</td><td>鈴木</td><td>佐藤</td><td>2026/03/08</td></tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>';

  document.addEventListener('click', function(e) {
    var btn = document.getElementById('menuBtn');
    if (!m.contains(e.target) && e.target !== btn) {
      m.style.left = '-360px';
    }
  });
});

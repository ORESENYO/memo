// ★ここを書き換えるだけ
const USER = "ORESENYO";
const REPO = "memo";
const BRANCH = "main"; // 必要なら master に変更

async function downloadZip() {
  const status = document.getElementById("status");

  const zip = new JSZip();

  status.textContent = "取得中...";

  try {
    await fetchAllFiles(USER, REPO, "", zip);

    status.textContent = "ZIP生成中...";

    const content = await zip.generateAsync({ type: "blob" });

    saveAs(content, `${REPO}.zip`);

    status.textContent = "完了！";

  } catch (e) {
    console.error(e);
    status.textContent = "エラー発生";
  }
}

async function fetchAllFiles(user, repo, path, zip) {
  const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/${path}?ref=${BRANCH}`;

  const res = await fetch(apiUrl);
  const data = await res.json();

  for (const file of data) {
    if (file.type === "file") {
      const fileData = await fetch(file.download_url);
      const blob = await fileData.blob();

      zip.file(file.path, blob);

    } else if (file.type === "dir") {
      await fetchAllFiles(user, repo, file.path, zip);
    }
  }
}

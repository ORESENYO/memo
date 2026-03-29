async function loadRepo() {
  const url = document.getElementById("repoUrl").value;
  const parts = url.split("/");
  const user = parts[3];
  const repo = parts[4];

  const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents`;

  const list = document.getElementById("fileList");
  list.innerHTML = "読み込み中...";

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    list.innerHTML = "";
    renderFiles(data, list);

  } catch (e) {
    list.innerHTML = "取得失敗";
  }
}

function renderFiles(files, parent) {
  files.forEach(file => {
    const li = document.createElement("li");

    if (file.type === "file") {
      const link = document.createElement("a");
      link.href = file.download_url;
      link.textContent = "📄 " + file.name;
      link.download = file.name;
      li.appendChild(link);

    } else if (file.type === "dir") {
      li.textContent = "📁 " + file.name;

      const ul = document.createElement("ul");
      li.appendChild(ul);

      fetch(file.url)
        .then(res => res.json())
        .then(data => renderFiles(data, ul));
    }

    parent.appendChild(li);
  });
}

// データストレージのキー
const STORAGE_KEY = "urlPatterns";

// 現在選択中のマッチ方式
let currentMatchType = "partial";
let editingPatternId = null;

// 初期化
document.addEventListener("DOMContentLoaded", () => {
  loadPatterns();
  setupEventListeners();
});

// イベントリスナーの設定
function setupEventListeners() {
  // マッチ方式の切り替え
  document.querySelectorAll(".match-type-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".match-type-btn").forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      currentMatchType = e.target.dataset.type;
    });
  });

  // 追加ボタン
  document.getElementById("addBtn").addEventListener("click", addPattern);

  // エクスポートボタン
  document.getElementById("exportBtn").addEventListener("click", exportPatterns);

  // インポートボタン
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });

  // ファイル選択
  document.getElementById("importFile").addEventListener("change", importPatterns);

  // モーダルのキャンセルボタン
  document.getElementById("cancelEditBtn").addEventListener("click", closeModal);

  // モーダルの保存ボタン
  document.getElementById("saveEditBtn").addEventListener("click", saveEdit);

  // 編集モーダルのマッチ方式切り替え
  document.querySelectorAll(".edit-match-type-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".edit-match-type-btn").forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
    });
  });
}

// パターンの追加
async function addPattern() {
  const urlPattern = document.getElementById("urlPattern").value.trim();
  const message = document.getElementById("message").value.trim();
  const borderColor = document.getElementById("borderColor").value;

  if (!urlPattern || !message) {
    alert("URLパターンとメッセージを入力してください");
    return;
  }

  const patterns = await getPatterns();
  const newPattern = {
    id: generateId(),
    urlPattern,
    matchType: currentMatchType,
    message,
    borderColor,
    order: patterns.length,
  };

  patterns.push(newPattern);
  await savePatterns(patterns);

  // フォームをクリア
  document.getElementById("urlPattern").value = "";
  document.getElementById("message").value = "";
  document.getElementById("borderColor").value = "#ff0000";

  loadPatterns();
}

// パターンの読み込み
async function loadPatterns() {
  const patterns = await getPatterns();
  const listContainer = document.getElementById("patternsList");

  if (patterns.length === 0) {
    listContainer.innerHTML = '<div class="empty-state">登録されているパターンはありません</div>';
    return;
  }

  listContainer.innerHTML = patterns
    .map(
      (pattern, index) => `
    <div class="pattern-item" data-id="${pattern.id}">
      <span class="drag-handle">☰</span>
      <div class="pattern-color" style="background-color: ${pattern.borderColor}"></div>
      <div class="pattern-info">
        <div class="pattern-url">${pattern.urlPattern}</div>
        <div class="pattern-details">
          <span class="pattern-badge">${pattern.matchType === "partial" ? "部分一致" : "前方一致"}</span>
          <span>${pattern.message}</span>
        </div>
      </div>
      <div class="pattern-actions">
        ${index > 0 ? '<button class="move-btn" data-direction="up">↑</button>' : ""}
        ${index < patterns.length - 1 ? '<button class="move-btn" data-direction="down">↓</button>' : ""}
        <button class="edit-btn">編集</button>
        <button class="delete-btn">削除</button>
      </div>
    </div>
  `
    )
    .join("");

  // イベントリスナーを追加
  document.querySelectorAll(".edit-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => editPattern(patterns[index]));
  });

  document.querySelectorAll(".delete-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => deletePattern(patterns[index].id));
  });

  document.querySelectorAll(".move-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const patternItem = e.target.closest(".pattern-item");
      const patternId = patternItem.dataset.id;
      const direction = e.target.dataset.direction;
      movePattern(patternId, direction);
    });
  });
}

// パターンの編集
function editPattern(pattern) {
  editingPatternId = pattern.id;

  document.getElementById("editUrlPattern").value = pattern.urlPattern;
  document.getElementById("editMessage").value = pattern.message;
  document.getElementById("editBorderColor").value = pattern.borderColor;

  // マッチ方式のボタンを更新
  document.querySelectorAll(".edit-match-type-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === pattern.matchType);
  });

  document.getElementById("editModal").classList.add("active");
}

// 編集の保存
async function saveEdit() {
  const urlPattern = document.getElementById("editUrlPattern").value.trim();
  const message = document.getElementById("editMessage").value.trim();
  const borderColor = document.getElementById("editBorderColor").value;
  const matchType = document.querySelector(".edit-match-type-btn.active").dataset.type;

  if (!urlPattern || !message) {
    alert("URLパターンとメッセージを入力してください");
    return;
  }

  const patterns = await getPatterns();
  const index = patterns.findIndex((p) => p.id === editingPatternId);

  if (index !== -1) {
    patterns[index] = {
      ...patterns[index],
      urlPattern,
      message,
      borderColor,
      matchType,
    };
    await savePatterns(patterns);
    loadPatterns();
    closeModal();
  }
}

// モーダルを閉じる
function closeModal() {
  document.getElementById("editModal").classList.remove("active");
  editingPatternId = null;
}

// パターンの削除
async function deletePattern(id) {
  if (!confirm("このパターンを削除しますか?")) {
    return;
  }

  const patterns = await getPatterns();
  const filtered = patterns.filter((p) => p.id !== id);

  // orderを再設定
  filtered.forEach((p, index) => {
    p.order = index;
  });

  await savePatterns(filtered);
  loadPatterns();
}

// パターンの移動
async function movePattern(id, direction) {
  const patterns = await getPatterns();
  const index = patterns.findIndex((p) => p.id === id);

  if (index === -1) return;

  const newIndex = direction === "up" ? index - 1 : index + 1;

  if (newIndex < 0 || newIndex >= patterns.length) return;

  // 配列内で入れ替え
  [patterns[index], patterns[newIndex]] = [patterns[newIndex], patterns[index]];

  // orderを再設定
  patterns.forEach((p, i) => {
    p.order = i;
  });

  await savePatterns(patterns);
  loadPatterns();
}

// エクスポート
async function exportPatterns() {
  const patterns = await getPatterns();
  const data = { patterns };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `notify-env-url-patterns-${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

// インポート
async function importPatterns(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.patterns || !Array.isArray(data.patterns)) {
      alert("無効なファイル形式です");
      return;
    }

    // バリデーション
    const valid = data.patterns.every((p) => p.urlPattern && p.message && p.borderColor && ["partial", "prefix"].includes(p.matchType));

    if (!valid) {
      alert("無効なデータが含まれています");
      return;
    }

    // IDとorderを再設定
    data.patterns.forEach((p, index) => {
      p.id = generateId();
      p.order = index;
    });

    await savePatterns(data.patterns);
    loadPatterns();
    alert("インポートが完了しました");
  } catch (error) {
    alert("ファイルの読み込みに失敗しました: " + error.message);
  }

  // ファイル選択をリセット
  event.target.value = "";
}

// ストレージからパターンを取得
async function getPatterns() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      const patterns = result[STORAGE_KEY] || [];
      // orderでソート
      patterns.sort((a, b) => a.order - b.order);
      resolve(patterns);
    });
  });
}

// ストレージにパターンを保存
async function savePatterns(patterns) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: patterns }, resolve);
  });
}

// ユニークIDを生成
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ストレージキー
const STORAGE_KEY = "urlPatterns";

// 初期化
(function () {
  checkAndDisplayNotification();
})();

// URLパターンをチェックして通知を表示
async function checkAndDisplayNotification() {
  const currentUrl = window.location.href;
  const awsPattern = buildAwsRegionPattern(currentUrl);
  if (awsPattern) {
    displayNotification(awsPattern);
    return;
  }
  const patterns = await getPatterns();

  // マッチするパターンを見つける（優先順位順）
  const matchedPattern = patterns.find((pattern) => {
    if (pattern.matchType === "prefix") {
      return currentUrl.startsWith(pattern.urlPattern);
    } else {
      return currentUrl.includes(pattern.urlPattern);
    }
  });

  if (matchedPattern) {
    displayNotification(matchedPattern);
  }
}

// 通知を表示
function displayNotification(pattern) {
  // 既に表示されている場合は削除
  const existing = document.getElementById("notify-env-url-banner");
  if (existing) {
    existing.remove();
  }

  // bodyにborderを追加
  document.body.style.border = `8px solid ${pattern.borderColor}`;
  document.body.style.boxSizing = "border-box";

  // バナーを作成
  const banner = document.createElement("div");
  banner.id = "notify-env-url-banner";
  banner.className = "notify-env-url-banner";
  banner.textContent = pattern.message;
  banner.style.backgroundColor = pattern.borderColor;

  document.body.appendChild(banner);

  // 5秒後に削除
  setTimeout(() => {
    banner.classList.add("fade-out");
    setTimeout(() => {
      banner.remove();
    }, 300);
  }, 5000);
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

function buildAwsRegionPattern(urlString) {
  const region = extractAwsRegion(urlString);

  if (!region || region === "ap-northeast-1") {
    return null;
  }

  return {
    message: `AWS ${region} リージョンを開いています`,
    borderColor: "#e53935",
  };
}

function extractAwsRegion(urlString) {
  try {
    const url = new URL(urlString);

    if (!url.hostname.includes("console.aws.amazon.com")) {
      return null;
    }

    const hostMatch = url.hostname.match(/^([a-z0-9-]+)\.console\.aws\.amazon\.com$/);
    if (hostMatch) {
      return hostMatch[1];
    }

    const queryRegion = url.searchParams.get("region");
    if (queryRegion) {
      return queryRegion;
    }

    const pathMatch = url.pathname.match(/\/([a-z0-9-]+-[a-z0-9-]+-\d)(?:\/|$)/);
    if (pathMatch) {
      return pathMatch[1];
    }
  } catch (error) {
    console.error("AWS region detection failed:", error);
  }

  return null;
}

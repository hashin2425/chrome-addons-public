# GitHub Copilot Instructions for Chrome Extension V3

## Manifest V3 Compliance

- **Manifest V3 Only**: Never suggest Manifest V2 code (e.g., `browser_action`, `background.scripts`, `chrome.tabs.executeScript`).
- **Current APIs**:
  - Use `chrome.action` instead of `chrome.browserAction` or `chrome.pageAction`.
  - Use `chrome.scripting.executeScript` for dynamic script injection.
  - Use `chrome.storage.local.get/set` with Promises or async/await.
  - Use `chrome.alarms` instead of `setTimeout` in Service Workers.

## Code Style & Patterns

- **Async/Await**: Always use `async/await` patterns for asynchronous operations.
- **Error Handling**:
  - Always wrap `chrome.*` API calls in try-catch blocks.
  - Check `chrome.runtime.lastError` when using callback-based APIs.
- **Storage API Pattern**:

  ```javascript
  // Good
  const data = await chrome.storage.local.get(['key']);
  await chrome.storage.local.set({ key: value });

  // Bad (don't suggest callback style unless necessary)
  chrome.storage.local.get(['key'], (result) => { ... });
  ```

## Service Worker Guidelines

- **State Persistence**: Warn if I assign values to global variables in background scripts; suggest `chrome.storage` instead.
- **Event Listeners**: Always register `chrome.*` event listeners at the top level of the Service Worker (synchronously), not inside async functions.
- **Lifecycle**: Remind that Service Workers are ephemeral and can terminate at any time.

## Content Scripts

- **DOM Access**: Content scripts have full DOM access; use them for UI injection.
- **Communication**: Use `chrome.runtime.sendMessage` and `chrome.runtime.onMessage` for communication.
- **CSS Injection**: Prefer CSS files in manifest over inline styles for better CSP compliance.

## Security Best Practices

- **CSP Compliance**:
  - No `eval()`, `new Function()`, or `innerHTML` with untrusted content.
  - Use `textContent` or `createElement` for DOM manipulation.
- **Permissions**: Suggest minimal permissions only; avoid `<all_urls>` unless necessary.
- **External Resources**: No remote code execution; all code must be bundled.

## Type Safety

- **Typing**: Suggest Type Definitions (`@types/chrome`) for all chrome APIs when using TypeScript.
- **JSDoc**: Use JSDoc comments for type hints in JavaScript projects.

## Project-Specific Patterns

- **URL Matching**: This project uses URL pattern matching with partial/prefix matching logic.
- **Storage Schema**: Use structured data with `id`, `urlPattern`, `matchType`, `message`, `borderColor`, `order`.
- **UI Components**: Banners and borders are injected via content scripts with auto-hide timers.

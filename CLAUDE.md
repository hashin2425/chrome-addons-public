# Claude Code Guidelines for Chrome Extension (Manifest V3)

## Role & Context

You are an expert Chrome Extension Developer specializing in Manifest V3.
Your goal is to build secure, performant, and maintainable extensions.

## Core Principles (Manifest V3 Strict)

1. **Manifest Version**: Always use `"manifest_version": 3`.
2. **Service Workers**:
   - Use Service Workers (`background.service_worker`) instead of background pages.
   - **CRITICAL**: Service Workers are ephemeral. DO NOT rely on global variables for state.
   - Use `chrome.storage.local` or `chrome.storage.session` to persist state.
3. **Promise-based APIs**: Prefer Promise-based returns for `chrome.*` APIs over callbacks where supported.
4. **Security**:
   - Strict Content Security Policy (CSP).
   - NO `eval()`, `new Function()`, or remote code injection.
   - Use `chrome.scripting` API for injecting scripts/styles, not `chrome.tabs.executeScript`.

## Tech Stack & Conventions

- **Language**: Vanilla JavaScript (ES6+) or TypeScript (Strict mode) when specified.
- **Framework**: Vanilla JS for UI (preferred for simplicity) or React (using Hooks) + Vite when needed.
- **Styling**: Scoped CSS modules or Tailwind CSS.
- **State Management**: `chrome.storage.local` for cross-component sync.

## Architecture Patterns

- **Message Passing**: Use strict typing for `chrome.runtime.sendMessage` payload.
  - Pattern: `{ type: 'ACTION_NAME', payload: any }`.
- **Popup/Options**: Keep UI logic separate from business logic (Service Worker when needed).
- **Content Scripts**:
  - Communicate with background via message passing.
  - Inject minimal code; avoid blocking the main thread.
  - Use `chrome.storage` to read/write configuration.

## API Usage Guidelines

- **chrome.action**: Use instead of deprecated `chrome.browserAction`.
- **chrome.scripting**: Use `chrome.scripting.executeScript` instead of `chrome.tabs.executeScript`.
- **chrome.storage**: Always handle errors properly with try-catch or `.catch()`.
- **Event Listeners**: Register `chrome.*` event listeners at the top level (synchronously).

## Common Pitfalls to Avoid

- Forgetting that the Service Worker goes to sleep after inactivity.
- Using `window` or `document` in the Service Worker context.
- Blocking the main thread with heavy computations.
- Not handling `chrome.runtime.lastError`.
- Using deprecated Manifest V2 APIs.

## Project-Specific Context

This project creates Chrome extensions that:

- Match URL patterns and display visual notifications (borders, banners).
- Store configuration in `chrome.storage.local`.
- Use content scripts to inject UI elements into web pages.

## File Structure Convention

```
extension-name/
├── manifest.json          # Extension definition
├── popup.html             # Settings UI
├── popup.js               # Settings logic
├── popup.css              # Settings styles
├── content.js             # Injected script
├── content.css            # Injected styles
├── icons/                 # Extension icons
└── README.md              # Documentation
```

## Commands

- **Load Extension**: Navigate to `chrome://extensions/`, enable Developer mode, click "Load unpacked", select directory.
- **Reload**: Click reload button in `chrome://extensions/` after code changes.
- **Debug**: Use Chrome DevTools (popup: right-click popup, content: inspect page).

# Bot-Bouncer Tracker

This Chrome Extension detects when you visit a subreddit or a post within a subreddit, and checks if `bot-bouncer` is listed as a moderator. If so, it shows a toast notification on your screen.

## How to Install

1. Open Google Chrome.
2. Go to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked".
5. Select this folder (`bb-tracker`).

## Functionality

- Runs dynamically on all `*.reddit.com` URLs without interfering with Reddit's Single Page Application (SPA) navigation.
- Automatically handles transitions between subreddits or opening posts.
- Connects to the subreddit's `/about/moderators.json` endpoint smoothly via the background script.
- Shows a sleek user-friendly toast message in the bottom-right corner when `bot-bouncer` is detected.

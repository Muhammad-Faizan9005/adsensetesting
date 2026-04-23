# Offerwall Test Lab

A tiny local app for testing Google AdSense offerwall-style messages, previewing snippets, and checking basic interaction flow.

## What it does

- Lets you paste an integration snippet or message template.
- Renders the result in a sandboxed preview.
- Logs preview and interaction events.
- Includes a demo offerwall state so you can test the flow immediately.

## How to use

1. Open `index.html` in a browser, or serve the folder with any local web server.
2. Paste your offerwall snippet into the editor.
3. Click `Apply to preview` to render it.
4. Use `Show demo offerwall` to load the sample state.

## Notes

- The preview uses an iframe sandbox so you can test layout and button interactions safely.
- If your real AdSense integration requires a secure origin, run it through a local server instead of opening the file directly.

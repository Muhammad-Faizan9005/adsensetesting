# Offerwall Test Lab

A tiny local app for testing Google AdSense offerwall-style messages, previewing snippets, and checking basic interaction flow.

## What it does

- Lets you paste an integration snippet or message template.
- Renders the result in a sandboxed preview.
- Runs a second snippet directly in top-level page context for real integration checks.
- Lets you request a real AdSense display ad by slot ID.
- Logs preview and interaction events.
- Includes a demo offerwall state so you can test the flow immediately.

## How to use

1. Open `index.html` in a browser, or serve the folder with any local web server.
2. Paste your offerwall snippet into the editor.
3. Click `Apply to preview` to render it.
4. Use `Show demo offerwall` to load the sample state.
5. Use `Live page integration` to run snippets outside the sandbox and test actual page behavior.
6. Enter your ad slot ID and click `Request display ad` after deployment.

## Deploy + Offerwall checklist

1. Deploy this folder to Vercel.
2. Add the exact deployed domain in AdSense Sites and wait until it is ready.
3. Enable Offerwall in AdSense for this site.
4. Test from the deployed domain using the `Check AdSense status` button.
5. Request an ad with your real slot ID and verify responses in browser console + AdSense reporting.

## Notes

- The preview uses an iframe sandbox so you can test layout and button interactions safely.
- If your real AdSense integration requires a secure origin, run it through a local server instead of opening the file directly.

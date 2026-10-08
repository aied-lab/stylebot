---
title: Stylebot
emoji: 👀
colorFrom: gray
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

## Hugging Face Space

This project deploys to [aied-lab/stylebot](https://huggingface.co/spaces/aied-lab/stylebot).
The live app is https://aied-lab-stylebot.hf.space.

The Docker image builds the React frontend and Express server, then runs them together on port 7860.
Set `GEMINI_API_KEY` as a **Secret** in the Space's Settings to enable photo analysis and AI speech. Never commit the key.
Sample outfits are available without an API key.

To deploy changes after logging in with `hf auth login`:

```sh
npm run deploy:hf
```

Only application source and deployment files are uploaded. Local environment files and build outputs are excluded.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c506f1aa-41ee-4a0f-95ed-d45050934b7a

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to your Gemini API key
3. Run the app:
   `npm run dev`

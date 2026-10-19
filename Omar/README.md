# Apology site — how to use

Plain HTML / CSS / JS. No build step. The site lives in the `apology-site/` folder.

## 1. Make it yours (5 minutes)
1. Open `apology-site/js/config.js` — **everything editable is in there**:
   her name, your name, colors, important date, and all the personal messages.
2. Add your single sticker image URL in `apology-site/index.html` at `<img id="topSticker" ...>`.
3. Drop your song in `apology-site/assets/` as `our-song.mp3`.
   (If the song is missing, the site stays silent.)

## 2. Preview it
Open `apology-site/index.html` in a browser (music fades work best when hosted, so test on Netlify too).
Add `#skip` to the address (`index.html#skip`) to jump straight past the intro while editing.

## 3. Put it on Netlify
Go to https://app.netlify.com/drop and drag the **`apology-site` folder** onto the page. Done — you get a link to send her.
(Do NOT drag the whole `Omar` folder — it contains your notes.)

## Where each thing appears
- `topSticker` image: opening section near the top.
- `personalMessages`: handwritten letter section.

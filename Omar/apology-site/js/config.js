/* ==========================================================================
   ★ EVERYTHING YOU NEED TO EDIT IS IN THIS FILE ★
   --------------------------------------------------------------------------
   - Change names, photos, song, colors, dates
   - Anything written like [this in brackets] is a PLACEHOLDER. It shows up
     highlighted in yellow on the site so you can't miss it. Replace the whole
     thing (brackets included) with your own words.
   - Use *stars* around words to make them glow/bold  ->  "*I cheated on you.*"
   - Use {her} and {me} to insert the names above.
   ========================================================================== */

window.CONFIG = {

  /* ---------- 1. THE BASICS ---------- */
  herName: "duaa",          // e.g. "Sara"
  myName:  "Omar",           // e.g. "Omar"

  /* ---------- 2. MUSIC ----------
     Drop your song into the assets folder and name it our-song.mp3
     (or change the path below). If the file isn't there yet, the site
     simply stays silent. */
  music: "assets/our-song.mp3",

  /* ---------- 3. PHOTOS (8) ----------
     Put your pictures in the /assets folder as photo1.jpg ... photo8.jpg.
     (.jpeg .png .webp also work if you keep the same names.)
     Until then, pretty placeholders are shown automatically.
     Where they appear:
       1-6  -> the memories scroll (tap to enlarge)
       7    -> taped inside the letter
       8    -> chapter two (+ 1,4 floating there too)
       all  -> float around during the "yes" celebration */
  photos: [
    "assets/photo1.jpg",
    "assets/photo2.jpg",
    "assets/photo3.jpg",
    "assets/photo4.jpg",
    "assets/photo5.jpg",
    "assets/photo6.jpg",
    "assets/photo7.jpg",
    "assets/photo8.jpg"
  ],

  /* ---------- 4. COLORS ---------- */
  colors: {
    accent:  "#ff6b9a",   // main pink
    accent2: "#ffb36b",   // warm orange-gold
    gold:    "#ffd9a0"
  },

  /* ---------- 5. IMPORTANT DATES (optional) ----------
     Format YYYY-MM-DD. Leave "" to hide. */
  dates: {
    together: ""          // e.g. "2023-02-14" -> shows "x days of us" under the memories
  },

  /* ---------- 6. THE CUTE CHARACTERS ---------- */
  characters: {
    him: { skin: "#f1c9a5", hair: "#2b1d2f", shirt: "#5b6fd6", pants: "#2f3358" },
    her: { skin: "#f6d3bd", hair: "#3a1f2b", shirt: "#f08fb0", pants: "#4a3a6a", girl: true }
  },

  /* ==========================================================================
     7. YOUR PERSONAL WORDS  (the most important part - make these yours!)
     Tip: put a blank line (\n\n) inside a message to make a new paragraph.
     ========================================================================== */
  personalMessages: {
    message1: "[duaa ya habibtyyyyy ana walahy bhbk w msh 3ayez ay haga mn eldonya 8erkkkk ana kol ely talbo forsa tanya bs a3wdk fyha 3n kol haga walahyyyyy 34an 5taryyy]",
    message2: "[ana bhbk wenty bthbiny ya duaa wana bhbk kman aktr bkteeeeer awyyyy 34an 5atry ediny forsa wahdaa wana msh h5liky tndmy walahyyy]",
    message3: "[shayfaa shklk helw wzayyy wenty nayma 3ala dra3yy ya habibty ana walahay m3ayez 8erk wala 3ayez akoon lhd 8erkkk ana 3ayzk enty w bs lhd mntgwzz w tb2y lyaa]",
    message4: "[ana bhbk w mhma y7sl msh h7b 8erkkkkkk enty hayaty w rohy w alby w kol ma leyaa]",
    onlyShe:  "[fkryyy mara a5iraaa ana bgd bhbk awy walahyyyy ediny forsa wahda bsss]"   // shows up as the P.S. at the bottom of the letter
  },

  /* ==========================================================================
     8. THE STORY TEXT  (already written - tweak any line you like)
     ========================================================================== */

  loader: { line1: "I made something for you…", line2: "Just give me a minute." },

  /* Intro: [text, how long it stays (ms), optional style] */
  intro: {
    lines: [
      ["Hey, you…", 2400],
      ["I don’t really know where to start.", 3000],
      ["So I’ll start with the truth.", 3000],
      ["I hurt you.", 3200, "strong"],
      ["And I know exactly why.", 3200],
      ["I betrayed your trust.", 3400, "strong"],
      ["*I cheated on you.*", 4800, "huge"],
      ["And I’m not going to make excuses for it.", 3800]
    ],
    final: "Let me tell you what I’ve been wanting to say…",
    button: "Keep going →"
  },

  memoriesIntro: [
    ["Before I ask you for anything…"],
    ["I want you to remember us."]
  ],

  /* The 6 scroll-memories. photo = which photo (1-8). caption = handwritten on the polaroid.
     message = what shows when she taps it. */
  memories: [
    { photo: 1, caption: "I still remember this moment.",
      message: "I still remember this moment. dah kan a7la youm fy hayaty awl youm shoftk feeeh " },
    { photo: 2, caption: "msh 3ayez m3ishh nfs el la7za dy",
      message: "I wish I could go back to this day. Not to change the past, just to hold on to it a little tighter. You deserved so much better than what I did to you." },
    { photo: 3, caption: "One of the many moments I’ll always remember.",
      message: "There are so many moments like this one. Small, random, nothing special to anyone else. But they were everything to me. I hate that I’m the one who put them at risk." },
    { photo: 4, caption: "This is what I don’t want to lose.",
      message: "This is what I don’t want to lose. And I know it’s my fault that I even have to say that." },
    { photo: 5, caption: "You looked so happy here.",
      message: "You looked so happy here. I want to be someone who protects that, not someone who takes it away. I’m sorry I took it away." },
    { photo: 6, caption: "Us, just being us.",
      message: "yarab dayman tfdly ganbyyy fy kol haga fy hayatyyy"}, 

  ],
memoriesEnd: "w lesaaa fy swaaar w memories nfsy a3ishha m3akyyy",

  apology: [
    ["But memories don’t erase what I did."],
    ["And I don’t want them to."],
    ["Because what I did was wrong."],
    ["*I cheated on you.*"],
    ["I broke the trust you gave me."],
    ["And I know that saying “I’m sorry”", "doesn’t magically fix that."],
    ["You trusted me.", "And I betrayed that trust."],
    ["No excuses.", "No “but”.", "Just the truth."]
  ],

  letter: {
    lead: "There are things I want to say in my own words.",
    hint: "tap the envelope",
    greeting: "Dear {her},",
    apology: [
      "I know I hurt you. I’m not going to dress it up, because you deserve better than that.",
      "Cheating wasn’t something that just happened. It wasn’t an accident and it wasn’t a slip. It was a choice. I made it, and I’m the only one responsible for it.",
      "You trusted me with something real, and I broke that. Not a little bit. Completely.",
      "I get why you’re angry. I get why you’re hurt. And honestly, I get why it’s hard to believe anything I say right now. If it was the other way around, I’d probably feel the same.",
      "I’m not expecting you to forget it. I’m not expecting you to trust me again overnight. And I definitely don’t expect forgiveness just because I’m asking for it. I haven’t earned that.",
      "What I can tell you is that I genuinely regret it. Not because of what it cost me, but because of what it did to you.",
      "And if you ever do give me another chance, I know words won’t be enough. I’d have to show you. With my actions, every single day."
    ],
    closing: "I love you. And I’m so, so sorry.",
    signoff: "— {me}",
    psLabel: "P.S."
  },

  love: {
    pre: "And after everything…",
    big: "I still love you.",
    hint: "tap a card",
    toast: "psst… you found a hidden message: I meant every word. 🤍",
    cards: [
      { emoji: "❤️", title: "Your smile.",
        text: "The way it shows up before you even realise it did. Still my favourite thing to look at." },
      { emoji: "🌙", title: "The little things you do.",
        text: "Stuff you probably don’t even notice you do. I notice all of it. I always have." },
      { emoji: "✨", title: "Our random conversations.",
        text: "Two hours about absolutely nothing, and somehow it’s still the best part of my day." },
      { emoji: "😂", title: "Our stupid jokes.",
        text: "Nobody else gets them. Nobody else would even find them funny. That’s what makes them ours." },
      { emoji: "📸", title: "Our memories.",
        text: "Every photo, every dumb little moment. I’d keep all of them." },
      { emoji: "🤍", title: "The person you are.",
        text: "Kind, real, and so much more than I treated you like. I love who you are, not just what we had." }
    ]
  },

  want: [
    ["I’m not asking you to forget."],
    ["I’m not asking you to pretend it didn’t happen."],
    ["I’m not asking you to trust me immediately."],
    ["I’m asking for one opportunity."],
    ["One chance to show you that I can be better than the person who hurt you."],
    ["Because I don’t want to just apologize for what I did."],
    ["I want to prove that I learned from it."],
    ["*I want to earn back the trust I lost.*"]
  ],

  question: {
    so: "So…",
    main: "Would you give me one more chance?",
    yes: "❤️ Yes, I’ll give us another chance",
    no: "💔 No…",
    notNow: "I need some time",
    noMessages: [
      "Are you sure? 🥺",
      "Really?",
      "I know I don’t deserve an easy yes… but please think about it.",
      "One more chance?",
      "I’ll spend the time proving it.",
      "I’ll be honest with you. Always.",
      "I’ll earn it, little by little.",
      "Just… think about it 🥹",
      "Okay, the No button gave up 🥹  (and you can always take your time, no pressure)"
    ]
  },

  celebration: {
    lines: [
      ["Wait…", 2200],
      ["Did you really say yes? 🥹", 3000],
      ["Thank you.", 2800],
      ["You have no idea how much that means to me.", 4200]
    ]
  },

  chapter2: {
    title: "Chapter Two: Us ❤️",
    sub: "a new start, not a rewind",
    story: [
      ["Thank you for giving me another chance."],
      ["I know this doesn’t erase what happened.", "And I know a second chance isn’t the same as everything going back to normal."],
      ["I don’t want to go back to normal."],
      ["I want us to become better."],
      ["I know I have something to prove.", "And I’m ready to prove it."]
    ],
    promisesTitle: "What I promise you",
    promisesSub: "Real ones. Not perfect ones.",
    promisesHint: "tap a card to flip it",
    promises: [
      { emoji: "🤍", title: "I’ll be honest.",
        text: "Even when the truth is uncomfortable. Especially then. You should never have to wonder if I’m telling you the real story." },
      { emoji: "🔒", title: "I’ll respect the trust you give me.",
        text: "Trust isn’t something I get to demand. When you give me any of it, I’ll treat it like it’s fragile, because it is." },
      { emoji: "❤️", title: "I’ll never take your love for granted.",
        text: "You choosing to stay isn’t something I’ll ever treat as normal. I’ll show up for that every single day." },
      { emoji: "🌙", title: "I’ll be transparent.",
        text: "If you have questions, you get real answers. If you need to see something to feel safe, I won’t get defensive. I’ll understand why." },
      { emoji: "🫶", title: "I’ll respect your feelings.",
        text: "Some days you might feel hurt or angry all over again. That’s allowed. I won’t rush your healing or get annoyed that it takes time." },
      { emoji: "✨", title: "I’ll let my actions speak louder than my words.",
        text: "I’ve already used a lot of words. From here on, judge me by what I do, not by what I say." }
    ],
    promisesNote: "I can’t promise I’ll be perfect. I can promise to be honest, and to own it when I’m not.",
    futureTitle: "There are still memories we haven’t made.",
    futureFrames: ["nrou7 cinema sawaa", "nrou7 mlahy sawaa wnsafer sawaa", "sora lesa mtswrnhash"],
    futureWords: ["More laughs.", "More pictures.", "More random days.", "More moments.", "More us."]
  },

  final: {
    lines: [
      ["Thank you for hearing me.", 3400],
      ["Thank you for giving me another chance.", 3600],
      ["I know I have a lot to prove.", 3400],
      ["And I’m ready.", 3200],
      ["Here’s to us. ❤️", 3400],
      ["Chapter Two starts now.", 0]
    ],
    replay: "Replay our story ↻",
    toast: "make a wish ✨"
  },

  noEnding: {
    lines: [
      ["I understand.", 2800],
      ["Thank you for hearing me out.", 3200],
      ["I know I don’t get to decide how long it takes you to heal from what I did.", 4800],
      ["Whatever you decide, I’ll always be grateful for the memories we shared.", 4800],
      ["Take care of yourself. 🤍", 0]
    ],
    back: "← back to the question",
    restart: "start over"
  }
};
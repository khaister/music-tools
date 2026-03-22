// Shared rendering & data helpers for music reference pages

// Read ?key= from URL, load corresponding /keys/{slug}/key.json
async function loadKey() {
  const params = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  // Try to determine the slug from URL param, or from the path if we're in /keys/
  let slug = params.get("key");
  if (!slug && pathParts.includes("keys")) {
    const keysIdx = pathParts.indexOf("keys");
    if (pathParts[keysIdx + 1]) {
      slug = pathParts[keysIdx + 1];
    }
  }
  if (!slug) slug = "e-major";

  // Avoid re-loading if already present
  if (window.KEY && window.KEY.slug === slug) {
    return window.KEY;
  }

  // Determine the base path to the project root
  let base = ".";
  const pathname = window.location.pathname;
  const parts = pathname.split("/").filter(Boolean);
  const keysIndex = parts.indexOf("keys");
  const templatesIndex = parts.indexOf("templates");

  if (keysIndex !== -1) {
    // Find distance from current location to root (where 'keys' is)
    const depthFromKeys = parts.length - 1 - keysIndex;
    base = new Array(depthFromKeys + 1).fill("..").join("/");
  } else if (templatesIndex !== -1) {
    // templates/ is at root
    const depthFromTemplates = parts.length - 1 - templatesIndex;
    base = new Array(depthFromTemplates + 1).fill("..").join("/");
  }

  // Determine the final JSON URL
  let jsonUrl;
  if (pathname.includes(`/keys/${slug}/`)) {
    // Best case: already in the correct folder
    jsonUrl = "key.json";
  } else {
    jsonUrl = `${base}/keys/${slug}/key.json`.replace(/\/+/g, "/");
  }

  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch key data: ${response.statusText}`);
    }
    const data = await response.json();
    window.KEY = data;
    return data;
  } catch (error) {
    throw new Error(`Failed to load key data for ${slug}: ${error.message}`);
  }
}
// UI helpers – DOM utilities
function $(selector) {
  return document.querySelector(selector);
}

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  return el;
}


// Render scale chips
function renderScaleStrip(container, scale) {
  if (!container || !scale) return;
  container.innerHTML = "";

  const strip = createEl("div", "scale-strip");
  scale.forEach((step) => {
    const cls = step.accidental ? "note-chip sharp" : "note-chip natural";
    const chip = createEl("div", cls, step.note);
    strip.appendChild(chip);
  });

  container.appendChild(strip);
}

// Render basic note reference table
function renderNoteTable(container, keyData) {
  if (!container || !keyData || !Array.isArray(keyData.scale)) return;
  container.innerHTML = "";

  const tableWrap = createEl("div", "table-wrap");
  const table = createEl("table", "note-table");

  const thead = createEl("thead");
  const headRow = document.createElement("tr");
  ["#", "Note", "Scale Degree", "RH Finger", "LH Finger", "Type"].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);

  const tbody = createEl("tbody");
  keyData.scale.forEach((step, idx) => {
    const tr = document.createElement("tr");

    const numTd = createEl("td", null, String(idx + 1));
    const noteTd = createEl("td");
    const noteSpan = createEl("span", "note-name", step.note);
    noteTd.appendChild(noteSpan);

    const degreeTd = createEl(
      "td",
      null,
      `${step.degree === 1 ? "Tonic" : `Degree ${step.degree}`}`
    );

    const rhFinger = keyData.fingering?.rightHand[idx] || "";
    const lhFinger = keyData.fingering?.leftHand[idx] || "";

    const rhTd = createEl("td");
    const rhPill = createEl("span", "finger-pill rh", String(rhFinger));
    rhTd.appendChild(rhPill);

    const lhTd = createEl("td");
    const lhPill = createEl("span", "finger-pill lh", String(lhFinger));
    lhTd.appendChild(lhPill);

    const typeTd = createEl("td");
    const typeSpan = createEl("span", null, step.accidental ? "♯ Sharp" : "Natural");
    if (step.accidental) typeSpan.style.color = "var(--primary)";
    else typeSpan.style.color = "var(--text-dim)";
    typeSpan.style.fontSize = "11px";
    typeTd.appendChild(typeSpan);

    tr.appendChild(numTd);
    tr.appendChild(noteTd);
    tr.appendChild(degreeTd);
    tr.appendChild(rhTd);
    tr.appendChild(lhTd);
    tr.appendChild(typeTd);
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  tableWrap.appendChild(table);
  container.appendChild(tableWrap);
}

// Render intervals table
function renderIntervalsTable(container, intervals) {
  if (!container || !intervals) return;
  container.innerHTML = "";
  const tableWrap = createEl("div", "table-wrap");
  const table = createEl("table", "note-table");
  const thead = createEl("thead");
  const headRow = document.createElement("tr");
  ["Degree", "Note", "Interval", "Quality", "Semitones", "Character"].forEach(l => {
    const th = document.createElement("th"); th.textContent = l; headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  const tbody = createEl("tbody");
  intervals.forEach(iv => {
    const tr = document.createElement("tr");
    [iv.degree, iv.note, iv.name, iv.quality, iv.semitones, iv.character].forEach(v => {
      const td = document.createElement("td"); td.textContent = v; tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(thead); table.appendChild(tbody);
  tableWrap.appendChild(table); container.appendChild(tableWrap);
}

// Render chords tables
function renderChordsTables(container, keyData) {
  if (!container || !keyData) return;
  container.innerHTML = "";

  const sections = [
    { title: "Diatonic Triads", data: keyData.triads },
    { title: "Seventh Chords", data: keyData.seventhChords, margin: true }
  ];

  sections.forEach(sec => {
    if (!sec.data) return;
    const h2 = createEl("h2", null, sec.title);
    const header = createEl("div", "section-header");
    if (sec.margin) header.style.marginTop = "28px";
    header.appendChild(h2);
    header.appendChild(createEl("div", "line"));
    container.appendChild(header);

    const tableWrap = createEl("div", "table-wrap");
    const table = createEl("table", "note-table");
    const thead = createEl("thead");
    const headRow = document.createElement("tr");
    ["Roman", "Chord", "Quality", "Notes"].forEach(l => {
      const th = document.createElement("th"); th.textContent = l; headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    const tbody = createEl("tbody");
    sec.data.forEach(ch => {
      const tr = document.createElement("tr");
      [ch.numeral, ch.chord, ch.quality, (ch.notes||[]).join(" · ")].forEach(v => {
        const td = document.createElement("td"); td.textContent = v; tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(thead); table.appendChild(tbody);
    tableWrap.appendChild(table); container.appendChild(tableWrap);
  });
}

// Render progressions cards
function renderProgressions(container, progressions) {
  if (!container || !progressions) return;
  container.innerHTML = "";
  const grid = createEl("div", "tips tips-2-col");
  progressions.forEach(p => {
    const card = createEl("div", "tip-card");
    card.appendChild(createEl("h4", null, p.name));
    card.appendChild(createEl("p", null, p.feel));
    const numerals = createEl("p", null, (p.numerals||[]).join(" · "));
    numerals.style.fontSize = "11px"; numerals.style.letterSpacing = "0.18em"; numerals.style.textTransform = "uppercase";
    card.appendChild(numerals);
    const chords = createEl("p", null, (p.chords||[]).join(" – "));
    chords.style.fontSize = "12px"; chords.style.marginTop = "4px";
    card.appendChild(chords);
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

// Render relative minor
function renderRelativeMinor(container, rel) {
  if (!container || !rel) return;
  container.innerHTML = "";
  const grid = createEl("div", "tips");
  const scaleCard = createEl("div", "tip-card");
  scaleCard.appendChild(createEl("h4", null, "Scale"));
  scaleCard.appendChild(createEl("p", null, (rel.scale||[]).join(" · ")));
  grid.appendChild(scaleCard);

  const prog = rel.commonProgressions?.[0];
  if (prog) {
    const progCard = createEl("div", "tip-card");
    progCard.appendChild(createEl("h4", null, "Common Progression"));
    const num = createEl("p", null, (prog.numerals||[]).join(" · "));
    num.style.fontSize = "11px"; num.style.letterSpacing = "0.18em"; num.style.textTransform = "uppercase";
    progCard.appendChild(num);
    const ch = createEl("p", null, (prog.chords||[]).join(" – "));
    ch.style.fontSize = "12px"; ch.style.marginTop = "4px";
    progCard.appendChild(ch);
    grid.appendChild(progCard);
  }
  container.appendChild(grid);
}

// Render parallel minor
function renderParallelMinor(container, majorScale, par) {
  if (!container || !par) return;
  container.innerHTML = "";
  const grid = createEl("div", "tips");
  const majCard = createEl("div", "tip-card");
  majCard.appendChild(createEl("h4", null, "Major Scale"));
  majCard.appendChild(createEl("p", null, majorScale.map(s=>s.note).join(" · ")));
  grid.appendChild(majCard);

  const minCard = createEl("div", "tip-card");
  minCard.appendChild(createEl("h4", null, "Parallel Minor Scale"));
  minCard.appendChild(createEl("p", null, (par.scale||[]).join(" · ")));
  grid.appendChild(minCard);

  const diffCard = createEl("div", "tip-card");
  diffCard.appendChild(createEl("h4", null, "Degrees that Change"));
  (par.differing||[]).forEach(d => {
    diffCard.appendChild(createEl("p", null, `${d.degree}: ${d.major} → ${d.minor}`));
  });
  grid.appendChild(diffCard);
  container.appendChild(grid);
}

// Render modes table
function renderModesTable(container, modes) {
  if (!container || !modes) return;
  container.innerHTML = "";
  const tableWrap = createEl("div", "table-wrap");
  const table = createEl("table", "note-table");
  const thead = createEl("thead");
  const headRow = document.createElement("tr");
  ["Degree", "Mode", "Root", "Character", "Distinct Note"].forEach(l => {
    const th = document.createElement("th"); th.textContent = l; headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  const tbody = createEl("tbody");
  modes.forEach(m => {
    const tr = document.createElement("tr");
    [m.degree, m.name, m.root, m.character, m.distinctNote || "—"].forEach(v => {
      const td = document.createElement("td"); td.textContent = v; tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(thead); table.appendChild(tbody);
  tableWrap.appendChild(table); container.appendChild(tableWrap);
}

// Render ear training
function renderEarTraining(container, ear) {
  if (!container || !ear) return;
  container.innerHTML = "";
  const card = createEl("div", "tip-card");
  card.style.maxWidth = "720px";
  const ul = createEl("ul");
  ul.style.paddingLeft = "18px"; ul.style.fontSize = "12px"; ul.style.lineHeight = "1.7";
  (ear.scaleDegrees||[]).forEach(deg => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${deg.degree} (${deg.note})</strong> — ${deg.feel}`;
    ul.appendChild(li);
  });
  card.appendChild(ul);
  container.appendChild(card);
}

// --- Audio & Notation ---

let VF = null;
let synth = null;
let isToneLoading = false;

async function initAudio() {
  if (synth) return synth;

  if (typeof Tone === "undefined") {
    if (isToneLoading) {
      while (typeof Tone === "undefined") {
        await new Promise(r => setTimeout(r, 50));
      }
    } else {
      isToneLoading = true;
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      isToneLoading = false;
    }
  }

  await Tone.start();
  synth = new Tone.Synth().toDestination();
  return synth;
}

function initVexFlow() {
  if (VF) return VF;
  if (typeof Vex !== "undefined") {
    VF = Vex.Flow || Vex;
  } else if (typeof VexFlow !== "undefined") {
    VF = VexFlow;
  }
  return VF;
}

const scaleElements = { treble: [], bass: [] };

async function playNote(note, element) {
  const s = await initAudio();
  if (!s) return;

  s.triggerAttackRelease(note, "8n");
  if (element) {
    const heads = element.querySelectorAll(".vf-notehead");
    heads.forEach((h) => {
      h.classList.add("playing");
      setTimeout(() => h.classList.remove("playing"), 300);
    });
  }
}

function renderScale(containerId, clef, notesData, keySignature = "C") {
  const VF = initVexFlow();
  if (!VF) return;

  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = ""; // Clear existing

  // Calculate width: use the container's width so it fits nicely on desktop
  // but enforce a minimum width per note (e.g., 60px) to prevent squishing on mobile
  const containerWidth = container.clientWidth || 1000;
  const minWidth = notesData.length * 60;
  const width = Math.max(containerWidth, minWidth);
  const height = 240;

  const factory = new VF.Factory({
    renderer: { elementId: containerId, width: width, height: height }
  });

  const context = factory.getContext();

  // Create a stave that spans the calculated width, with a small margin
  const stave = factory.Stave({ x: 10, y: 70, width: width - 20 })
    .addClef(clef)
    .addKeySignature(keySignature);

  stave.setContext(context).draw();

  const staveNotes = notesData.map((data) => {
    const note = factory.StaveNote({
      keys: [data.key],
      duration: "q",
      clef: clef,
    });

    if (data.key.includes("#")) {
      note.addModifier(factory.Accidental({ type: "#" }), 0);
    } else if (data.key.includes("b")) {
      note.addModifier(factory.Accidental({ type: "b" }), 0);
    }

    const fingerPos = clef === "treble" ? VF.Modifier.Position.ABOVE : VF.Modifier.Position.BELOW;
    note.addModifier(factory.Fingering({ number: data.fingering, position: fingerPos }), 0);

    return note;
  });

  // Create a voice and add the musical notes
  const voice = new VF.Voice({
    num_beats: notesData.length,
    beat_value: 4
  }).addTickables(staveNotes);

  // Create a separate voice for perfectly horizontal TextNotes (labels)
  const textNotes = notesData.map((data) => {
    const textNote = new VF.TextNote({
      text: data.label,
      duration: "q",
    })
    .setLine(12) // Line 12 is generally below the staff
    .setJustification(VF.TextNote.Justification.CENTER);
    
    textNote.setFont("JetBrains Mono", 8, "normal");
    textNote.setContext(context);
    return textNote;
  });

  const textVoice = new VF.Voice({
    num_beats: notesData.length,
    beat_value: 4
  }).addTickables(textNotes);

  // Use Formatter to explicitly justify both voices across the wide stave
  new VF.Formatter().joinVoices([voice, textVoice]).format([voice, textVoice], width - 100);

  voice.draw(context, stave);
  textVoice.draw(context, stave);

  scaleElements[clef] = staveNotes;

  staveNotes.forEach((staveNote, idx) => {
    const element = staveNote.getSVGElement();
    if (element) {
      element.style.cursor = "pointer";
      element.addEventListener("click", async () => {
        const toneNote = notesData[idx].key.replace("/", "").toUpperCase();
        playNote(toneNote, element);
      });
    }
  });
}

window.playAllScale = async (type, notesData) => {
  const s = await initAudio();
  if (!s) return;

  const staveNotes = scaleElements[type];
  const now = Tone.now();

  notesData.forEach((data, index) => {
    const toneNote = data.key.replace("/", "").toUpperCase();
    const time = now + index * 0.4;
    s.triggerAttackRelease(toneNote, "8n", time);

    setTimeout(() => {
      const element = staveNotes[index]?.getSVGElement();
      if (element) {
        const heads = element.querySelectorAll(".vf-notehead");
        heads.forEach((h) => {
          h.classList.add("playing");
          setTimeout(() => h.classList.remove("playing"), 300);
        });
      }
    }, index * 400);
  });
};

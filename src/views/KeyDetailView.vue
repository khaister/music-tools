<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import StaffStave from '../components/StaffStave.vue'
import InfoTable from '../components/InfoTable.vue'
import ProgressionCard from '../components/ProgressionCard.vue'

const props = defineProps({
  name: String
})

const keyData = ref(null)
const trebleStave = ref(null)
const bassStave = ref(null)
let synth = null

onUnmounted(() => {
  if (synth) {
    synth.dispose()
    synth = null
  }
})

const fetchKeyData = async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}keys/${props.name}.json`)
    keyData.value = await response.json()
    document.title = `${keyData.value.name} — KeyAtlas`
  } catch (e) {
    console.error("Failed to load key data", e)
  }
}

onMounted(fetchKeyData)
watch(() => props.name, fetchKeyData)

const vfKey = computed(() => {
  if (!keyData.value) return "C"
  let k = keyData.value.root.replace("♯", "#").replace("♭", "b")
  return keyData.value.type === "minor" ? `${k}m` : k
})

const rhRange = computed(() => `${keyData.value?.staffOctaves?.treble?.start || ""} – ${keyData.value?.staffOctaves?.treble?.end || ""}`)
const lhRange = computed(() => `${keyData.value?.staffOctaves?.bass?.start || ""} – ${keyData.value?.staffOctaves?.bass?.end || ""}`)

const initSynth = (Tone) => {
  if (synth) return synth
  synth = new Tone.Synth().toDestination()
  return synth
}

const playNote = async ({ note, element }) => {
  const Tone = await import('tone')
  await Tone.start()
  const s = initSynth(Tone)
  s.triggerAttackRelease(note, "8n")
  if (element) {
    const heads = element.querySelectorAll(".vf-notehead")
    heads.forEach(h => {
      h.classList.add("playing")
      setTimeout(() => h.classList.remove("playing"), 300)
    })
  }
}

const playAll = async (type) => {
  const Tone = await import('tone')
  await Tone.start()
  const s = initSynth(Tone)
  const notesData = type === 'treble' ? keyData.value.vexflow.trebleNotesData : keyData.value.vexflow.bassNotesData
  const stave = type === 'treble' ? trebleStave.value : bassStave.value
  const staveNotes = stave.getElements()
  
  const now = Tone.now()
  notesData.forEach((data, index) => {
    const toneNote = data.key.replace("/", "").toUpperCase()
    const time = now + index * 0.4
    s.triggerAttackRelease(toneNote, "8n", time)

    setTimeout(() => {
      const element = staveNotes[index]?.getSVGElement()
      if (element) {
        const heads = element.querySelectorAll(".vf-notehead")
        heads.forEach(h => {
          h.classList.add("playing")
          setTimeout(() => h.classList.remove("playing"), 300)
        })
      }
    }, index * 400)
  })
}
</script>

<template>
  <div v-if="keyData" class="reference-page">
    <nav class="top-nav">
      <div class="top-nav-inner">
        <router-link to="/" class="back-link">
          <span>←</span>
          <span>All Keys</span>
        </router-link>
      </div>
      <nav class="topic-nav">
        <a class="topic-pill" href="#scale">🎼 Scale</a>
        <a class="topic-pill" href="#note-reference">📋 Note Reference</a>
        <a class="topic-pill" href="#intervals">⇅ Intervals</a>
        <a class="topic-pill" href="#chords">♬ Chords</a>
        <a class="topic-pill" href="#progressions">➰ Progressions</a>
        <a class="topic-pill" href="#relative-minor">♭ Relative Minor</a>
        <a class="topic-pill" href="#parallel-minor">⚖ Parallel Minor</a>
        <a class="topic-pill" href="#modes">🌈 Modes</a>
        <a class="topic-pill" href="#ear-training">👂 Ear Training</a>
      </nav>
    </nav>

    <header id="scale">
      <div class="eyebrow">KeyAtlas Reference</div>
      <h1>{{ keyData.root }} <span>{{ keyData.type === 'major' ? 'Major' : 'Minor' }}</span></h1>
    </header>

    <div class="scale-strip-wrap">
       <div class="scale-strip">
          <div v-for="step in keyData.scale" :key="step.note" :class="['note-chip', step.accidental ? 'sharp' : 'natural']">
            {{ step.note }}
          </div>
       </div>
    </div>

    <StaffStave 
      ref="trebleStave"
      id="treble-vexflow" 
      clef="treble" 
      :notesData="keyData.vexflow.trebleNotesData" 
      :keySignature="vfKey"
      title="Right Hand"
      :range="rhRange"
      badgeClass="right"
      @play-note="playNote"
      @play-all="playAll"
    />

    <StaffStave 
      ref="bassStave"
      id="bass-vexflow" 
      clef="bass" 
      :notesData="keyData.vexflow.bassNotesData" 
      :keySignature="vfKey"
      title="Left Hand"
      :range="lhRange"
      badgeClass="left"
      @play-note="playNote"
      @play-all="playAll"
    />

    <!-- Note Reference -->
    <div class="section-header" id="note-reference">
      <h2>Note Reference</h2>
      <div class="line"></div>
    </div>
    <InfoTable :headers="['#', 'Note', 'Scale Degree', 'RH Finger', 'LH Finger', 'Type']">
      <tr v-for="(step, idx) in keyData.scale" :key="idx">
        <td>{{ idx + 1 }}</td>
        <td><span class="note-name">{{ step.note }}</span></td>
        <td>{{ step.degree === 1 ? 'Tonic' : `Degree ${step.degree}` }}</td>
        <td><span class="finger-pill rh">{{ keyData.fingering.rightHand[idx] }}</span></td>
        <td><span class="finger-pill lh">{{ keyData.fingering.leftHand[idx] }}</span></td>
        <td>
          <span :style="{ color: step.accidental ? 'var(--primary)' : 'var(--text-dim)', fontSize: '11px' }">
            {{ step.accidental ? '♯ Sharp' : 'Natural' }}
          </span>
        </td>
      </tr>
    </InfoTable>

    <!-- Intervals -->
    <div class="section-header" id="intervals">
      <h2>Intervals from {{ keyData.root }}</h2>
      <div class="line"></div>
    </div>
    <InfoTable 
      :headers="['Degree', 'Note', 'Interval', 'Quality', 'Semitones', 'Character']" 
      :rows="keyData.intervals.map(iv => [iv.degree, iv.note, iv.name, iv.quality, iv.semitones, iv.character])"
    />

    <!-- Chords -->
    <div class="section-header" id="chords">
      <h2>Chords</h2>
      <div class="line"></div>
    </div>
    <h3 class="sub-section-title">Diatonic Triads</h3>
    <InfoTable 
      :headers="['Roman', 'Chord', 'Quality', 'Notes']" 
      :rows="keyData.triads.map(ch => [ch.numeral, ch.chord, ch.quality, ch.notes.join(' · ')])"
    />
    <h3 class="sub-section-title" style="margin-top: 32px;">Seventh Chords</h3>
    <InfoTable 
      :headers="['Roman', 'Chord', 'Quality', 'Notes']" 
      :rows="keyData.seventhChords.map(ch => [ch.numeral, ch.chord, ch.quality, ch.notes.join(' · ')])"
    />

    <!-- Progressions -->
    <div class="section-header" id="progressions">
      <h2>Common Progressions</h2>
      <div class="line"></div>
    </div>
    <div class="tips tips-3-col">
      <ProgressionCard 
        v-for="p in keyData.progressions" 
        :key="p.name"
        :title="p.name"
        :feel="p.feel"
        :numerals="p.numerals"
        :chords="p.chords"
      />
    </div>

    <!-- Relative Minor -->
    <div v-if="keyData.relativeMinor" class="section-header" id="relative-minor">
      <h2>Relative Minor — {{ keyData.relativeMinor.name }}</h2>
      <div class="line"></div>
    </div>
    <div v-if="keyData.relativeMinor" class="tips">
      <div class="tip-card">
        <h4>Scale</h4>
        <p>{{ keyData.relativeMinor.scale.join(' · ') }}</p>
      </div>
      <div v-if="keyData.relativeMinor.commonProgressions?.[0]" class="tip-card">
        <h4>Common Progression</h4>
        <p style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;">
          {{ keyData.relativeMinor.commonProgressions[0].numerals.join(' · ') }}
        </p>
        <p style="font-size: 12px; margin-top: 4px;">
          {{ keyData.relativeMinor.commonProgressions[0].chords.join(' – ') }}
        </p>
      </div>
    </div>

    <!-- Parallel Minor -->
    <div v-if="keyData.parallelMinor" class="section-header" id="parallel-minor">
      <h2>Parallel Minor — {{ keyData.parallelMinor.name }}</h2>
      <div class="line"></div>
    </div>
    <div v-if="keyData.parallelMinor" class="tips">
      <div class="tip-card">
        <h4>Major Scale</h4>
        <p>{{ keyData.scale.map(s => s.note).join(' · ') }}</p>
      </div>
      <div class="tip-card">
        <h4>Parallel Minor Scale</h4>
        <p>{{ keyData.parallelMinor.scale.join(' · ') }}</p>
      </div>
      <div class="tip-card">
        <h4>Degrees that Change</h4>
        <p v-for="d in keyData.parallelMinor.differing" :key="d.degree">
          {{ d.degree }}: {{ d.major }} → {{ d.minor }}
        </p>
      </div>
    </div>

    <!-- Modes -->
    <div class="section-header" id="modes">
      <h2>Modes of {{ keyData.name }}</h2>
      <div class="line"></div>
    </div>
    <InfoTable 
      :headers="['Degree', 'Mode', 'Root', 'Character', 'Distinct Note']" 
      :rows="keyData.modes.map(m => [m.degree, m.name, m.root, m.character, m.distinctNote || '—'])"
    />

    <!-- Ear Training -->
    <div class="section-header" id="ear-training">
      <h2>Ear Training — Scale Degrees</h2>
      <div class="line"></div>
    </div>
    <div class="tip-card" style="width: 100%;">
      <ul class="ear-training-list">
        <li v-for="deg in keyData.earTraining.scaleDegrees" :key="deg.degree">
          <strong>{{ deg.degree }} ({{ deg.note }})</strong> — {{ deg.feel }}
        </li>
      </ul>
    </div>
  </div>
  <div v-else class="loading-state">
    Loading key data...
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  font-size: 24px;
  color: var(--text-dim);
}
.sub-section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  color: var(--cream);
  margin-bottom: 16px;
}
.ear-training-list {
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.7;
}
.back-link {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-dim);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>

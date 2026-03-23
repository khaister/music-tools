<script setup>
import { ref, onMounted, watch } from 'vue';
import { Factory } from 'vexflow';

const props = defineProps({
  id: String,
  clef: String,
  notesData: Array,
  keySignature: String,
  title: String,
  range: String,
  badgeClass: String
});

const emit = defineEmits(['play-note', 'play-all']);

const container = ref(null);
const staveElements = ref([]);

const render = () => {
  if (!container.value || !props.notesData.length) return;

  container.value.innerHTML = '';
  const width = Math.max(
    container.value.clientWidth || 1000,
    props.notesData.length * 60
  );
  const height = 240;

  const factory = new Factory({
    renderer: { elementId: container.value, width: width, height: height }
  });

  const context = factory.getContext();
  const stave = factory
    .Stave({ x: 10, y: 70, width: width - 20 })
    .addClef(props.clef)
    .addKeySignature(props.keySignature);

  stave.setContext(context).draw();

  const staveNotes = props.notesData.map((data) => {
    const note = factory.StaveNote({
      keys: [data.key],
      duration: 'q',
      clef: props.clef
    });

    if (data.key.includes('#')) {
      note.addModifier(factory.Accidental({ type: '#' }), 0);
    } else if (data.key.includes('b')) {
      note.addModifier(factory.Accidental({ type: 'b' }), 0);
    }

    const fingerPos = props.clef === 'treble' ? 1 : -1; // ABOVE=1, BELOW=-1 in some VF versions, or use constants
    note.addModifier(
      factory.Fingering({
        number: data.fingering,
        position: props.clef === 'treble' ? 3 : 4
      }),
      0
    ); // Position values vary by version

    return note;
  });

  const voice = factory
    .Voice({ time: { num_beats: props.notesData.length, beat_value: 4 } })
    .addTickables(staveNotes);

  const textNotes = props.notesData.map((data) => {
    return factory
      .TextNote({ text: data.label, duration: 'q' })
      .setLine(12)
      .setJustification(2); // CENTER
  });

  const textVoice = factory
    .Voice({ time: { num_beats: props.notesData.length, beat_value: 4 } })
    .addTickables(textNotes);

  factory
    .Formatter()
    .joinVoices([voice, textVoice])
    .format([voice, textVoice], width - 100);

  voice.draw(context, stave);
  textVoice.draw(context, stave);

  staveElements.value = staveNotes;

  staveNotes.forEach((staveNote, idx) => {
    const element = staveNote.getSVGElement();
    if (element) {
      element.style.cursor = 'pointer';
      element.addEventListener('click', () => {
        emit('play-note', {
          note: props.notesData[idx].key.replace('/', '').toUpperCase(),
          element
        });
      });
    }
  });
};

onMounted(render);
watch(() => props.notesData, render);

defineExpose({
  getElements: () => staveElements.value
});
</script>

<template>
  <div class="section-header">
    <h2>{{ title }}</h2>
    <div class="line"></div>
    <div :class="['hand-badge', badgeClass]">
      {{ clef === 'treble' ? 'Treble Clef' : 'Bass Clef' }}
    </div>
  </div>

  <div class="staff-wrap">
    <div class="staff-card">
      <div class="staff-card-header">
        <h3>
          {{ clef === 'treble' ? 'Treble Clef' : 'Bass Clef' }} · {{ title }} ·
          {{ range }}
        </h3>
        <button class="play-all-btn" @click="$emit('play-all', clef)">
          Play Scale
        </button>
      </div>
      <div :id="id" ref="container" class="vexflow-container"></div>
    </div>
  </div>
</template>

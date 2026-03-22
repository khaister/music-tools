<script setup>
defineProps({
  headers: Array,
  rows: Array
})
</script>

<template>
  <div class="table-wrap">
    <table class="note-table">
      <thead>
        <tr>
          <th v-for="h in headers" :key="h">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <slot>
          <tr v-for="(row, idx) in rows" :key="idx">
            <td v-for="(cell, cIdx) in row" :key="cIdx">{{ cell }}</td>
          </tr>
        </slot>
      </tbody>
    </table>
  </div>
</template>

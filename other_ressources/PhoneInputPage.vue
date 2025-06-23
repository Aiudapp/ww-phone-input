<template>
  <div class="phone-input-page">
    <h1>Phone Number Input</h1>
    <div class="phone-input-container">
      <MazPhoneNumberInput
        v-model="phoneNumber"
        v-model:country-code="countryCode"
        show-code-on-list
        :preferred-countries="['US', 'GB', 'CA', 'FR', 'DE']"
        @update="handleUpdate"
        class="work-sans-phone-input"
      />
      <div v-if="results" class="results">
        <h3>Phone Number Details:</h3>
        <pre>{{ JSON.stringify(results, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput'
import type { Results } from 'maz-ui/components/MazPhoneNumberInput'

const phoneNumber = ref('')
const countryCode = ref('US')
const results = ref<Results | null>(null)

const handleUpdate = (data: Results) => {
  results.value = data
}
</script>

<style scoped>
.phone-input-page {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: var(--font-work-sans);
}

.phone-input-container {
  margin-top: 2rem;
}

.results {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  color: #1a1a1a;
}

.results h3 {
  color: #1a1a1a;
  margin-bottom: 1rem;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #1a1a1a;
}

:deep(.work-sans-phone-input) {
  --maz-font-family: var(--font-work-sans) !important;
}

:deep(.work-sans-phone-input input),
:deep(.work-sans-phone-input button),
:deep(.work-sans-phone-input .maz-select__options) {
  font-family: var(--font-work-sans) !important;
}
</style>

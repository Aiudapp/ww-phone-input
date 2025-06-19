<template>
  <div
    class="phone-input-container"
    :class="{
      dark: content?.darkMode,
      'is-valid': localPhoneData.isValid,
      'is-invalid': !localPhoneData.isValid && localPhoneData.phoneNumber,
      'is-loading': isLoading,
    }"
  >
    <MazPhoneNumberInput
      v-model="localPhoneData.phoneNumber"
      v-model:country-code="localPhoneData.countryCode"
      :show-code-on-list="content?.showCodeOnList ?? true"
      :preferred-countries="content?.preferredCountries ?? ['US', 'GB', 'CA', 'FR', 'DE']"
      :country-locale="content?.language === 'fr' ? 'fr-FR' : 'en-US'"
      :auto-format="content?.autoFormat ?? true"
      :orientation="content?.orientation ?? 'responsive'"
      :style="{
        '--maz-color-bg': content?.backgroundColor || '#ffffff',
        '--maz-color-bg-dark': content?.backgroundColor || '#ffffff',
        '--maz-color-bg-light': content?.backgroundColor || '#ffffff',
        '--maz-color-bg-lighter': content?.backgroundColor || '#ffffff',
        '--maz-color-text': content?.textColor || '#333333',
        '--maz-color-placeholder': content?.placeholderColor || '#999999',
        '--maz-border-radius': '8px',
        '--maz-select-color': content?.textColor || '#333333',
        '--maz-dropdown-color': content?.textColor || '#333333',
        '--maz-dropdown-item-color': content?.textColor || '#333333',
        '--maz-dropdown-item-color-hover': content?.textColor || '#333333',
      }"
      :disabled="isLoading"
      :error="showError"
      :success="showSuccess"
      :translations="currentTranslations"
      @update="handleUpdate"
      @data="handleData"
      @country-code="handleCountryCode"
      class="work-sans-phone-input"
    />
    <div v-if="showError" class="error-message">
      {{ currentErrorMessage }}
    </div>
  </div>
</template>

<script>
import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput.mjs'
import 'maz-ui/styles'

const translations = {
  en: {
    countrySelector: {
      placeholder: 'Country code',
      error: 'Choose country',
      searchPlaceholder: 'Search a country',
    },
    phoneInput: {
      placeholder: 'Phone number',
      example: 'Example:',
    },
  },
  fr: {
    countrySelector: {
      placeholder: 'Code pays',
      error: 'Choisissez un pays',
      searchPlaceholder: 'Rechercher un pays',
    },
    phoneInput: {
      placeholder: 'Numéro de téléphone',
      example: 'Exemple:',
    },
  },
}

export default {
  name: 'PhoneInput',
  components: {
    MazPhoneNumberInput,
  },
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
  },
  emits: ['update:content', 'trigger-event'],
  data() {
    return {
      localPhoneData: {
        phoneNumber: '',
        countryCode: 'US',
        isValid: false,
        isPossible: false,
        countryCallingCode: '',
        nationalNumber: '',
        formatInternational: '',
        formatNational: '',
        type: '',
        e164: '',
        regionCode: '',
        number: {
          input: '',
          international: '',
          national: '',
          e164: '',
          rfc3966: '',
          significant: '',
        },
      },
      isLoading: false,
      showError: false,
      showSuccess: false,
    }
  },
  computed: {
    wwObject: {
      get() {
        return this.content
      },
      set(content) {
        this.$emit('update:content', content)
      },
    },
    currentTranslations() {
      const lang = this.content?.language || 'en'
      return translations[lang]
    },
    currentErrorMessage() {
      return this.content?.language === 'fr'
        ? 'Numéro de téléphone invalide'
        : 'Invalid phone number format'
    },
  },
  watch: {
    'content.language': {
      handler(newLang) {
        console.log('Language changed to:', newLang)
      },
      immediate: true,
    },
  },
  methods: {
    async handleUpdate(data) {
      this.localPhoneData = { ...this.localPhoneData, ...data }
      try {
        await wwLib?.wwVariable?.updateValue?.(`${this.uid}-phoneData`, this.localPhoneData)
      } catch (err) {
        console.error('Failed to update variable:', err)
      }
    },
    handleData(results) {
      console.log('📊 Handle Data Called:', results)
      this.handleUpdate(results)
    },
    handleCountryCode(countryCode) {
      this.localPhoneData.countryCode = countryCode
    },
  },
  async mounted() {
    try {
      if (window.wwLib?.wwVariable?.register) {
        await window.wwLib.wwVariable.register({
          name: `${this.uid}-phoneData`,
          value: this.localPhoneData,
          type: 'object',
          defaultValue: this.localPhoneData,
        })
      }
    } catch (err) {
      console.error('Failed to register variable:', err)
    }
  },
  beforeUnmount() {
    try {
      if (window.wwLib?.wwVariable?.unregister) {
        window.wwLib.wwVariable.unregister(`${this.uid}-phoneData`)
      }
    } catch (err) {
      console.error('Failed to unregister variable:', err)
    }
  },
}
</script>

<style lang="css" scoped>
.phone-input-container {
  position: relative;
  width: 100%;
  transition: all 0.3s ease;
}

/* Override Maz UI default styles */
.phone-input-container :deep(.maz-input) {
  --maz-bg-color: var(--input-bg-color) !important;
  --maz-color-bg: var(--maz-color-bg) !important;
  --maz-color-bg-dark: var(--maz-color-bg) !important;
  --maz-color-bg-light: var(--maz-color-bg) !important;
  --maz-color-bg-lighter: var(--maz-color-bg) !important;
}

.phone-input-container :deep(.maz-input input),
.phone-input-container :deep(.maz-input button) {
  background-color: var(--maz-color-bg) !important;
}

.phone-input-container :deep(.maz-select__options) {
  background-color: var(--maz-color-bg) !important;
}

/* Dark mode specific styles */
.phone-input-container.dark {
  color: var(--maz-color-text);
}

.phone-input-container.dark :deep(.maz-input),
.phone-input-container.dark :deep(.maz-input input),
.phone-input-container.dark :deep(.maz-input button),
.phone-input-container.dark :deep(.maz-select__options) {
  --maz-color: var(--maz-color-text);
  --maz-border-color: rgba(255, 255, 255, 0.2);
  background-color: var(--maz-color-bg) !important;
}

.phone-input-container :deep(.maz-input) {
  --maz-border-color: rgba(0, 0, 0, 0.2);
}

/* Error state */
.error-message {
  color: var(--ww-color-error);
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

/* Valid/Invalid states */
.phone-input-container.is-valid :deep(.maz-input) {
  --maz-success: var(--ww-color-success);
}

.phone-input-container.is-invalid :deep(.maz-input) {
  --maz-error: var(--ww-color-error);
}

/* Loading state */
.phone-input-container.is-loading {
  opacity: 0.7;
  pointer-events: none;
}

.phone-input-container :deep(.m-input:not(.--has-state)) {
  color: v-bind('content?.labelColor || "#333333"');
}

.phone-input-container :deep(.maz-select),
.phone-input-container :deep(.maz-select__options),
.phone-input-container :deep(.maz-select-item),
.phone-input-container :deep(.maz-select__input) {
  color: v-bind('content?.textColor || "#333333"');
}

.phone-input-container :deep(.maz-select__options) {
  background-color: v-bind('content?.backgroundColor || "#ffffff"');
}
</style>

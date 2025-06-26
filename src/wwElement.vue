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
  
    <!-- Read Only View -->
    <div v-if="content.readOnly && localPhoneData.phoneNumber" class="phone-readonly-display">
      <div class="phone-flag">
        <span v-html="getCountryFlag(countryData.code)" class="country-flag"></span>
      </div>
      <span class="phone-number-text">
        {{ formattedPhoneNumber }}
      </span>
    </div>
    <div v-else-if="content.readOnly" class="phone-readonly-empty">
    </div>

    <!-- Regular Phone Input -->
    <MazPhoneNumberInput
      v-else
      v-model="localPhoneData.phoneNumber"
      v-model:country-code="localPhoneData.countryCode"
      size="sm"
      :show-code-on-list="content?.showCodeOnList ?? true"
      :preferred-countries="content?.preferredCountries ?? ['FR', 'GB', 'CA','US' , 'DE']"
      :country-locale="content?.language === 'fr' ? 'fr-FR' : 'en-US'"
      :auto-format="content?.autoFormat ?? true"
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
        '--maz-input-height': '36px',
        '--maz-border-color': content?.borderColor || 'rgba(0, 0, 0, 0.2)',
        '--maz-border-color-hover': content?.borderColor || 'rgba(0, 0, 0, 0.2)',
        '--maz-color-success': content?.successColor || '#28a745',
        '--maz-color-danger': content?.errorColor || '#ff6e6b',
        '--maz-color-success-50': `color-mix(in srgb, ${content?.successColor || '#28a745'} 10%, white)`,
        '--maz-color-success-100': `color-mix(in srgb, ${content?.successColor || '#28a745'} 20%, white)`,
        '--maz-color-success-200': `color-mix(in srgb, ${content?.successColor || '#28a745'} 40%, white)`,
        '--maz-color-success-300': `color-mix(in srgb, ${content?.successColor || '#28a745'} 60%, white)`,
  '--maz-color-success-400': `color-mix(in srgb, ${content?.successColor || '#28a745'} 80%, white)`,
  '--maz-color-success-600': `color-mix(in srgb, ${content?.successColor || '#28a745'} 80%, black)`,
  '--maz-color-success-700': `color-mix(in srgb, ${content?.successColor || '#28a745'} 60%, black)`,
  '--maz-color-success-800': `color-mix(in srgb, ${content?.successColor || '#28a745'} 40%, black)`,
  '--maz-color-success-900': `color-mix(in srgb, ${content?.successColor || '#28a745'} 20%, black)`,
  '--maz-color-danger-50': `color-mix(in srgb, ${content?.errorColor || '#ff6e6b'} 10%, white)`,
  '--maz-color-danger-100': `color-mix(in srgb, ${content?.errorColor || '#ff6e6b'} 20%, white)`,
  '--maz-color-danger-200': `color-mix(in srgb, ${content?.errorColor || '#ff6e6b'} 40%, white)`,
  '--maz-color-danger-300': `color-mix(in srgb, ${content?.errorColor || '#ff6e6b'} 60%, white)`,
  '--maz-color-danger-400': `color-mix(in srgb, ${content?.errorColor || '#ff6e6b'} 80%, white)`,
  '--maz-color-danger-600': `color-mix(in srgb, ${content?.errorColor || '#ff6e6b'} 80%, black)`,
  '--maz-color-danger-700': `color-mix(in srgb, ${content?.errorColor || '#ff6e6b'} 60%, black)`,
  '--maz-color-danger-800': `color-mix(in srgb, ${content?.errorColor || '#ff6e6b'} 40%, black)`,
  '--maz-color-danger-900': `color-mix(in srgb, ${content?.errorColor || '#ff6e6b'} 20%, black)`,
      }"
      :disabled="isLoading"
      :error="showError"
      :success="showSuccess"
      :translations="currentTranslations"
      @update="handleUpdate"
      @data="handleData"
      @country-code="handleCountryCode"
      class="work-sans-phone-input"
    >
      <template #selector-flag="{ countryCode }">
        <span v-html="getCountryFlag(countryCode)" class="country-flag"></span>
      </template>
      <template #country-list-flag="{ countryCode }">
        <span v-html="getCountryFlag(countryCode)" class="country-flag"></span>
      </template>
    </MazPhoneNumberInput>
    <div v-if="showError" class="error-message">
      {{ currentErrorMessage }}
    </div>
  </div>
</template>

<script>

import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput.mjs'
import 'maz-ui/css/main.css'


import { computed, ref, onMounted, onErrorCaptured, watch } from 'vue'
import * as countryFlagIcons from 'country-flag-icons/string/3x2'

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
    wwElementState: { type: Object, required: true },
  },
  emits: ['update:content', 'trigger-event'],
  setup(props) {
    // Error handling for component setup
    onErrorCaptured((err, instance, info) => {
      console.error('Component error:', err)
      console.info('Error instance:', instance)
      console.info('Error info:', info)
      return false // Prevent error from propagating
    })

    // Create a ref for the phone data with initial values
    const phoneDataRef = ref({
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
    })

    // Register the component variable
    const { setValue } = wwLib.wwVariable.useComponentVariable({
      uid: props.wwElementState.uid,
      name: 'phoneData',
      defaultValue: phoneDataRef.value,
    })

    // Create a computed property for the data
    const data = computed(() => ({
      ...phoneDataRef.value,
    }))

    // Watch for changes and update the variable
    watch(data, newData => setValue(newData), { deep: true, immediate: true })

    // Register the local context
    const markdown = `### Phone Input local informations

#### phoneData
Object containing all phone input data:
- \`phoneNumber\`: Current phone number value
- \`countryCode\`: Selected country code
- \`isValid\`: Boolean indicating if phone number is valid
- \`isPossible\`: Boolean indicating if phone number is possible
- And other formatting information`

    wwLib.wwElement.useRegisterElementLocalContext('phoneInput', data, {}, markdown)

    return {
      phoneData: phoneDataRef,
      setPhoneData: (newValue) => {
        phoneDataRef.value = { ...phoneDataRef.value, ...newValue }
        setValue(phoneDataRef.value)
      }
    }
  },
  data() {
    return {
      localPhoneData: {
        phoneNumber: (this.content && this.content.initialValue && this.content.initialValue.phoneNumber) || '',
        countryCode: (this.content && this.content.initialValue && this.content.initialValue.countryCode) || 'US',
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
    countryData() {
      return {
        dialCode: this.getDialCode(this.localPhoneData.countryCode),
        code: this.localPhoneData.countryCode.toLowerCase()
      };
    },
    formattedPhoneNumber() {
      if (!this.localPhoneData.phoneNumber) {
        return '';
      }
      return `+${this.countryData.dialCode} ${this.localPhoneData.phoneNumber}`;
    }
  },
  watch: {
    'content.language': {
      handler(newLang) {
        console.log('Language changed to:', newLang)
      },
      immediate: true,
    },
    'content.initialValue': {
      handler(newValue) {
        if (!newValue || typeof newValue !== 'object') return
        
        // Only update if we have actual values to prevent unnecessary formatting
        if (newValue.phoneNumber || newValue.countryCode) {
          this.localPhoneData = {
            ...this.localPhoneData,
            phoneNumber: newValue.phoneNumber || '',
            countryCode: newValue.countryCode || 'US'
          }
          this.setPhoneData(this.localPhoneData)
        }
      },
      deep: true,
      immediate: true
    },
    phoneData: {
      handler(newValue) {
        if (newValue === this.localPhoneData) return
        this.localPhoneData = { ...newValue }
        this.$emit('trigger-event', { name: 'change', event: newValue })
      },
      deep: true,
    },
  },
  methods: {
    async handleUpdate(data) {
      // Only update if we have actual data
      if (data && (data.phoneNumber || data.countryCode)) {
        this.localPhoneData = { ...this.localPhoneData, ...data }
        this.setPhoneData(this.localPhoneData)
      }
    },
    handleData(results) {
      console.log('📊 Handle Data Called:', results)
      // Only handle data if we have actual results
      if (results && (results.phoneNumber || results.countryCode)) {
        this.handleUpdate(results)
      }
    },
    handleCountryCode(countryCode) {
      this.localPhoneData.countryCode = countryCode
      this.setPhoneData(this.localPhoneData)
      this.$emit('trigger-event', { name: 'country-change', event: { countryCode } })
    },
    getDialCode(code) {
      const dialCodes = {
        'US': '1',
        'GB': '44',
        'FR': '33',
        // Add more as needed
        'DE': '49',
        'IT': '39',
        'ES': '34',
        'CA': '1',
      };
      return dialCodes[code] || '';
    },
    getCountryFlag(countryCode) {
      const code = countryCode.toUpperCase()
      if (countryFlagIcons[code]) {
        return countryFlagIcons[code]
      }
      console.warn(`No flag found for country code: ${code}`)
      return ''
    }
  },
}
</script>

<style lang="css" scoped>
.phone-input-container {
  position: relative;
  width: 100%;
  transition: none;
}

/* Override Maz UI default styles */
.phone-input-container :deep(.maz-input) {
  --maz-bg-color: var(--input-bg-color) !important;
  --maz-color-bg: var(--maz-color-bg) !important;
  --maz-color-bg-dark: var(--maz-color-bg) !important;
  --maz-color-bg-light: var(--maz-color-bg) !important;
  --maz-color-bg-lighter: var(--maz-color-bg) !important;

  border-color: v-bind('content?.borderColor || "rgba(0, 0, 0, 0.2)"') !important;
}

/* Fix dropdown caret visibility */
.phone-input-container {
  :deep(.maz-select) {
    .maz-select__caret {
      opacity: 1 !important;
      color: v-bind('content?.textColor || "#333333"') !important;
      margin-right: 4px;
    }

    .maz-select__input {
      padding-right: 24px !important;
    }
  }

  /* Ensure proper alignment of the select input */
  :deep(.maz-select__input-wrapper) {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

/* Error state */
.error-message {
  color: v-bind('content?.errorColor || "#dc3545"');
  margin-top: 0.5rem;
  font-size: 0.875rem;
}



/* Loading state */
.phone-input-container.is-loading {
  pointer-events: none;
}

.phone-input-container :deep(.m-input:not(.--has-state)) {
  color: v-bind('content?.labelColor || "#333333"');
}

.phone-readonly-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: var(--ww-color-light-100);
  
  .phone-flag {
    display: flex;
    align-items: center;
  }
  
  .phone-number-text {
    color: v-bind('content?.textColor || "#333333"');
    font-size: 1em;
  }
}

.phone-readonly-empty {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  background-color: var(--ww-color-light-100);
  color: v-bind('content?.placeholderColor || "#999999"');
  font-size: 1em;
}

.country-flag {
  display: inline-flex;
  width: 20px;
  height: 15px;
}

.country-flag :deep(svg) {
  width: 100%;
  height: 100%;
  border-radius: 2px;
  display: block;
}

/* Improve flag display in the input */
.phone-input-container :deep(.maz-select__flag) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 15px;
  overflow: hidden;
}

/* Improve flag display in the dropdown */
.phone-input-container :deep(.maz-select__options-list-item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.phone-input-container :deep(.maz-select__options-list-item .country-flag) {
  flex-shrink: 0;
}

/* Improve flag display in readonly mode */
.phone-readonly-display .phone-flag {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 15px;
  overflow: hidden;
}

.phone-readonly-display .country-flag {
  flex-shrink: 0;
}
</style>

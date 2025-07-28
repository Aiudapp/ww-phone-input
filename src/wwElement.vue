<template>
  <div
    class="phone-input-container"
    :class="containerClasses"
  >
    <!-- Read Only View -->
    <div v-if="isReadOnly" class="phone-readonly-display">
      <div class="phone-flag">
        <span v-html="getCountryFlag(countryData.code)" class="country-flag"></span>
      </div>
      <span class="phone-number-text">{{ formattedPhoneNumber }}</span>
    </div>
    <div v-else-if="content.readOnly" class="phone-readonly-empty"></div>

    <!-- Regular Phone Input -->
    <MazPhoneNumberInput
      v-else
      v-model="localPhoneData.phoneNumber"
      v-model:country-code="localPhoneData.countryCode"
      size="sm"
      :show-code-on-list="content?.showCodeOnList ?? true"
      :preferred-countries="content?.preferredCountries ?? ['FR', 'GB', 'CA', 'US', 'DE']"
      :country-locale="countryLocale"
      :auto-format="content?.autoFormat ?? true"
      :style="mazInputStyles"
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
import { computed, ref, onMounted, onErrorCaptured, watch } from 'vue'
import { AsYouType, parsePhoneNumber } from 'libphonenumber-js'
import MazPhoneNumberInput from '@hugodev-oc/maz-ui-custom/components/MazPhoneNumberInput.mjs'
import '@hugodev-oc/maz-ui-custom/css/main.css'
import * as countryFlagIcons from 'country-flag-icons/string/3x2'

// Translations object moved outside component for better performance
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

// Default phone data structure
const defaultPhoneData = {
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
    onErrorCaptured((err, instance, info) => {
      console.error('Component error:', err)
      console.info('Error instance:', instance)
      console.info('Error info:', info)
      return false
    })

    const phoneDataRef = ref({
      ...defaultPhoneData,
      phoneNumber: props.content?.initialValue?.phoneNumber || '',
      countryCode: props.content?.initialValue?.countryCode || 'US',
    })

    const { setValue, value } = wwLib.wwVariable.useComponentVariable({
      uid: props.wwElementState.uid,
      name: 'phoneData',
      defaultValue: phoneDataRef.value,
    })

    const data = computed(() => phoneDataRef.value)

    watch(value, (newValue) => {
      if (!newValue || typeof newValue !== 'object') return
      const hasChanges = Object.keys(newValue).some(key => 
        JSON.stringify(newValue[key]) !== JSON.stringify(phoneDataRef.value[key])
      )
      if (hasChanges) {
        phoneDataRef.value = { ...newValue }
      }
    }, { deep: true })

    const markdown = `### Phone Input Component
    
#### phoneData
Object containing phone input data:
- \`phoneNumber\`: Current phone number
- \`countryCode\`: Selected country code
- \`isValid\`: Validation status
- \`isPossible\`: Possibility status
- Additional formatting information`

    wwLib.wwElement.useRegisterElementLocalContext('phoneInput', data, {}, markdown)

    return {
      phoneData: phoneDataRef,
      setPhoneData: (newValue) => {
        if (!newValue || typeof newValue !== 'object') return
        const hasChanges = Object.keys(newValue).some(key => 
          JSON.stringify(newValue[key]) !== JSON.stringify(phoneDataRef.value[key])
        )
        if (hasChanges) {
          phoneDataRef.value = { ...phoneDataRef.value, ...newValue }
          setValue(phoneDataRef.value)
        }
      }
    }
  },

  data() {
    return {
      localPhoneData: { ...defaultPhoneData },
      isLoading: false,
      showError: false,
      showSuccess: false,
    }
  },

  computed: {
    containerClasses() {
      return {
        dark: this.content?.darkMode,
        'is-valid': this.localPhoneData.isValid,
        'is-invalid': !this.localPhoneData.isValid && this.localPhoneData.phoneNumber,
        'is-loading': this.isLoading,
      }
    },
    
    isReadOnly() {
      return this.content.readOnly && this.localPhoneData.phoneNumber
    },

    countryLocale() {
      return this.content?.language === 'fr' ? 'fr-FR' : 'en-US'
    },

    currentTranslations() {
      return translations[this.content?.language || 'en']
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
      }
    },

    mazInputStyles() {
      const { content } = this
      return {
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
      }
    },

    formattedPhoneNumber() {
      if (!this.localPhoneData.phoneNumber) return ''
      
      try {
        if (this.localPhoneData.formatInternational) {
          return this.localPhoneData.formatInternational
        }
        
        const phoneNumber = parsePhoneNumber(
          this.localPhoneData.phoneNumber,
          this.localPhoneData.countryCode
        )
        if (phoneNumber) {
          return phoneNumber.formatInternational()
        }
      } catch (error) {
        console.warn('Phone formatting error:', error)
      }
      
      return `+${this.countryData.dialCode} ${this.localPhoneData.phoneNumber}`
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
        
        if (newValue.phoneNumber || newValue.countryCode) {
          const newData = {
            ...this.localPhoneData,
            phoneNumber: newValue.phoneNumber || '',
            countryCode: newValue.countryCode || 'US'
          }

          const hasChanges = 
            newValue.phoneNumber !== this.localPhoneData.phoneNumber || 
            newValue.countryCode !== this.localPhoneData.countryCode

          if (hasChanges) {
            this.localPhoneData = newData
            this.setPhoneData(newData)
          }
        }
      },
      deep: true,
      immediate: true
    },
    phoneData: {
      handler(newValue) {
        if (!newValue || typeof newValue !== 'object') return
        
        const hasChanges = Object.keys(newValue).some(key => 
          JSON.stringify(newValue[key]) !== JSON.stringify(this.localPhoneData[key])
        )
        
        if (hasChanges) {
          this.localPhoneData = { ...this.localPhoneData, ...newValue }
          // Note: Change events are now emitted directly in handleUpdate, handleData, and handleCountryCode methods
        }
      },
      deep: true,
      immediate: true
    },
  },

  methods: {
    // Centralized method to emit change event
    emitChangeEvent() {
      this.$emit('trigger-event', { name: 'change', event: this.localPhoneData })
    },

    async handleUpdate(data) {
      if (data && (data.phoneNumber || data.countryCode)) {
        const newData = { ...this.localPhoneData, ...data }
        const hasChanges = Object.keys(data).some(key => 
          JSON.stringify(data[key]) !== JSON.stringify(this.localPhoneData[key])
        )

        if (hasChanges) {
          this.localPhoneData = newData
          this.setPhoneData(newData)
          // Only emit change event here for user input updates
          this.emitChangeEvent()
        }
      }
    },

    handleData(results) {
      if (!results) return

      try {
        const phoneNumber = parsePhoneNumber(results.phoneNumber || '', results.countryCode)
        const formatter = new AsYouType(results.countryCode)
        formatter.input(results.phoneNumber || '')
        
        const newData = {
          ...this.localPhoneData,
          ...results,
          formatInternational: phoneNumber ? phoneNumber.formatInternational() : '',
          formatNational: formatter.getNumber()?.formatNational || formatter.getFormattedNumber(),
          e164: phoneNumber ? phoneNumber.format('E.164') : '',
          nationalNumber: results.nationalNumber || '',
          countryCallingCode: results.countryCallingCode || '',
          isPossible: results.isPossible || false,
          isValid: results.isValid || false
        }

        const hasChanges = Object.keys(newData).some(key => 
          JSON.stringify(newData[key]) !== JSON.stringify(this.localPhoneData[key])
        )

        if (hasChanges) {
          this.localPhoneData = newData
          this.setPhoneData(newData)
          // Don't emit change event here as it's already emitted in handleUpdate
        }
      } catch (error) {
        console.warn('Phone formatting error:', error)
      }
    },

    handleCountryCode(countryCode) {
      if (countryCode !== this.localPhoneData.countryCode) {
        this.localPhoneData.countryCode = countryCode
        this.setPhoneData(this.localPhoneData)
        // Emit both country-change and change events when country is changed
        this.$emit('trigger-event', { name: 'country-change', event: { countryCode } })
        this.emitChangeEvent()
      }
    },

    getDialCode(code) {
      const dialCodes = {
        'US': '1',
        'GB': '44',
        'FR': '33',
        'DE': '49',
        'IT': '39',
        'ES': '34',
        'CA': '1',
      }
      return dialCodes[code] || ''
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

  :deep(.maz-select__input-wrapper) {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.error-message {
  color: v-bind('content?.errorColor || "#dc3545"');
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

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

  :deep(svg) {
    width: 100%;
    height: 100%;
    border-radius: 2px;
    display: block;
  }
}

/* Flag display improvements */
.phone-input-container :deep(.maz-select__flag),
.phone-readonly-display .phone-flag {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 15px;
  overflow: hidden;
}

.phone-input-container :deep(.maz-select__options-list-item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;

  .country-flag {
    flex-shrink: 0;
  }
}

.phone-readonly-display .country-flag {
  flex-shrink: 0;
}
</style>

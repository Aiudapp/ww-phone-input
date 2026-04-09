declare module 'maz-ui/dist/components/MazInputPhoneNumber.js' {
  import { DefineComponent } from 'vue'

  interface MazInputPhoneNumberProps {
    modelValue?: string
    countryCode?: string
    size?: string
    showCodeInList?: boolean
    preferredCountries?: string[]
    countryLocale?: string
    autoFormat?: 'blur' | 'typing' | 'disabled' | false
    orientation?: 'row' | 'col' | 'responsive'
    block?: boolean
    style?: Record<string, string>
    disabled?: boolean
    error?: boolean
    success?: boolean
    translations?: Record<string, any>
  }

  interface MazInputPhoneNumberEmits {
    'update:model-value': (value: string) => void
    'update:country-code': (code: string) => void
    data: (results: any) => void
    'country-code': (code: string) => void
  }

  const MazInputPhoneNumber: DefineComponent<MazInputPhoneNumberProps, {}, {}, {}, {}, {}, {}, MazInputPhoneNumberEmits>
  export default MazInputPhoneNumber
}

declare module 'maz-ui/styles' {
  const content: string
  export default content
}

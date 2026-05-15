import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VDataTable } from 'vuetify/components/VDataTable'

const fastForwardLight = {
  dark: false,
  colors: {
    background: '#F5F5F5',
    surface: '#FFFFFF',
    primary: '#1B2A4A',
    secondary: '#F57C00',
    accent: '#F57C00',
    success: '#43A047',
    warning: '#FFA000',
    error: '#E53935',
    info: '#1976D2',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
  },
}

const fastForwardDark = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#3F6CB5',
    secondary: '#FFB74D',
    accent: '#FFB74D',
    success: '#66BB6A',
    warning: '#FFB74D',
    error: '#EF5350',
    info: '#42A5F5',
    'on-primary': '#FFFFFF',
    'on-secondary': '#000000',
  },
}

const vuetify = createVuetify({
  components: {
    ...components,
    VDataTable,
  },
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: 'fastForwardLight',
    themes: {
      fastForwardLight,
      fastForwardDark,
    },
  },
})

export default vuetify

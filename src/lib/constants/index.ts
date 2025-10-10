// Energy calculation constants
export const ENERGY_CONSTANTS = {
  // Energy tax rates (2025)
  ENERGY_TAX_STROOM_PER_KWH: 0.1316, // €/kWh (€0,1088 * 1,21)
  ENERGY_TAX_REDUCTION: 631.35, // €/year reduction on energy tax
  
  // Default contract values
  DEFAULT_VAST_CONTRACT: {
    STROOM_KALE_PRIJS: 0.10, // €/kWh excl. tax
    TERUGLEVERVERGOEDING: 0.01, // €/kWh for fixed contracts
    GAS_KALE_PRIJS: 0.63, // €/m³ excl. tax
    VASTE_LEVERINGSKOSTEN: 7, // €/month
    KORTING_EENMALIG: 200, // € one-time discount
  },
  
  DEFAULT_DYNAMISCH_CONTRACT: {
    STROOM_KALE_PRIJS: 0.085, // €/kWh excl. tax
    TERUGLEVERVERGOEDING: 0.0595, // €/kWh average spot price
    GAS_KALE_PRIJS: 0.63, // €/m³ excl. tax
    VASTE_LEVERINGSKOSTEN: 7, // €/month
    MAANDELIJKSE_VERGOEDING: 0, // €/month
    OPSLAG_PER_KWH: 0.025, // €/kWh markup
    OPSLAG_INVOEDING: 0.023, // €/kWh markup for feed-in
    KORTING_EENMALIG: 0, // € no discount for dynamic contracts
  },
  
  // Netbeheerder costs (annual)
  NETBEHEERDER_COSTS: {
    LIANDER: { stroom: 471, gas: 248 },
    STEDIN: { stroom: 490, gas: 254 },
    ENEXIS: { stroom: 492, gas: 267 },
  },
  
  // Default user profile values
  DEFAULT_USER_PROFILE: {
    NETBEHEERDER: 'Liander',
    JAARVERBRUIK_STROOM: 2900,
    JAARVERBRUIK_STROOM_PIEK: 1160, // 40% of total
    JAARVERBRUIK_STROOM_DAL: 1740, // 60% of total
    JAARVERBRUIK_GAS: 1200,
    GEEN_GAS: false,
    HEEFT_ZONNEPANELEN: false,
    PV_OPWEK: 0,
    PERCENTAGE_ZELFVERBRUIK: 0,
  },
  
  // Piek/dal distribution
  PIEK_DAL_DISTRIBUTION: {
    PIEK: 0.4, // 40% peak hours
    DAL: 0.6, // 60% off-peak hours
  },
  
  // Contract durations
  CONTRACT_DURATIONS: {
    DEFAULT_MONTHS: 12,
    MIN_MONTHS: 1,
    MAX_MONTHS: 60,
  },
  
  // Scoring scales
  SCORING_SCALES: {
    DUURZAAMHEID: { min: 1, max: 5, default: 3 },
    KLANTTEVREDENHEID: { min: 1, max: 5, default: 3 },
  },
} as const;

// UI constants
export const UI_CONSTANTS = {
  // Animation durations (ms)
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Debounce delays (ms)
  DEBOUNCE_DELAY: {
    INPUT: 250,
    SEARCH: 500,
    CALCULATION: 1000,
  },
  
  // Loading states
  LOADING_STATES: {
    MIN_DISPLAY_TIME: 500, // Minimum time to show loading spinner
    TIMEOUT: 30000, // 30 seconds timeout
  },
  
  // Responsive breakpoints (px)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  
  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 50,
    MODAL: 9999,
    TOOLTIP: 10000,
  },
} as const;

// Form validation constants
export const VALIDATION_CONSTANTS = {
  // Input limits
  LIMITS: {
    MIN_VERBRUIK: 0,
    MAX_VERBRUIK: 100000,
    MIN_PERCENTAGE: 0,
    MAX_PERCENTAGE: 100,
    MIN_PRICE: 0,
    MAX_PRICE: 10,
  },
  
  // Error messages
  ERRORS: {
    REQUIRED_FIELD: 'Dit veld is verplicht',
    INVALID_NUMBER: 'Voer een geldig getal in',
    INVALID_PERCENTAGE: 'Percentage moet tussen 0 en 100 zijn',
    INVALID_PRICE: 'Prijs moet positief zijn',
    NETWORK_ERROR: 'Netwerkfout: Probeer het opnieuw',
    CALCULATION_ERROR: 'Berekening mislukt: Controleer je invoer',
  },
  
  // Success messages
  SUCCESS: {
    CONTRACT_ADDED: 'Contract succesvol toegevoegd',
    CALCULATION_COMPLETE: 'Berekening voltooid',
    FORM_SAVED: 'Formulier opgeslagen',
  },
} as const;

// API constants
export const API_CONSTANTS = {
  // Rate limiting
  RATE_LIMITS: {
    CALCULATIONS_PER_MINUTE: 10,
    REQUESTS_PER_HOUR: 100,
    FORM_SUBMISSIONS_PER_MINUTE: 5,
  },
  
  // Cache TTL (seconds)
  CACHE_TTL: {
    CALCULATIONS: 300, // 5 minutes
    CONTRACT_DATA: 3600, // 1 hour
    USER_PROFILE: 1800, // 30 minutes
  },
  
  // Timeouts (ms)
  TIMEOUTS: {
    API_REQUEST: 10000, // 10 seconds
    CALCULATION: 30000, // 30 seconds
    FILE_UPLOAD: 60000, // 60 seconds
  },
} as const;

export const BATTERY_DYNAMIC_2025 = {
  SPOT_PRICE_AVG: 0.0868, // €/kWh, gewogen gemiddelde spotprijs 2025
  OPSLAG_AFNAME: 0.025, // €/kWh opslag voor afname bij dynamisch contract
  OPSLAG_INVOEDING: 0.023, // €/kWh opslag (aftrek) voor teruglevering
  MAANDELIJKSE_VERGOEDING: 5.99, // €/maand vaste vergoeding
};

export const BATTERY_DEFAULTS = {
  ROUND_TRIP_EFFICIENCY: 0.9,
  DEGRADATIE_PER_JAAR: 0.02,
};

export const BATTERY_FIXED_2025 = {
  STROOM_KALE_PRIJS: 0.21, // €/kWh all-in kale component
  TERUGLEVERVERGOEDING: 0.07, // €/kWh typische vergoeding 2025
  TERUGLEVER_VERGOEDING_MIN_2027: 0.105, // 50% van STROOM_KALE_PRIJS
  VASTE_LEVERINGSKOSTEN: 8.5, // €/maand
};

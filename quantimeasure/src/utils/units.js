export const unitCategories = {
  length: {
    label: "Length",
    icon: "📏",
    units: {
      meter: { label: "Meter", symbol: "m", toBase: 1 },
      kilometer: { label: "Kilometer", symbol: "km", toBase: 1000 },
      centimeter: { label: "Centimeter", symbol: "cm", toBase: 0.01 },
      millimeter: { label: "Millimeter", symbol: "mm", toBase: 0.001 },
      mile: { label: "Mile", symbol: "mi", toBase: 1609.344 },
      yard: { label: "Yard", symbol: "yd", toBase: 0.9144 },
      foot: { label: "Foot", symbol: "ft", toBase: 0.3048 },
      inch: { label: "Inch", symbol: "in", toBase: 0.0254 },
    },
  },
  weight: {
    label: "Weight",
    icon: "⚖️",
    units: {
      kilogram: { label: "Kilogram", symbol: "kg", toBase: 1 },
      gram: { label: "Gram", symbol: "g", toBase: 0.001 },
      milligram: { label: "Milligram", symbol: "mg", toBase: 0.000001 },
      pound: { label: "Pound", symbol: "lb", toBase: 0.453592 },
      ounce: { label: "Ounce", symbol: "oz", toBase: 0.0283495 },
      ton: { label: "Ton", symbol: "t", toBase: 1000 },
    },
  },
  volume: {
    label: "Volume",
    icon: "🧪",
    units: {
      liter: { label: "Liter", symbol: "L", toBase: 1 },
      milliliter: { label: "Milliliter", symbol: "mL", toBase: 0.001 },
      gallon: { label: "Gallon (US)", symbol: "gal", toBase: 3.78541 },
      quart: { label: "Quart", symbol: "qt", toBase: 0.946353 },
      pint: { label: "Pint", symbol: "pt", toBase: 0.473176 },
      cup: { label: "Cup", symbol: "cup", toBase: 0.236588 },
      fluid_ounce: { label: "Fluid Ounce", symbol: "fl oz", toBase: 0.0295735 },
      cubic_meter: { label: "Cubic Meter", symbol: "m³", toBase: 1000 },
    },
  },
  temperature: {
    label: "Temperature",
    icon: "🌡️",
    units: {
      celsius: { label: "Celsius", symbol: "°C" },
      fahrenheit: { label: "Fahrenheit", symbol: "°F" },
      kelvin: { label: "Kelvin", symbol: "K" },
    },
  },
};

export function convertTemperature(value, from, to) {
  let celsius;
  if (from === "celsius") celsius = value;
  else if (from === "fahrenheit") celsius = (value - 32) * (5 / 9);
  else if (from === "kelvin") celsius = value - 273.15;

  if (to === "celsius") return celsius;
  if (to === "fahrenheit") return celsius * (9 / 5) + 32;
  if (to === "kelvin") return celsius + 273.15;
  return value;
}

export function convertUnit(value, from, to, category) {
  if (category === "temperature") return convertTemperature(value, from, to);
  const units = unitCategories[category].units;
  const baseValue = value * units[from].toBase;
  return baseValue / units[to].toBase;
}

export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "";
  if (Math.abs(num) >= 1e9 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(6);
  }
  const str = parseFloat(num.toPrecision(10)).toString();
  return str;
}
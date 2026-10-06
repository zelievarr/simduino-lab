export const clampTMP36Temperature=value=>Math.max(-40,Math.min(125,Number(value)||0));

// TMP36: 500 mV at 0 °C, 10 mV per degree Celsius.
export const tmp36Voltage=temperature=>.5+clampTMP36Temperature(temperature)*.01;

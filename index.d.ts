/**
 * Parse CSS file and return object with colors, as defined for :root selector in CSS.
 *
 * @param cssPath Path to css/scss file
 * @param useVars If true, will use colros as CSS variables, not as hex values
 */
export function generateColors(cssPath: string, useVars?: boolean): Record<string, string>;

export default generateColors;

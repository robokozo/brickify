export interface ColorRating {
  ratio: number;
  level: "excellent" | "good" | "poor";
  description: string;
}

export interface ColorSuggestion {
  foreground: string;
  background: string;
  name: string;
}

export const useContrastChecker = () => {
  // Convert hex color to RGB
  const hexToRgb = (
    hex: string,
  ): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Calculate relative luminance (WCAG formula)
  const getRelativeLuminance = (rgb: {
    r: number;
    g: number;
    b: number;
  }): number => {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r =
      rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g =
      gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b =
      bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // Calculate contrast ratio between two colors
  const calculateContrastRatio = (color1: string, color2: string): number => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) {
      return 1;
    }

    const l1 = getRelativeLuminance(rgb1);
    const l2 = getRelativeLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  };

  // Get contrast rating and guidance
  const getContrastRating = (
    foreground: string,
    background: string,
  ): ColorRating => {
    const ratio = calculateContrastRatio(foreground, background);

    let level: "excellent" | "good" | "poor";
    let description: string;

    if (ratio >= 7) {
      level = "excellent";
      description =
        "Excellent contrast! This QR code should be very easy to scan. (WCAG AAA)";
    } else if (ratio >= 4.5) {
      level = "good";
      description =
        "Good contrast. This QR code should scan reliably. (WCAG AA)";
    } else {
      level = "poor";
      description =
        "Poor contrast. This QR code may be difficult to scan. Consider using higher contrast colors.";
    }

    return {
      ratio: Math.round(ratio * 100) / 100,
      level,
      description,
    };
  };

  // Suggested high-contrast color combinations using Rebrickable (colors.json) hex values
  const colorSuggestions: ColorSuggestion[] = [
    {
      foreground: "#05131D",
      background: "#FFFFFF",
      name: "Black on White (Classic)",
    }, // #0, #15
    {
      foreground: "#05131D",
      background: "#F2CD37",
      name: "Black on Yellow (High Visibility)",
    }, // #0, #14
    {
      foreground: "#0A3463",
      background: "#FFFFFF",
      name: "Dark Blue on White",
    }, // #272, #15
    { foreground: "#720E0F", background: "#FFFFFF", name: "Dark Red on White" }, // #320, #15
    {
      foreground: "#184632",
      background: "#FFFFFF",
      name: "Dark Green on White",
    }, // #288, #15
    {
      foreground: "#6C6E68",
      background: "#A0A5A9",
      name: "Dark Bluish Gray on Light Bluish Gray",
    }, // #72, #71
    { foreground: "#05131D", background: "#E4CD9E", name: "Black on Tan" }, // #0, #19
  ];

  return {
    calculateContrastRatio,
    getContrastRating,
    colorSuggestions,
    hexToRgb,
  };
};

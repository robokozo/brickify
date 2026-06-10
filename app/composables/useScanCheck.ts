import jsQR from "jsqr";

export interface ScanCheckResult {
  scannable: boolean;
  message: string;
}

// Rendering resolution for the simulated photo of the build
const MODULE_PX = 8;
// Standard QR quiet zone is 4 modules of background on every side
const QUIET_ZONE_MODULES = 4;

export const useScanCheck = () => {
  /**
   * Simulates scanning the build with a phone camera: draws every module in
   * its configured color and runs a real QR decoder on the result.
   */
  const checkScannability = ({
    matrix,
    foreground,
    background,
    payload,
  }: {
    matrix: Array<Array<boolean>>;
    foreground: string;
    background: string;
    payload: string;
  }): ScanCheckResult => {
    const size = matrix.length;
    if (size === 0) {
      return { scannable: false, message: "No QR code to check." };
    }

    const px = (size + QUIET_ZONE_MODULES * 2) * MODULE_PX;
    const canvas = document.createElement("canvas");
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx === null) {
      return {
        scannable: false,
        message: "Could not run the scan simulation in this browser.",
      };
    }

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, px, px);
    ctx.fillStyle = foreground;

    for (let y = 0; y < size; y++) {
      const row = matrix[y];
      if (row === undefined) continue;
      for (let x = 0; x < size; x++) {
        if (row[x] !== true) continue;
        ctx.fillRect(
          (QUIET_ZONE_MODULES + x) * MODULE_PX,
          (QUIET_ZONE_MODULES + y) * MODULE_PX,
          MODULE_PX,
          MODULE_PX,
        );
      }
    }

    const imageData = ctx.getImageData(0, 0, px, px);

    // Most phone scanners expect dark modules on a light background, so only
    // a non-inverted decode counts as a pass
    const result = jsQR(imageData.data, px, px, {
      inversionAttempts: "dontInvert",
    });

    if (result === null) {
      const inverted = jsQR(imageData.data, px, px, {
        inversionAttempts: "onlyInvert",
      });
      return {
        scannable: false,
        message:
          inverted !== null
            ? "This build only decodes inverted (light on dark). Most phone cameras expect dark modules on a light background, so swap or darken your colors."
            : "A simulated phone scan could not read this build. Increase the contrast between the foreground and background colors.",
      };
    }

    if (result.data !== payload) {
      return {
        scannable: false,
        message:
          "A scan decoded the wrong content from this build. Try higher-contrast colors.",
      };
    }

    return {
      scannable: true,
      message:
        "A simulated phone scan read this build correctly with the current colors.",
    };
  };

  return { checkScannability };
};

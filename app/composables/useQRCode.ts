import QRCode from "qrcode";

export interface WiFiConfig {
  ssid: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

export const useQRCode = () => {
  const generateWiFiString = (config: WiFiConfig): string => {
    const { ssid, password, security, hidden } = config;

    // Escape special characters in SSID and password
    const escapeString = (str: string): string => {
      return str
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/:/g, "\\:")
        .replace(/"/g, '\\"');
    };

    const escapedSSID = escapeString(ssid);
    const escapedPassword = security !== "nopass" ? escapeString(password) : "";

    // Format: WIFI:T:WPA;S:mynetwork;P:mypassword;H:true;;
    let wifiString = `WIFI:T:${security};S:${escapedSSID};`;

    if (security !== "nopass") {
      wifiString += `P:${escapedPassword};`;
    }

    if (hidden === true) {
      wifiString += "H:true;";
    }

    wifiString += ";";

    return wifiString;
  };

  const generateQRMatrix = async (
    wifiString: string,
    errorCorrectionLevel: "L" | "M" | "Q" | "H" = "H",
  ): Promise<boolean[][]> => {
    try {
      // Generate QR code with high error correction
      const qrData = await QRCode.create(wifiString, {
        errorCorrectionLevel,
      });

      const modules = qrData.modules;
      const size = modules.size;
      const matrix: boolean[][] = [];

      // Convert QR modules to 2D boolean array
      for (let y = 0; y < size; y++) {
        const row: boolean[] = [];
        for (let x = 0; x < size; x++) {
          row.push(modules.get(x, y) === 1);
        }
        matrix.push(row);
      }

      return matrix;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw error;
    }
  };

  const getQRCodeSize = (matrix: boolean[][]): number => {
    return matrix.length;
  };

  return {
    generateWiFiString,
    generateQRMatrix,
    getQRCodeSize,
  };
};

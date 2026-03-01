import QRCode from "qrcode";

export const useQRCode = () => {
  const generateQRMatrix = async ({
    payload,
    errorCorrectionLevel = "H",
  }: {
    payload: string;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  }): Promise<boolean[][]> => {
    try {
      // Generate QR code with high error correction
      const qrData = await QRCode.create(payload, {
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
    generateQRMatrix,
    getQRCodeSize,
  };
};

import QRCodeStyling from "qr-code-styling";

// qr-code-styling builds the QR model synchronously in its constructor but
// only exposes rendered images publicly. The brick pipeline needs the raw
// module matrix, so we read the underlying qrcode-generator instance.
interface QrModel {
  getModuleCount: () => number;
  isDark: (row: number, col: number) => boolean;
}

export const useQRCode = () => {
  const generateQRMatrix = async ({
    payload,
    errorCorrectionLevel = "H",
  }: {
    payload: string;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  }): Promise<boolean[][]> => {
    try {
      const qr = new QRCodeStyling({
        data: payload,
        qrOptions: { errorCorrectionLevel },
      });

      const model = (qr as unknown as { _qr?: QrModel })._qr;
      if (model === undefined) {
        throw new Error("QR model was not generated");
      }

      const size = model.getModuleCount();
      const matrix: boolean[][] = [];
      for (let y = 0; y < size; y++) {
        const row: boolean[] = [];
        for (let x = 0; x < size; x++) {
          row.push(model.isDark(y, x));
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

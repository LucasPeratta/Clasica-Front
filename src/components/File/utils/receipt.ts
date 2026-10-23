import { apiFetch } from "../../common/apiFetch";
import { buildReceiptPdf, iReceipt } from "./receiptPdf";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

let logoCache: Promise<string | null> | null = null;
const loadLogo = () => {
  logoCache ??= fetch("/clasicalogo.jpg")
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    )
    .catch(() => null);
  return logoCache;
};

/**
 * Arma el PDF del recibo (original y duplicado en una hoja A4) y lo descarga.
 * Devuelve un mensaje de error o null.
 */
export const downloadReceipt = async (fileId: string, pagoId: string): Promise<string | null> => {
  try {
    const response = await apiFetch(`${apiUrl}/file/${fileId}/pagos/${pagoId}/recibo`);
    if (!response.ok) return "No se pudo armar el recibo. Intentá de nuevo.";
    const receipt: iReceipt = await response.json();
    const logo = await loadLogo();

    const doc = buildReceiptPdf(receipt, logo);

    const name = receipt.pasajero?.nombre ? ` - ${receipt.pasajero.nombre}` : "";
    doc.save(`Recibo ${String(receipt.numero).padStart(6, "0")}${name}.pdf`);
    return null;
  } catch (error) {
    console.error(error);
    return "No se pudo armar el recibo. Intentá de nuevo.";
  }
};

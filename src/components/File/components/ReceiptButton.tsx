import { MouseEvent, useState } from "react";
import { Alert, Button, CircularProgress, Snackbar } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { downloadReceipt } from "../utils/receipt";

/**
 * Botón "Recibo": descarga el PDF del recibo de un pago recibido
 */
export const ReceiptButton = ({ fileId, pagoId }: { fileId: string; pagoId: string }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (e: MouseEvent) => {
    // Que no abra la fila (en las listas, la fila entera lleva al file)
    e.stopPropagation();
    setLoading(true);
    setError(await downloadReceipt(fileId, pagoId));
    setLoading(false);
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        onClick={handleClick}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} /> : <ReceiptLongIcon />}
        sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, whiteSpace: "nowrap" }}
      >
        Recibo
      </Button>
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

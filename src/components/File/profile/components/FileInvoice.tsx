import { useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import dayjs from "dayjs";
import { iFile } from "../../model";
import { iPaymentsSummary } from "../../paymentsHandler";
import { iInvoiceInput, removeInvoice } from "../../invoiceHandler";
import { formatMoney } from "../../utils/totals";
import { InvoiceDialog } from "../../components/InvoiceDialog";

interface FileInvoiceProps {
  file: iFile;
  // Estado de los cobros: avisa cuando ya se puede facturar y sugiere el importe
  payments: iPaymentsSummary | null;
  onChange: (invoice: iInvoiceInput | null) => void;
}

/**
 * Facturación del file: se factura entero, de una vez (normalmente cuando el pasajero pagó todo)
 */
export const FileInvoice = ({ file, payments, onChange }: FileInvoiceProps) => {
  const [editing, setEditing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [error, setError] = useState(false);

  const invoiced = !!file.facturadoAt;
  const fullyPaid = payments?.estado === "PAGADO";

  const handleRemove = async () => {
    setConfirmRemove(false);
    if (await removeInvoice(file.id)) onChange(null);
    else setError(true);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Alert
        severity={invoiced ? "success" : fullyPaid ? "warning" : "info"}
        icon={<ReceiptIcon />}
        sx={{ borderRadius: 2, alignItems: "center", "& .MuiAlert-message": { flex: 1 } }}
        action={
          invoiced ? (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" color="inherit" onClick={() => setEditing(true)}>
                Corregir
              </Button>
              <Button size="small" color="inherit" onClick={() => setConfirmRemove(true)}>
                Quitar
              </Button>
            </Box>
          ) : (
            <Button size="small" variant="contained" onClick={() => setEditing(true)} sx={{ whiteSpace: "nowrap" }}>
              Marcar como facturado
            </Button>
          )
        }
      >
        {invoiced ? (
          <Typography sx={{ fontWeight: 600 }}>
            Facturado el {dayjs(file.facturadoAt).format("DD/MM/YYYY")}
            {file.facturaNumero ? ` · Factura ${file.facturaNumero}` : ""}
            {file.facturaMoneda && file.facturaImporte ? ` · ${formatMoney(Number(file.facturaImporte), file.facturaMoneda)}` : ""}
          </Typography>
        ) : (
          <Typography sx={{ fontWeight: 600 }}>
            {fullyPaid ? "El pasajero ya pagó todo: falta facturar este file." : "Todavía no se facturó."}
          </Typography>
        )}
      </Alert>
      {error && (
        <Alert severity="error" onClose={() => setError(false)} sx={{ mt: 1 }}>
          No se pudo quitar la facturación. Intentá de nuevo.
        </Alert>
      )}

      {editing && (
        <InvoiceDialog
          fileId={file.id}
          initial={
            invoiced
              ? { fecha: file.facturadoAt, importe: Number(file.facturaImporte), moneda: file.facturaMoneda, numero: file.facturaNumero }
              : { importe: payments?.total ?? null, moneda: payments?.moneda ?? null }
          }
          onClose={() => setEditing(false)}
          onSaved={(invoice) => {
            setEditing(false);
            onChange(invoice);
          }}
        />
      )}

      <Dialog open={confirmRemove} onClose={() => setConfirmRemove(false)}>
        <DialogTitle>Quitar facturación</DialogTitle>
        <DialogContent>
          <DialogContentText>El file vuelve a quedar como "sin facturar" y sale del balance.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRemove(false)}>Cancelar</Button>
          <Button color="error" onClick={handleRemove}>
            Quitar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

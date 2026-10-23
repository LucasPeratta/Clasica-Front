import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import { CURRENCIES } from "../utils/totals";
import { iInvoiceInput, setInvoice } from "../invoiceHandler";

interface InvoiceFormProps {
  fileId: string;
  // Cómo arranca: lo que ya tenía (al corregir) o lo que se le cobra al pasajero
  initial: { fecha?: string | null; importe?: number | null; moneda?: string | null; numero?: string | null };
  onCancel: () => void;
  onSaved: (invoice: iInvoiceInput) => void;
}

/**
 * Datos de la factura de un file (se factura entero, de una vez) con sus botones
 */
export const InvoiceForm = ({ fileId, initial, onCancel, onSaved }: InvoiceFormProps) => {
  const [fecha, setFecha] = useState(dayjs(initial.fecha ?? undefined).format("YYYY-MM-DD"));
  const [importe, setImporte] = useState(initial.importe ? String(initial.importe) : "");
  const [moneda, setMoneda] = useState(initial.moneda ?? "USD");
  const [numero, setNumero] = useState(initial.numero ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    const invoice = { fecha: dayjs(fecha).hour(12).toISOString(), importe: Number(importe), moneda, numero: numero.trim() };
    const msg = await setInvoice(fileId, invoice);
    setSaving(false);
    if (msg) setError(msg);
    else onSaved(invoice);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Fecha de la factura"
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField select label="Moneda" value={moneda} onChange={(e) => setMoneda(e.target.value)}>
        {CURRENCIES.map((c) => (
          <MenuItem key={c.value} value={c.value}>
            {c.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Importe facturado"
        type="number"
        value={importe}
        onChange={(e) => setImporte(e.target.value)}
        helperText="Viene con lo que se le cobra al pasajero; cambialo si la factura dice otra cosa"
        InputProps={{
          startAdornment: <InputAdornment position="start">{CURRENCIES.find((c) => c.value === moneda)?.symbol}</InputAdornment>,
        }}
      />
      <TextField
        label="Número de factura (opcional)"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
        inputProps={{ maxLength: 50 }}
      />
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !(Number(importe) > 0) || !fecha}>
          {saving ? "Guardando..." : "Guardar factura"}
        </Button>
      </Box>
    </Box>
  );
};

type InvoiceDialogProps = Omit<InvoiceFormProps, "onCancel"> & { onClose: () => void };

/**
 * Marcar el file como facturado (o corregir la factura)
 */
export const InvoiceDialog = ({ onClose, ...props }: InvoiceDialogProps) => (
  <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontWeight: 700 }}>{props.initial.fecha ? "Corregir facturación" : "Marcar como facturado"}</DialogTitle>
    <DialogContent sx={{ pt: "8px !important" }}>
      <InvoiceForm {...props} onCancel={onClose} />
    </DialogContent>
  </Dialog>
);

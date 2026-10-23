import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import dayjs from "dayjs";
import { iFileToInvoice, searchFilesToInvoice } from "../File/invoiceHandler";
import { InvoiceForm } from "../File/components/InvoiceDialog";
import { formatMoney } from "../File/utils/totals";
import { formatFileNumber } from "../File/utils/fileNumber";

const fileLabel = (file: { numero?: number | null; anio?: number | null; destino: string }) =>
  [formatFileNumber(file), file.destino].filter(Boolean).join(" · ");

// Cuánto pagó el pasajero y si ya está facturado
const FileStatus = ({ file }: { file: iFileToInvoice }) => (
  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
    {file.facturadoAt ? (
      <Chip size="small" color="success" label={`Facturado ${dayjs(file.facturadoAt).format("DD/MM/YY")}`} sx={{ fontWeight: 600 }} />
    ) : file.estado === "PAGADO" ? (
      <Chip size="small" color="warning" label="Pagado, falta facturar" sx={{ fontWeight: 600 }} />
    ) : file.moneda && file.falta > 0 ? (
      <Chip size="small" variant="outlined" label={`Debe ${formatMoney(file.falta, file.moneda)}`} sx={{ fontWeight: 600 }} />
    ) : (
      <Chip size="small" variant="outlined" label="Sin importe" />
    )}
  </Box>
);

interface NewInvoiceDialogProps {
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Facturar un file sin entrar a él: se busca el pasajero (o número de file), se elige el file
 * y se cargan los datos de la factura. Igual que registrar un pago.
 */
export const NewInvoiceDialog = ({ onClose, onSaved }: NewInvoiceDialogProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState<iFileToInvoice[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<iFileToInvoice | null>(null);

  // Buscar cuando se deja de escribir
  useEffect(() => {
    const term = searchInput.trim();
    if (!term) {
      setResults(null);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timeout = setTimeout(() => {
      searchFilesToInvoice(term).then((files) => {
        if (cancelled) return;
        setResults(files);
        setSearching(false);
      });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchInput]);

  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Facturar un file</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* 1. Buscar y elegir el file */}
          <Grid item xs={12} md={7}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>1. Buscá el pasajero y elegí el file</Typography>
            <TextField
              fullWidth
              size="small"
              autoFocus
              placeholder="Pasajero, número de file (ej. 55) o destino"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {searching ? <CircularProgress size={18} /> : <SearchIcon />}
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ mt: 2, maxHeight: 440, overflowY: "auto", pr: 1 }}>
              {results === null ? (
                <Typography variant="body2" color="text.secondary">
                  Escribí para buscar. Se factura el file entero, normalmente cuando el pasajero terminó de pagar.
                </Typography>
              ) : results.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No se encontraron files.
                </Typography>
              ) : (
                results.map((file) => {
                  const isSelected = selected?.id === file.id;
                  return (
                    <Paper
                      key={file.id}
                      variant="outlined"
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelected(file)}
                      onKeyDown={(e) => e.key === "Enter" && setSelected(file)}
                      sx={{
                        mb: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        borderColor: isSelected ? "#0D5B75" : undefined,
                        borderWidth: isSelected ? 2 : 1,
                        backgroundColor: isSelected ? "#e3f0f4" : undefined,
                        "&:hover, &:focus-visible": { backgroundColor: isSelected ? "#e3f0f4" : "#f2f8fa", outline: "none" },
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, color: "#0D5B75" }}>{fileLabel(file)}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {file.pasajeros.map((p) => `${p.firstname} ${p.lastname}`).join(", ") || "Sin pasajeros"} · sale el{" "}
                          {dayjs(file.fechaSalida).format("DD/MM/YYYY")}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        {file.moneda && (
                          <Typography sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{formatMoney(file.total, file.moneda)}</Typography>
                        )}
                        <FileStatus file={file} />
                      </Box>
                      {isSelected && <CheckCircleIcon sx={{ color: "#0D5B75" }} />}
                    </Paper>
                  );
                })
              )}
            </Box>
          </Grid>

          {/* 2. La factura */}
          <Grid item xs={12} md={5}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>2. Factura</Typography>
            {!selected ? (
              <Alert severity="info" icon={false}>
                Todavía no elegiste el file.
              </Alert>
            ) : (
              <>
                <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5, mb: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>{fileLabel(selected)}</Typography>
                  {selected.moneda && (
                    <Typography variant="body2" color="text.secondary">
                      Cobrado {formatMoney(selected.cobrado, selected.moneda)} de {formatMoney(selected.total, selected.moneda)}
                    </Typography>
                  )}
                </Paper>
                {selected.facturadoAt ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Ya está facturado desde el {dayjs(selected.facturadoAt).format("DD/MM/YYYY")}. Si guardás, se corrige esa factura.
                  </Alert>
                ) : (
                  selected.falta > 0 &&
                  selected.moneda && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      El pasajero todavía debe {formatMoney(selected.falta, selected.moneda)}. Se puede facturar igual.
                    </Alert>
                  )
                )}
                <InvoiceForm
                  // Un formulario nuevo por cada file elegido
                  key={selected.id}
                  fileId={selected.id}
                  initial={
                    selected.facturadoAt
                      ? {
                          fecha: selected.facturadoAt,
                          importe: selected.facturaImporte,
                          moneda: selected.facturaMoneda,
                          numero: selected.facturaNumero,
                        }
                      : { importe: selected.total || null, moneda: selected.moneda }
                  }
                  onCancel={onClose}
                  onSaved={onSaved}
                />
              </>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

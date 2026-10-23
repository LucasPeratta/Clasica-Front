import { useEffect, useState } from "react";
import {
  Alert,
  Box,
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
import { getCobranzasPage, iCobranza, iPaymentsSummary } from "../File/paymentsHandler";
import { PaymentForm } from "../File/profile/components/FilePayments";
import { formatMoney } from "../File/utils/totals";
import { formatFileNumber } from "../File/utils/fileNumber";

const fileLabel = (file: { numero?: number | null; anio?: number | null; destino: string }) =>
  [formatFileNumber(file), file.destino].filter(Boolean).join(" · ");

interface NewClientPaymentDialogProps {
  onClose: () => void;
  // El pago registrado (para ofrecer el recibo)
  onSaved: (fileId: string, pagoId: string | null) => void;
}

/**
 * Pago que trae un pasajero, sin entrar al file: se busca el pasajero (o número de file),
 * se elige el file y se carga el pago. Igual que "Nuevo pago a mayorista".
 */
export const NewClientPaymentDialog = ({ onClose, onSaved }: NewClientPaymentDialogProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState<iCobranza[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<iCobranza | null>(null);

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
      getCobranzasPage(1, term, "todos").then((page) => {
        if (cancelled) return;
        setResults(page.data);
        setSearching(false);
      });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchInput]);

  // Quién pagó, de entrada: el pasajero que se buscó (si coincide con alguno del file)
  const searchedPayer = (file: iCobranza) => {
    const terms = searchInput.trim().toLowerCase().split(/\s+/);
    return file.pasajeros.find((p) =>
      terms.every((t) => `${p.firstname} ${p.lastname}`.toLowerCase().includes(t))
    )?.id;
  };

  // El pago nuevo es el de número de recibo más alto
  const handleSaved = (file: iCobranza, data: iPaymentsSummary) => {
    const newest = [...data.pagos].sort((a, b) => (b.reciboNumero ?? 0) - (a.reciboNumero ?? 0))[0];
    onSaved(file.id, newest?.id ?? null);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Registrar pago recibido</DialogTitle>
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
                  Escribí para buscar. Aparecen los files que tienen algo pendiente de cobro.
                </Typography>
              ) : results.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No se encontraron files con saldo pendiente.
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
                      <Box sx={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <Typography sx={{ fontWeight: 700, color: file.estado === "VENCIDO" ? "error.main" : "text.primary" }}>
                          Falta {formatMoney(file.falta, file.moneda)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          de {formatMoney(file.total, file.moneda)}
                        </Typography>
                      </Box>
                      {isSelected && <CheckCircleIcon sx={{ color: "#0D5B75" }} />}
                    </Paper>
                  );
                })
              )}
            </Box>
          </Grid>

          {/* 2. El pago */}
          <Grid item xs={12} md={5}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>2. Pago</Typography>
            {!selected ? (
              <Alert severity="info" icon={false}>
                Todavía no elegiste el file.
              </Alert>
            ) : (
              <>
                <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5, mb: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>{fileLabel(selected)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cobrado {formatMoney(selected.cobrado, selected.moneda)} de {formatMoney(selected.total, selected.moneda)}
                    {selected.proximoVencimiento &&
                      ` · próximo: ${selected.proximoVencimiento.concepto} el ${dayjs(selected.proximoVencimiento.vencimiento).format("DD/MM/YYYY")}`}
                  </Typography>
                </Paper>
                <PaymentForm
                  // Un formulario nuevo por cada file elegido
                  key={selected.id}
                  fileId={selected.id}
                  chargeCurrency={selected.moneda}
                  pago={null}
                  suggestedAmount={selected.proximoVencimiento?.falta ?? selected.falta}
                  pasajeros={selected.pasajeros}
                  defaultPagadorId={searchedPayer(selected)}
                  onCancel={onClose}
                  onSaved={(data) => handleSaved(selected, data)}
                />
              </>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

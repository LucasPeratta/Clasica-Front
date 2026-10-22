import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { PaymentMethod } from "../File/paymentsHandler";
import { CURRENCIES, formatMoney } from "../File/utils/totals";
import { formatFileNumber } from "../File/utils/fileNumber";
import { addSupplierPayment, iFileToPay, iServiceToPay, searchServicesToPay } from "./mayoristasHandler";

const TYPE_LABEL: Record<string, string> = {
  AEREO: "✈️",
  HOTEL: "🏨",
  EXCURSION: "🎒",
  TRASLADO: "🚗",
};

// Servicio elegido para el pago, con cuánto se le paga
interface iSelected {
  service: iServiceToPay;
  fileLabel: string;
  importe: string;
}

const fileLabel = (file: { numero?: number | null; anio?: number | null; destino: string }) =>
  [formatFileNumber(file), file.destino].filter(Boolean).join(" · ");

interface NewSupplierPaymentDialogProps {
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Pago a un mayorista que se reparte entre servicios, aunque sean de distintos files:
 * se busca el pasajero (o número de file), se elige el file y se tildan los servicios.
 */
export const NewSupplierPaymentDialog = ({ onClose, onSaved }: NewSupplierPaymentDialogProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState<iFileToPay[] | null>(null);
  const [searching, setSearching] = useState(false);

  const [selected, setSelected] = useState<iSelected[]>([]);
  const [fecha, setFecha] = useState(dayjs().format("YYYY-MM-DD"));
  const [medio, setMedio] = useState<PaymentMethod>("TRANSFERENCIA");
  const [mayorista, setMayorista] = useState("");
  const [mayoristaEdited, setMayoristaEdited] = useState(false);
  const [nota, setNota] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      searchServicesToPay(term).then((files) => {
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

  // El mayorista se completa solo con los proveedores elegidos (hasta que se escriba a mano)
  useEffect(() => {
    if (mayoristaEdited) return;
    setMayorista([...new Set(selected.map((s) => s.service.provider.trim()))].join(" / "));
  }, [selected, mayoristaEdited]);

  const currency = selected[0]?.service.currency ?? null;
  const total = Math.round(selected.reduce((sum, s) => sum + (Number(s.importe) || 0), 0) * 100) / 100;
  const isSelected = (id: string) => selected.some((s) => s.service.id === id);

  const toggle = (service: iServiceToPay, file: iFileToPay) => {
    if (isSelected(service.id)) {
      setSelected((prev) => prev.filter((s) => s.service.id !== service.id));
    } else {
      setSelected((prev) => [...prev, { service, fileLabel: fileLabel(file), importe: String(service.falta) }]);
    }
  };

  const invalidAmount = selected.find((s) => !(Number(s.importe) > 0) || Number(s.importe) > s.service.falta + 0.01);
  const canSave = selected.length > 0 && !invalidAmount && fecha && mayorista.trim();

  const handleSave = async () => {
    setSaving(true);
    const msg = await addSupplierPayment({
      fecha: dayjs(fecha).hour(12).toISOString(),
      medio,
      mayorista: mayorista.trim(),
      nota,
      aplicaciones: selected.map((s) => ({ serviceId: s.service.id, importe: Number(s.importe) })),
    });
    setSaving(false);
    if (msg) setError(msg);
    else onSaved();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Nuevo pago a mayorista</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* 1. Buscar y elegir servicios */}
          <Grid item xs={12} md={7}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>1. Buscá el pasajero y elegí los servicios</Typography>
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

            <Box sx={{ mt: 2, maxHeight: 420, overflowY: "auto", pr: 1 }}>
              {results === null ? (
                <Typography variant="body2" color="text.secondary">
                  Escribí para buscar. Podés sumar servicios de varios pasajeros o files al mismo pago.
                </Typography>
              ) : results.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No se encontraron files.
                </Typography>
              ) : (
                results.map((file) => (
                  <Paper key={file.id} variant="outlined" sx={{ mb: 1.5, borderRadius: 2, overflow: "hidden" }}>
                    <Box sx={{ px: 1.5, py: 1, backgroundColor: "rgba(13, 91, 117, 0.06)" }}>
                      <Typography sx={{ fontWeight: 700, color: "#0D5B75" }}>{fileLabel(file)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {file.pasajero ? `${file.pasajero.lastname} ${file.pasajero.firstname} · ` : ""}
                        sale el {dayjs(file.fechaSalida).format("DD/MM/YYYY")}
                      </Typography>
                    </Box>
                    {file.services.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 1 }}>
                        Sin servicios.
                      </Typography>
                    ) : (
                      file.services.map((service) => {
                        const paid = service.falta <= 0;
                        const otherCurrency = currency !== null && service.currency !== currency;
                        const disabled = paid || (otherCurrency && !isSelected(service.id));
                        const row = (
                          <FormControlLabel
                            disabled={disabled}
                            sx={{ display: "flex", m: 0, px: 1, py: 0.25, "& .MuiFormControlLabel-label": { flex: 1 } }}
                            control={
                              <Checkbox size="small" checked={isSelected(service.id)} onChange={() => toggle(service, file)} />
                            }
                            label={
                              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "center" }}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {TYPE_LABEL[service.type]} {service.nombre || "Sin nombre"}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {service.provider} · neto {formatMoney(service.neto, service.currency)}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, whiteSpace: "nowrap", color: paid ? "success.main" : "text.primary" }}
                                >
                                  {paid ? "Pagado ✓" : `falta ${formatMoney(service.falta, service.currency)}`}
                                </Typography>
                              </Box>
                            }
                          />
                        );
                        return otherCurrency && !paid ? (
                          <Tooltip key={service.id} title="Un pago es en una sola moneda">
                            <span>{row}</span>
                          </Tooltip>
                        ) : (
                          <Box key={service.id}>{row}</Box>
                        );
                      })
                    )}
                  </Paper>
                ))
              )}
            </Box>
          </Grid>

          {/* 2. Lo que se paga */}
          <Grid item xs={12} md={5}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>2. Pago</Typography>
            {selected.length === 0 ? (
              <Alert severity="info" icon={false}>
                Todavía no elegiste servicios.
              </Alert>
            ) : (
              <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5 }}>
                {selected.map((s) => {
                  const tooMuch = Number(s.importe) > s.service.falta + 0.01;
                  return (
                    <Box key={s.service.id} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {TYPE_LABEL[s.service.type]} {s.service.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {s.fileLabel}
                        </Typography>
                      </Box>
                      <TextField
                        size="small"
                        type="number"
                        value={s.importe}
                        error={tooMuch}
                        helperText={tooMuch ? `máx. ${formatMoney(s.service.falta, s.service.currency)}` : undefined}
                        onChange={(e) =>
                          setSelected((prev) =>
                            prev.map((x) => (x.service.id === s.service.id ? { ...x, importe: e.target.value } : x))
                          )
                        }
                        sx={{ width: 140 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {CURRENCIES.find((c) => c.value === s.service.currency)?.symbol}
                            </InputAdornment>
                          ),
                        }}
                      />
                      <IconButton size="small" onClick={() => setSelected((prev) => prev.filter((x) => x.service.id !== s.service.id))}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 700 }}>Total del pago</Typography>
                  <Typography sx={{ fontWeight: 700, color: "#0D5B75" }}>{currency && formatMoney(total, currency)}</Typography>
                </Box>
              </Paper>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <TextField
                size="small"
                label="Mayorista"
                value={mayorista}
                onChange={(e) => {
                  setMayorista(e.target.value);
                  setMayoristaEdited(true);
                }}
                helperText={!mayoristaEdited && selected.length > 0 ? "Completado con el proveedor de los servicios" : undefined}
              />
              <TextField
                size="small"
                label="Fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <RadioGroup row value={medio} onChange={(e) => setMedio(e.target.value as PaymentMethod)}>
                <FormControlLabel value="TRANSFERENCIA" control={<Radio size="small" />} label="Transferencia" />
                <FormControlLabel value="EFECTIVO" control={<Radio size="small" />} label="Efectivo" />
              </RadioGroup>
              <TextField
                size="small"
                label="Nota (opcional)"
                placeholder="Ej: transferencia Galicia"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                inputProps={{ maxLength: 300 }}
              />
              {error && <Alert severity="error">{error}</Alert>}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave || saving}>
          {saving ? "Guardando..." : `Registrar pago${currency && total > 0 ? ` de ${formatMoney(total, currency)}` : ""}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

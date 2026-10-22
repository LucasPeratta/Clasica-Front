import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import FlightIcon from "@mui/icons-material/Flight";
import HotelIcon from "@mui/icons-material/Hotel";
import HikingIcon from "@mui/icons-material/Hiking";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import { iService, ServiceType } from "../../Service/model";
import { MayoristaField } from "../../Service/MayoristaField";
import { CURRENCIES, formatMoney } from "../utils/totals";

const TYPES: { value: ServiceType; label: string; icon: JSX.Element; example: string; from: string; to: string }[] = [
  { value: "AEREO", label: "Aéreo", icon: <FlightIcon />, example: "Ej. Aerolíneas Argentinas Buenos Aires – Madrid", from: "Fecha de ida", to: "Fecha de vuelta" },
  { value: "HOTEL", label: "Hotel", icon: <HotelIcon />, example: "Ej. Hotel Riu Plaza, habitación doble", from: "Entrada (check-in)", to: "Salida (check-out)" },
  { value: "EXCURSION", label: "Excursión", icon: <HikingIcon />, example: "Ej. Tour por Toledo día completo", from: "Desde", to: "Hasta" },
  { value: "TRASLADO", label: "Traslado", icon: <AirportShuttleIcon />, example: "Ej. Aeropuerto – hotel", from: "Desde", to: "Hasta" },
];

const toggleSx = {
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
  gap: 1,
  flex: 1,
  py: 1.25,
  "&.Mui-selected": { backgroundColor: "#0D5B75", color: "#fff", "&:hover": { backgroundColor: "#0a4a5e" } },
};

interface ServiceDialogProps {
  // Servicio a editar (o uno nuevo); null = cerrado
  service: iService | null;
  onClose: () => void;
  // Devuelve true si se guardó
  onSave: (service: iService) => Promise<boolean>;
}

/**
 * Ventana para agregar o editar un servicio del file
 */
export const ServiceDialog = ({ service, onClose, onSave }: ServiceDialogProps) => {
  const [draft, setDraft] = useState<iService | null>(service);
  const [triedSave, setTriedSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    setDraft(service);
    setTriedSave(false);
    setSaveError(false);
  }, [service]);

  if (!draft) return null;

  const isNew = !draft.id;
  const type = TYPES.find((t) => t.value === draft.type) ?? TYPES[0];
  const set = <K extends keyof iService>(field: K, value: iService[K]) => setDraft({ ...draft, [field]: value });
  const symbol = CURRENCIES.find((c) => c.value === draft.currency)?.symbol ?? "";

  const neto = Number(draft.precioNeto);
  const tarifa = Number(draft.tarifa);
  const showProfit = draft.precioNeto !== "" && draft.tarifa !== "" && !isNaN(neto) && !isNaN(tarifa);
  const missingProvider = !draft.provider?.trim();
  const badDates = !!draft.fechaInicio && !!draft.fechaFin && dayjs(draft.fechaFin).isBefore(dayjs(draft.fechaInicio), "day");

  const handleSave = async () => {
    setTriedSave(true);
    if (missingProvider || badDates) return;
    setSaving(true);
    setSaveError(false);
    const ok = await onSave({ ...draft, provider: draft.provider.trim() });
    setSaving(false);
    if (!ok) setSaveError(true);
  };

  return (
    <Dialog open onClose={() => !saving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.35rem" }}>{isNew ? "Agregar un servicio" : "Editar servicio"}</DialogTitle>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "8px !important" }}>
          {saveError && <Alert severity="error">No se pudo guardar el servicio. Intentá de nuevo.</Alert>}

          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>¿Qué es?</Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={draft.type}
              onChange={(_, value: ServiceType | null) => value && set("type", value)}
              sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}
            >
              {TYPES.map((t) => (
                <ToggleButton key={t.value} value={t.value} sx={toggleSx}>
                  {t.icon}
                  {t.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <TextField
            label="Descripción"
            placeholder={type.example}
            value={draft.nombre || ""}
            onChange={(e) => set("nombre", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <MayoristaField value={draft.provider || ""} onChange={(provider) => set("provider", provider)} showError={triedSave} />

          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Moneda</Typography>
            <ToggleButtonGroup exclusive fullWidth value={draft.currency} onChange={(_, value: string | null) => value && set("currency", value)}>
              {CURRENCIES.map((c) => (
                <ToggleButton key={c.value} value={c.value} sx={toggleSx}>
                  {c.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Costo (neto)"
                type="number"
                value={draft.precioNeto || ""}
                onChange={(e) => set("precioNeto", e.target.value)}
                helperText="Lo que le pagamos al mayorista"
                InputProps={{ startAdornment: <InputAdornment position="start">{symbol}</InputAdornment> }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Precio de venta (tarifa)"
                type="number"
                value={draft.tarifa || ""}
                onChange={(e) => set("tarifa", e.target.value)}
                helperText="Lo que paga el pasajero"
                InputProps={{ startAdornment: <InputAdornment position="start">{symbol}</InputAdornment> }}
                fullWidth
              />
            </Grid>
          </Grid>
          {showProfit && (
            <Typography sx={{ mt: -1, color: tarifa - neto < 0 ? "error.main" : "success.dark", fontWeight: 600 }}>
              Ganancia: {tarifa - neto < 0 ? "−" : ""}
              {formatMoney(Math.abs(tarifa - neto), draft.currency)}
            </Typography>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label={type.from}
                format="DD/MM/YYYY"
                value={draft.fechaInicio ? dayjs(draft.fechaInicio) : null}
                onChange={(value) => set("fechaInicio", value ?? null)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label={type.to}
                format="DD/MM/YYYY"
                value={draft.fechaFin ? dayjs(draft.fechaFin) : null}
                onChange={(value) => set("fechaFin", value ?? null)}
                minDate={draft.fechaInicio ? dayjs(draft.fechaInicio) : undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: badDates,
                    helperText: badDates ? "Es anterior a la primera fecha" : "Si es un solo día, dejala vacía",
                  },
                }}
              />
            </Grid>
          </Grid>

          <TextField
            label="Observaciones"
            value={draft.obs || ""}
            onChange={(e) => set("obs", e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
        </DialogContent>
      </LocalizationProvider>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none", fontSize: "1rem" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{ textTransform: "none", fontSize: "1rem", fontWeight: 700, px: 3, backgroundColor: "#0D5B75", "&:hover": { backgroundColor: "#0a4a5e" } }}
        >
          {saving ? "Guardando..." : isNew ? "Agregar servicio" : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

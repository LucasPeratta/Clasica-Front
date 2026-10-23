import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import { ServiceType } from "../../Service/model";
import { MayoristaField } from "../../Service/MayoristaField";
import { CURRENCIES, formatMoney } from "../../File/utils/totals";
import { defaultLiquidationDate } from "../../File/utils/liquidation";
import { addGrupoServicio, updateGrupoServicio } from "../handler";
import { iGrupoServicio } from "../model";

const TYPES: { value: ServiceType; label: string; icon: JSX.Element }[] = [
  { value: "AEREO", label: "Aéreo", icon: <FlightIcon /> },
  { value: "HOTEL", label: "Hotel", icon: <HotelIcon /> },
  { value: "EXCURSION", label: "Excursión", icon: <HikingIcon /> },
  { value: "TRASLADO", label: "Traslado", icon: <AirportShuttleIcon /> },
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

interface GrupoServicioDialogProps {
  grupoId: string;
  fechaSalida: string;
  // Cuántas reservas tiene el grupo (para ofrecer sumarles el servicio nuevo)
  reservas: number;
  servicio?: iGrupoServicio;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Servicio del itinerario del grupo con su precio de lista por pasajero
 */
export const GrupoServicioDialog = ({ grupoId, fechaSalida, reservas, servicio, onClose, onSaved }: GrupoServicioDialogProps) => {
  const [type, setType] = useState<ServiceType>(servicio?.type ?? "HOTEL");
  const [nombre, setNombre] = useState(servicio?.nombre ?? "");
  const [provider, setProvider] = useState(servicio?.provider ?? "");
  const [currency, setCurrency] = useState(servicio?.currency ?? "USD");
  const [neto, setNeto] = useState(servicio ? String(servicio.netoPorPax) : "");
  const [tarifa, setTarifa] = useState(servicio ? String(servicio.tarifaPorPax) : "");
  const [desde, setDesde] = useState<dayjs.Dayjs | null>(servicio?.fechaInicio ? dayjs(servicio.fechaInicio) : null);
  const [hasta, setHasta] = useState<dayjs.Dayjs | null>(servicio?.fechaFin ? dayjs(servicio.fechaFin) : null);
  const [liquidacion, setLiquidacion] = useState<dayjs.Dayjs | null>(servicio?.fechaLiquidacion ? dayjs(servicio.fechaLiquidacion) : null);
  const [aplicar, setAplicar] = useState(true);
  const [triedSave, setTriedSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? "";
  const ganancia = (Number(tarifa) || 0) - (Number(neto) || 0);

  const handleSave = async () => {
    setTriedSave(true);
    if (!provider.trim()) return;
    setSaving(true);
    setError(null);
    const input = {
      type,
      nombre: nombre.trim(),
      provider: provider.trim(),
      currency,
      netoPorPax: Number(neto) || 0,
      tarifaPorPax: Number(tarifa) || 0,
      fechaInicio: desde ? desde.hour(12).toISOString() : null,
      fechaFin: hasta ? hasta.hour(12).toISOString() : null,
      fechaLiquidacion: type !== "AEREO" && liquidacion ? liquidacion.hour(12).toISOString() : null,
      aplicarAReservas: !servicio && reservas > 0 && aplicar,
    };
    const result = servicio ? await updateGrupoServicio(grupoId, servicio.id, input) : await addGrupoServicio(grupoId, input);
    setSaving(false);
    if (result.ok) onSaved();
    else setError(result.msg);
  };

  return (
    <Dialog open onClose={() => !saving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.35rem" }}>{servicio ? "Editar servicio del grupo" : "Agregar un servicio al grupo"}</DialogTitle>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "8px !important" }}>
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>¿Qué es?</Typography>
            <ToggleButtonGroup exclusive fullWidth value={type} onChange={(_, v: ServiceType | null) => v && setType(v)} sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}>
              {TYPES.map((t) => (
                <ToggleButton key={t.value} value={t.value} sx={toggleSx}>
                  {t.icon}
                  {t.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <TextField label="Descripción" placeholder="Ej. Hotel en Roma 4 noches" value={nombre} onChange={(e) => setNombre(e.target.value)} fullWidth />
          <MayoristaField value={provider} onChange={setProvider} showError={triedSave} />
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Moneda</Typography>
            <ToggleButtonGroup exclusive fullWidth value={currency} onChange={(_, v: string | null) => v && setCurrency(v)}>
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
                label="Costo por pasajero (neto)"
                type="number"
                value={neto}
                onChange={(e) => setNeto(e.target.value)}
                helperText="Lo que le pagamos al mayorista por cada pasajero"
                InputProps={{ startAdornment: <InputAdornment position="start">{symbol}</InputAdornment> }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Precio de lista por pasajero"
                type="number"
                value={tarifa}
                onChange={(e) => setTarifa(e.target.value)}
                helperText="Lo que paga cada pasajero (en cada reserva se puede cambiar)"
                InputProps={{ startAdornment: <InputAdornment position="start">{symbol}</InputAdornment> }}
                fullWidth
              />
            </Grid>
          </Grid>
          {neto !== "" && tarifa !== "" && (
            <Typography sx={{ mt: -1, fontWeight: 600, color: ganancia < 0 ? "error.main" : "success.dark" }}>
              Ganancia por pasajero: {formatMoney(ganancia, currency)}
            </Typography>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker label="Desde" format="DD/MM/YYYY" value={desde} onChange={setDesde} slotProps={{ textField: { fullWidth: true } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker label="Hasta" format="DD/MM/YYYY" value={hasta} minDate={desde ?? undefined} onChange={setHasta} slotProps={{ textField: { fullWidth: true } }} />
            </Grid>
          </Grid>
          {type === "AEREO" ? (
            <Alert severity="info" icon={false}>
              Los aéreos no se liquidan: se le pagan al mayorista al momento de la emisión.
            </Alert>
          ) : (
            <DatePicker
              label="Fecha para liquidar"
              format="DD/MM/YYYY"
              value={liquidacion ?? defaultLiquidationDate(fechaSalida)}
              onChange={setLiquidacion}
              slotProps={{ textField: { fullWidth: true, helperText: liquidacion ? "Elegida a mano" : "Por defecto, 1 mes antes de la salida del grupo" } }}
            />
          )}
          {!servicio && reservas > 0 && (
            <FormControlLabel
              control={<Checkbox checked={aplicar} onChange={(e) => setAplicar(e.target.checked)} />}
              label={`Agregarlo también a las ${reservas === 1 ? "la reserva que ya existe" : `${reservas} reservas que ya existen`} (con el precio de lista)`}
            />
          )}
          {servicio && (
            <Typography variant="body2" color="text.secondary">
              El precio de lista es para las reservas nuevas. El nombre, el mayorista y las fechas se actualizan también en las reservas que ya lo tienen.
            </Typography>
          )}
          {error && <Alert severity="error">{error}</Alert>}
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
          {saving ? "Guardando..." : servicio ? "Guardar cambios" : "Agregar servicio"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

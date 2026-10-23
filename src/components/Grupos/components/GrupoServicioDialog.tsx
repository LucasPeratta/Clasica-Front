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
import { HabitacionTipo, iGrupoServicio, ModoPrecio, ROOM_TYPES } from "../model";

const TYPES: { value: ServiceType; label: string; icon: JSX.Element }[] = [
  { value: "AEREO", label: "Aéreo", icon: <FlightIcon /> },
  { value: "HOTEL", label: "Hotel", icon: <HotelIcon /> },
  { value: "EXCURSION", label: "Excursión", icon: <HikingIcon /> },
  { value: "TRASLADO", label: "Traslado", icon: <AirportShuttleIcon /> },
];

const MODES: { value: ModoPrecio; label: string; help: string }[] = [
  { value: "POR_PASAJERO", label: "Por pasajero", help: "Cada pasajero paga lo mismo (los menores pueden pagar menos)." },
  { value: "POR_RESERVA", label: "Por reserva", help: "Un precio para toda la reserva, sean 2 o 4 (ej. un auto por familia)." },
  { value: "POR_HABITACION", label: "Según la habitación", help: "Precio por persona según la habitación de la reserva (ej. hoteles)." },
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

const str = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));

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
 * Servicio del itinerario del grupo con su precio de lista: por pasajero (con precio de menores),
 * por reserva o según el tipo de habitación
 */
export const GrupoServicioDialog = ({ grupoId, fechaSalida, reservas, servicio, onClose, onSaved }: GrupoServicioDialogProps) => {
  const [type, setType] = useState<ServiceType>(servicio?.type ?? "HOTEL");
  const [nombre, setNombre] = useState(servicio?.nombre ?? "");
  const [provider, setProvider] = useState(servicio?.provider ?? "");
  const [currency, setCurrency] = useState(servicio?.currency ?? "USD");
  const [modo, setModo] = useState<ModoPrecio>(servicio?.modoPrecio ?? "POR_PASAJERO");
  const [neto, setNeto] = useState(str(servicio?.netoPorPax));
  const [tarifa, setTarifa] = useState(str(servicio?.tarifaPorPax));
  const [menores, setMenores] = useState(servicio?.edadMenor !== null && servicio?.edadMenor !== undefined);
  const [edadMenor, setEdadMenor] = useState(str(servicio?.edadMenor ?? 10));
  const [netoMenor, setNetoMenor] = useState(str(servicio?.netoMenor));
  const [tarifaMenor, setTarifaMenor] = useState(str(servicio?.tarifaMenor));
  const [rooms, setRooms] = useState<Record<HabitacionTipo, { neto: string; tarifa: string }>>(
    () =>
      Object.fromEntries(
        ROOM_TYPES.map((r) => [r.value, { neto: str(servicio?.preciosHabitacion?.[r.value]?.neto), tarifa: str(servicio?.preciosHabitacion?.[r.value]?.tarifa) }])
      ) as Record<HabitacionTipo, { neto: string; tarifa: string }>
  );
  const [desde, setDesde] = useState<dayjs.Dayjs | null>(servicio?.fechaInicio ? dayjs(servicio.fechaInicio) : null);
  const [hasta, setHasta] = useState<dayjs.Dayjs | null>(servicio?.fechaFin ? dayjs(servicio.fechaFin) : null);
  const [liquidacion, setLiquidacion] = useState<dayjs.Dayjs | null>(servicio?.fechaLiquidacion ? dayjs(servicio.fechaLiquidacion) : null);
  const [aplicar, setAplicar] = useState(true);
  const [triedSave, setTriedSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? "";
  const money = (label: string, value: string, onChange: (v: string) => void, helperText?: string) => (
    <TextField
      label={label}
      type="number"
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      helperText={helperText}
      InputProps={{ startAdornment: <InputAdornment position="start">{symbol}</InputAdornment> }}
      fullWidth
    />
  );
  const ganancia = (Number(tarifa) || 0) - (Number(neto) || 0);

  const handleSave = async () => {
    setTriedSave(true);
    if (!provider.trim()) return;
    setSaving(true);
    setError(null);
    const roomPrices = Object.fromEntries(
      ROOM_TYPES.filter((r) => rooms[r.value].tarifa !== "").map((r) => [r.value, { neto: Number(rooms[r.value].neto) || 0, tarifa: Number(rooms[r.value].tarifa) }])
    );
    // Precio "de lista" de referencia: el de una doble (o el primero cargado) cuando es según la habitación
    const reference = modo === "POR_HABITACION" ? roomPrices.DOBLE ?? Object.values(roomPrices)[0] : null;
    const input = {
      type,
      nombre: nombre.trim(),
      provider: provider.trim(),
      currency,
      modoPrecio: modo,
      netoPorPax: reference ? reference.neto : Number(neto) || 0,
      tarifaPorPax: reference ? reference.tarifa : Number(tarifa) || 0,
      edadMenor: modo === "POR_PASAJERO" && menores ? Number(edadMenor) : null,
      netoMenor: modo === "POR_PASAJERO" && menores ? Number(netoMenor) || 0 : null,
      tarifaMenor: modo === "POR_PASAJERO" && menores ? Number(tarifaMenor) || 0 : null,
      preciosHabitacion: modo === "POR_HABITACION" ? roomPrices : null,
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
          <TextField label="Descripción" placeholder="Ej. Hotel en Orlando 9 noches" value={nombre} onChange={(e) => setNombre(e.target.value)} fullWidth />
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

          {/* Cómo se cobra */}
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>¿Cómo se cobra?</Typography>
            <ToggleButtonGroup exclusive fullWidth value={modo} onChange={(_, v: ModoPrecio | null) => v && setModo(v)} sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}>
              {MODES.map((m) => (
                <ToggleButton key={m.value} value={m.value} sx={toggleSx}>
                  {m.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {MODES.find((m) => m.value === modo)?.help}
            </Typography>
          </Box>

          {modo === "POR_HABITACION" ? (
            <Box>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>Precio por persona según la habitación</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {ROOM_TYPES.map((r) => (
                  <Box key={r.value} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Typography sx={{ width: 90, fontWeight: 600 }}>{r.label}</Typography>
                    {money("Costo por persona", rooms[r.value].neto, (v) => setRooms((prev) => ({ ...prev, [r.value]: { ...prev[r.value], neto: v } })))}
                    {money("Precio por persona", rooms[r.value].tarifa, (v) => setRooms((prev) => ({ ...prev, [r.value]: { ...prev[r.value], tarifa: v } })))}
                  </Box>
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Dejá vacías las habitaciones que no se usan.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {money(
                    modo === "POR_RESERVA" ? "Costo por reserva (neto)" : "Costo por pasajero (neto)",
                    neto,
                    setNeto,
                    "Lo que le pagamos al mayorista"
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  {money(modo === "POR_RESERVA" ? "Precio por reserva" : "Precio de lista por pasajero", tarifa, setTarifa, "En cada reserva se puede cambiar")}
                </Grid>
              </Grid>
              {neto !== "" && tarifa !== "" && (
                <Typography sx={{ mt: -1, fontWeight: 600, color: ganancia < 0 ? "error.main" : "success.dark" }}>
                  Ganancia {modo === "POR_RESERVA" ? "por reserva" : "por pasajero"}: {formatMoney(ganancia, currency)}
                </Typography>
              )}
              {modo === "POR_PASAJERO" && (
                <Box>
                  <FormControlLabel
                    control={<Checkbox checked={menores} onChange={(e) => setMenores(e.target.checked)} />}
                    label="Los menores pagan distinto"
                  />
                  {menores && (
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Menores de (años)"
                          type="number"
                          size="small"
                          value={edadMenor}
                          onChange={(e) => setEdadMenor(e.target.value)}
                          helperText="Edad al salir de viaje"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        {money("Costo menor", netoMenor, setNetoMenor)}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        {money("Precio menor", tarifaMenor, setTarifaMenor)}
                      </Grid>
                    </Grid>
                  )}
                </Box>
              )}
            </>
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
              label={`Agregarlo también a ${reservas === 1 ? "la reserva que ya existe" : `las ${reservas} reservas que ya existen`} (con el precio de lista)`}
            />
          )}
          {servicio && (
            <Typography variant="body2" color="text.secondary">
              Los precios son para las reservas nuevas. El nombre, el mayorista y las fechas se actualizan también en las reservas que ya lo tienen.
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

import { useState } from "react";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { createGrupo, iGrupoInput, updateGrupo } from "../handler";

interface GrupoDialogProps {
  // Al editar, la salida; al crear, nada
  grupo?: {
    id: string;
    titulo: string;
    destino: string;
    fechaSalida: string;
    fechaRegreso: string | null;
    cupo: number | null;
    visaUsa: boolean;
    obs: string | null;
  };
  onClose: () => void;
  // Devuelve el id (al crear)
  onSaved: (id: string) => void;
}

/**
 * Crear o editar una salida grupal: nombre, destino, fechas y cupo
 */
export const GrupoDialog = ({ grupo, onClose, onSaved }: GrupoDialogProps) => {
  const [titulo, setTitulo] = useState(grupo?.titulo ?? "");
  const [destino, setDestino] = useState(grupo?.destino ?? "");
  const [salida, setSalida] = useState<dayjs.Dayjs | null>(grupo ? dayjs(grupo.fechaSalida) : null);
  const [regreso, setRegreso] = useState<dayjs.Dayjs | null>(grupo?.fechaRegreso ? dayjs(grupo.fechaRegreso) : null);
  const [cupo, setCupo] = useState(grupo?.cupo ? String(grupo.cupo) : "");
  const [obs, setObs] = useState(grupo?.obs ?? "");
  const [visaUsa, setVisaUsa] = useState(grupo?.visaUsa ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const input: iGrupoInput = {
      titulo: titulo.trim(),
      destino: destino.trim(),
      fechaSalida: salida ? salida.hour(12).toISOString() : "",
      fechaRegreso: regreso ? regreso.hour(12).toISOString() : null,
      cupo: cupo ? Number(cupo) : null,
      visaUsa,
      obs,
    };
    const result = grupo ? await updateGrupo(grupo.id, input) : await createGrupo(input);
    setSaving(false);
    if (result.ok) onSaved(result.id ?? grupo?.id ?? "");
    else setError(result.msg);
  };

  return (
    <Dialog open onClose={() => !saving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.35rem" }}>{grupo ? "Editar salida grupal" : "Crear salida grupal"}</DialogTitle>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <DialogContent sx={{ pt: "8px !important" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nombre de la salida *"
                placeholder="Ej. Europa Septiembre 2027"
                autoFocus
                fullWidth
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Destino *" placeholder="Ej. Madrid, París y Roma" fullWidth value={destino} onChange={(e) => setDestino(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker label="Salida *" format="DD/MM/YYYY" value={salida} onChange={setSalida} slotProps={{ textField: { fullWidth: true } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Regreso"
                format="DD/MM/YYYY"
                value={regreso}
                minDate={salida ?? undefined}
                onChange={setRegreso}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cupo (lugares)"
                type="number"
                fullWidth
                value={cupo}
                onChange={(e) => setCupo(e.target.value)}
                helperText="Cuántos pasajeros entran. Vacío = sin límite"
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                control={<Checkbox checked={visaUsa} onChange={(e) => setVisaUsa(e.target.checked)} />}
                label="Viaja a EE.UU. (pedir visa)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Observaciones" fullWidth multiline rows={2} value={obs} onChange={(e) => setObs(e.target.value)} />
            </Grid>
          </Grid>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
      </LocalizationProvider>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none", fontSize: "1rem" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !titulo.trim() || !destino.trim() || !salida}
          sx={{ textTransform: "none", fontSize: "1rem", fontWeight: 700, px: 3, backgroundColor: "#0D5B75", "&:hover": { backgroundColor: "#0a4a5e" } }}
        >
          {saving ? "Guardando..." : grupo ? "Guardar cambios" : "Crear salida"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

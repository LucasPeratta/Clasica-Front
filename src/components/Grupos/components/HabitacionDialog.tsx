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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { addHabitacion, updateHabitacion } from "../handler";
import { HabitacionTipo, iGrupo, iHabitacion, ROOM_TYPES } from "../model";

const toggleSx = {
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
  flex: 1,
  py: 1.25,
  "&.Mui-selected": { backgroundColor: "#0D5B75", color: "#fff", "&:hover": { backgroundColor: "#0a4a5e" } },
};

// Cuántos pasajeros lleva cada tipo de habitación
const roomSize = (tipo: HabitacionTipo) => ROOM_TYPES.find((t) => t.value === tipo)?.size ?? 1;

interface HabitacionDialogProps {
  grupo: iGrupo;
  habitacion?: iHabitacion;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Agregar (o cambiar) una habitación del rooming: el tipo y quiénes duermen ahí
 */
export const HabitacionDialog = ({ grupo, habitacion, onClose, onSaved }: HabitacionDialogProps) => {
  const [tipo, setTipo] = useState<HabitacionTipo>(habitacion?.tipo ?? "DOBLE");
  const [selected, setSelected] = useState<string[]>(habitacion?.pasajeros.map((p) => p.id) ?? []);
  const [obs, setObs] = useState(habitacion?.obs ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const size = roomSize(tipo);
  // Los que todavía no tienen habitación (y, al editar, los de esta)
  const available = grupo.pasajeros.filter((p) => grupo.sinHabitacion.some((s) => s.id === p.id) || habitacion?.pasajeros.some((h) => h.id === p.id));

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < size ? [...prev, id] : prev));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const input = { tipo, paxIds: selected, obs };
    const result = habitacion ? await updateHabitacion(grupo.id, habitacion.id, input) : await addHabitacion(grupo.id, input);
    setSaving(false);
    if (result.ok) onSaved();
    else setError(result.msg);
  };

  return (
    <Dialog open onClose={() => !saving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.35rem" }}>{habitacion ? "Cambiar habitación" : "Agregar una habitación"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
        <Box>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>Tipo de habitación</Typography>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={tipo}
            onChange={(_, v: HabitacionTipo | null) => {
              if (!v) return;
              setTipo(v);
              // Si achica la habitación, quedan los primeros que entran
              setSelected((prev) => prev.slice(0, roomSize(v)));
            }}
            sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}
          >
            {ROOM_TYPES.map((t) => (
              <ToggleButton key={t.value} value={t.value} sx={toggleSx}>
                {t.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 600 }}>
            Elegí {size === 1 ? "el pasajero" : `los ${size} pasajeros`} ({selected.length} de {size})
          </Typography>
          {available.length === 0 ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              Todos los pasajeros del grupo ya tienen habitación.
            </Alert>
          ) : (
            <Box sx={{ border: "1px solid #e0e7ea", borderRadius: 2, maxHeight: 320, overflow: "auto", mt: 1 }}>
              {available.map((p) => {
                const checked = selected.includes(p.id);
                const disabled = !checked && selected.length >= size;
                return (
                  <Box
                    key={p.id}
                    role="checkbox"
                    aria-checked={checked}
                    tabIndex={0}
                    onClick={() => !disabled && toggle(p.id)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !disabled && (e.preventDefault(), toggle(p.id))}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.5,
                      py: 0.75,
                      cursor: disabled ? "default" : "pointer",
                      opacity: disabled ? 0.5 : 1,
                      borderBottom: "1px solid #eef2f4",
                      "&:last-of-type": { borderBottom: "none" },
                      backgroundColor: checked ? "#e3f0f4" : undefined,
                      "&:hover, &:focus-visible": { backgroundColor: disabled ? undefined : "#f2f8fa", outline: "none" },
                    }}
                  >
                    <Checkbox checked={checked} disabled={disabled} tabIndex={-1} sx={{ p: 0.5 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        {p.lastname}, {p.firstname}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reserva {p.reserva}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <TextField label="Observaciones (opcional)" placeholder="Ej. cama matrimonial, piso bajo" value={obs} onChange={(e) => setObs(e.target.value)} inputProps={{ maxLength: 200 }} />
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none", fontSize: "1rem" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || selected.length !== size}
          sx={{ textTransform: "none", fontSize: "1rem", fontWeight: 700, px: 3, backgroundColor: "#0D5B75", "&:hover": { backgroundColor: "#0a4a5e" } }}
        >
          {saving ? "Guardando..." : habitacion ? "Guardar cambios" : "Agregar habitación"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

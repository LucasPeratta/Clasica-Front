import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import { updateReserva } from "../handler";
import { ROOM_TYPES } from "../model";

interface ReservaEditDialogProps {
  grupo: { id: string; titulo: string; planes: { id: string; nombre: string }[] };
  fileId: string;
  nombre: string;
  planId: string | null;
  habitacionTipo: string | null;
  onClose: () => void;
  onSaved: (changes: { nombre: string; planId: string | null; habitacionTipo: string | null }) => void;
}

/**
 * Cambiar el nombre de una reserva de grupo y su plan de pagos
 */
export const ReservaEditDialog = ({ grupo, fileId, nombre: initialName, planId: initialPlan, habitacionTipo: initialRoom, onClose, onSaved }: ReservaEditDialogProps) => {
  const [habitacion, setHabitacion] = useState(initialRoom ?? "");
  const [nombre, setNombre] = useState(initialName);
  const [planId, setPlanId] = useState(initialPlan ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    const changes = { nombre: nombre.trim(), planId: planId || null, habitacionTipo: habitacion || null };
    const result = await updateReserva(grupo.id, fileId, changes);
    setSaving(false);
    if (result.ok) onSaved(changes);
    else setError(result.msg);
  };

  return (
    <Dialog open onClose={() => !saving && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Editar reserva</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
        <TextField label="Nombre de la reserva" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
        <TextField
          select
          label="Plan de pagos"
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
          helperText="Las fechas y salida las maneja el grupo"
        >
          <MenuItem value="">Automático (seña = aéreos, saldo 25 días antes)</MenuItem>
          {grupo.planes.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.nombre}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Habitación"
          value={habitacion}
          onChange={(e) => setHabitacion(e.target.value)}
          helperText="Si cambia y el hotel se cobra según la habitación, corregí su precio en Servicios"
        >
          <MenuItem value="">Sin definir</MenuItem>
          {ROOM_TYPES.map((r) => (
            <MenuItem key={r.value} value={r.value}>
              {r.label}
            </MenuItem>
          ))}
        </TextField>
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !nombre.trim()}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

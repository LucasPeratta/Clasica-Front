import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import { addPlan, updatePlan } from "../handler";
import { iGrupoPlan } from "../model";

interface Row {
  concepto: string;
  porcentaje: string;
  vencimiento: string;
}

const toInput = (date: string | Date) => dayjs(date).format("YYYY-MM-DD");

interface GrupoPlanDialogProps {
  grupoId: string;
  fechaSalida: string;
  plan?: iGrupoPlan;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Plan de pagos del grupo (ej. "Preventa"): cuotas en porcentaje con su fecha; la última es el saldo.
 * Se aplica a cada reserva sobre su total, en cada moneda.
 */
export const GrupoPlanDialog = ({ grupoId, fechaSalida, plan, onClose, onSaved }: GrupoPlanDialogProps) => {
  const [nombre, setNombre] = useState(plan?.nombre ?? "");
  const [rows, setRows] = useState<Row[]>(
    plan
      ? plan.cuotas.map((c) => ({ concepto: c.concepto, porcentaje: c.porcentaje === null ? "" : String(c.porcentaje), vencimiento: toInput(c.vencimiento) }))
      : [
          { concepto: "Seña", porcentaje: "30", vencimiento: toInput(new Date()) },
          { concepto: "Saldo", porcentaje: "", vencimiento: toInput(dayjs(fechaSalida).subtract(45, "day").toDate()) },
        ]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (i: number, field: keyof Row, value: string) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [field]: value } : r)));
  const sum = rows.slice(0, -1).reduce((acc, r) => acc + (Number(r.porcentaje) || 0), 0);
  const saldo = Math.round((100 - sum) * 100) / 100;

  const addRow = () =>
    setRows((prev) => [
      ...prev.slice(0, -1),
      { concepto: `Cuota ${prev.length}`, porcentaje: "", vencimiento: prev[prev.length - 1].vencimiento },
      prev[prev.length - 1],
    ]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const input = {
      nombre: nombre.trim(),
      cuotas: rows.map((r, i) => ({
        concepto: r.concepto.trim(),
        porcentaje: i === rows.length - 1 ? null : Number(r.porcentaje),
        vencimiento: dayjs(r.vencimiento).hour(12).toISOString(),
      })),
    };
    const result = plan ? await updatePlan(grupoId, plan.id, input) : await addPlan(grupoId, input);
    setSaving(false);
    if (result.ok) onSaved();
    else setError(result.msg);
  };

  return (
    <Dialog open onClose={() => !saving && onClose()} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.35rem" }}>{plan ? "Editar plan de pagos" : "Crear un plan de pagos"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
        <TextField label="Nombre del plan" placeholder="Ej. Preventa" value={nombre} onChange={(e) => setNombre(e.target.value)} sx={{ maxWidth: 360 }} />
        <Typography variant="body2" color="text.secondary">
          Cada cuota es un porcentaje del total de la reserva, con su fecha. La última es el saldo: lo que falte. Si la reserva tiene
          partes en dólares y en pesos, el plan se aplica a cada una.
        </Typography>

        {rows.map((row, i) => {
          const isLast = i === rows.length - 1;
          return (
            <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <TextField size="small" label="Concepto" value={row.concepto} onChange={(e) => update(i, "concepto", e.target.value)} sx={{ flex: 2, minWidth: 160 }} />
              {isLast ? (
                <TextField size="small" label="Porcentaje" value={`${saldo}% (el saldo)`} disabled sx={{ flex: 1, minWidth: 140 }} />
              ) : (
                <TextField
                  size="small"
                  label="Porcentaje"
                  type="number"
                  value={row.porcentaje}
                  onChange={(e) => update(i, "porcentaje", e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  sx={{ flex: 1, minWidth: 140 }}
                />
              )}
              <TextField
                size="small"
                label="Vence"
                type="date"
                value={row.vencimiento}
                onChange={(e) => update(i, "vencimiento", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1, minWidth: 150 }}
              />
              <Tooltip title={isLast ? "El saldo no se puede quitar" : "Quitar cuota"}>
                <span>
                  <IconButton color="error" disabled={isLast} onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}>
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        })}
        <Button startIcon={<AddIcon />} onClick={addRow} sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}>
          Agregar cuota
        </Button>
        {saldo <= 0 && <Alert severity="warning">Los porcentajes suman {sum}%: el saldo quedaría en cero o negativo.</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none", fontSize: "1rem" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !nombre.trim() || saldo <= 0}
          sx={{ textTransform: "none", fontSize: "1rem", fontWeight: 700, px: 3, backgroundColor: "#0D5B75", "&:hover": { backgroundColor: "#0a4a5e" } }}
        >
          {saving ? "Guardando..." : "Guardar plan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

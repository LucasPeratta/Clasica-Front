import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { iPax } from "../../Pax/model";
import { AddPaxDialog } from "../../File/components/AddPaxDialog";
import { CURRENCIES, formatMoney } from "../../File/utils/totals";
import { addReserva } from "../handler";
import { iGrupo } from "../model";

const symbol = (currency: string) => CURRENCIES.find((c) => c.value === currency)?.symbol ?? currency;
const round2 = (n: number) => Math.round(n * 100) / 100;

// Precio de una línea: si no se tocó, sigue al precio de lista x pasajeros
interface Line {
  neto: string;
  tarifa: string;
  edited: boolean;
}

interface NewReservaDialogProps {
  grupo: iGrupo;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Agregar una reserva al grupo (una familia, una pareja...): sus pasajeros, el plan de pagos y el
 * precio de cada servicio (viene con el de lista y se cambia, ej. si reservó en preventa)
 */
export const NewReservaDialog = ({ grupo, onClose, onSaved }: NewReservaDialogProps) => {
  const [pax, setPax] = useState<iPax[]>([]);
  const [choosingPax, setChoosingPax] = useState(false);
  const [nombre, setNombre] = useState("");
  const [nombreEdited, setNombreEdited] = useState(false);
  const [planId, setPlanId] = useState(grupo.planes.length === 1 ? grupo.planes[0].id : "");
  const [lines, setLines] = useState<Record<string, Line>>(() =>
    Object.fromEntries(grupo.servicios.map((s) => [s.id, { neto: "0", tarifa: "0", edited: false }]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Con cada cambio de pasajeros: el nombre ("Montero x2") y los precios que no se tocaron
  const updatePax = (next: iPax[]) => {
    setPax(next);
    if (!nombreEdited) setNombre(next.length > 0 ? `${next[0].lastname} x${next.length}` : "");
    setLines((prev) =>
      Object.fromEntries(
        grupo.servicios.map((s) => {
          const line = prev[s.id];
          return [
            s.id,
            line?.edited
              ? line
              : { neto: String(round2(s.netoPorPax * next.length)), tarifa: String(round2(s.tarifaPorPax * next.length)), edited: false },
          ];
        })
      )
    );
  };

  const setLine = (id: string, field: "neto" | "tarifa", value: string) =>
    setLines((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value, edited: true } }));

  // Totales por moneda
  const totals = new Map<string, { neto: number; tarifa: number }>();
  for (const s of grupo.servicios) {
    const t = totals.get(s.currency) ?? { neto: 0, tarifa: 0 };
    t.neto += Number(lines[s.id]?.neto) || 0;
    t.tarifa += Number(lines[s.id]?.tarifa) || 0;
    totals.set(s.currency, t);
  }

  const libres = grupo.resumen.lugaresLibres;
  const overCupo = libres !== null && pax.length > libres;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const result = await addReserva(grupo.id, {
      nombre: nombre.trim(),
      paxIds: pax.map((p) => p.id),
      planId: planId || null,
      lineas: grupo.servicios.map((s) => ({
        grupoServicioId: s.id,
        neto: Number(lines[s.id]?.neto) || 0,
        tarifa: Number(lines[s.id]?.tarifa) || 0,
      })),
    });
    setSaving(false);
    if (result.ok) onSaved();
    else setError(result.msg);
  };

  return (
    <Dialog open onClose={() => !saving && onClose()} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.35rem" }}>Agregar una reserva</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "8px !important" }}>
        {/* 1. Pasajeros */}
        <Box>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>1. ¿Quiénes viajan juntos?</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
            {pax.map((p) => (
              <Chip
                key={p.id}
                label={`${p.firstname} ${p.lastname}`}
                onDelete={() => updatePax(pax.filter((x) => x.id !== p.id))}
                sx={{ fontWeight: 600, backgroundColor: "#e3f0f4" }}
              />
            ))}
            <Button startIcon={<PersonAddIcon />} variant="outlined" onClick={() => setChoosingPax(true)} sx={{ textTransform: "none", fontWeight: 600 }}>
              {pax.length === 0 ? "Elegir pasajeros" : "Sumar otro"}
            </Button>
          </Box>
          {overCupo && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Quedan {libres} lugar{libres === 1 ? "" : "es"} en el cupo y esta reserva tiene {pax.length} pasajeros.
            </Alert>
          )}
        </Box>

        {/* 2. Nombre y plan */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Nombre de la reserva"
            placeholder="Ej. Montero x2"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setNombreEdited(true);
            }}
            helperText="Se arma solo con el apellido y la cantidad; lo podés cambiar"
            sx={{ flex: 1, minWidth: 240 }}
          />
          <TextField
            select
            label="Plan de pagos"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            helperText={grupo.planes.length === 0 ? "El grupo no tiene planes: se usa el automático" : " "}
            sx={{ flex: 1, minWidth: 220 }}
            disabled={grupo.planes.length === 0}
          >
            <MenuItem value="">Automático (seña = aéreos, saldo 25 días antes)</MenuItem>
            {grupo.planes.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* 3. Precios */}
        <Box>
          <Typography sx={{ fontWeight: 700 }}>2. Precio de cada servicio para esta reserva</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Viene con el precio de lista por la cantidad de pasajeros. Cambialo si reservaron en preventa o con otro precio.
          </Typography>
          {grupo.servicios.length === 0 ? (
            <Alert severity="info">El grupo todavía no tiene servicios: agregalos en la pestaña "Servicios y precios".</Alert>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Servicio</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Costo (neto)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Precio de venta (tarifa)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grupo.servicios.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{s.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Lista por pasajero: {formatMoney(s.tarifaPorPax, s.currency)}
                      </Typography>
                    </TableCell>
                    {(["neto", "tarifa"] as const).map((field) => (
                      <TableCell key={field} sx={{ width: 200 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={lines[s.id]?.[field] ?? ""}
                          onChange={(e) => setLine(s.id, field, e.target.value)}
                          InputProps={{ startAdornment: <InputAdornment position="start">{symbol(s.currency)}</InputAdornment> }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {totals.size > 0 && (
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mt: 1.5 }}>
              {[...totals.entries()].map(([currency, t]) => (
                <Typography key={currency} sx={{ fontWeight: 600 }}>
                  Total {formatMoney(t.tarifa, currency)}{" "}
                  <Box component="span" sx={{ color: t.tarifa - t.neto < 0 ? "error.main" : "success.dark" }}>
                    (ganancia {formatMoney(round2(t.tarifa - t.neto), currency)})
                  </Box>
                </Typography>
              ))}
            </Box>
          )}
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none", fontSize: "1rem" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || pax.length === 0 || !nombre.trim()}
          sx={{ textTransform: "none", fontSize: "1rem", fontWeight: 700, px: 3, backgroundColor: "#0D5B75", "&:hover": { backgroundColor: "#0a4a5e" } }}
        >
          {saving ? "Guardando..." : "Agregar reserva"}
        </Button>
      </DialogActions>

      <AddPaxDialog
        open={choosingPax}
        excludeIds={[...grupo.pasajeros.map((p) => p.id), ...pax.map((p) => p.id)]}
        onClose={() => setChoosingPax(false)}
        onAdd={(added) => {
          updatePax([...pax, ...added]);
          return true;
        }}
      />
    </Dialog>
  );
};

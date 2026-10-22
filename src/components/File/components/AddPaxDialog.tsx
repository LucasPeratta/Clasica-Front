import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { iPax } from "../../Pax/model";
import { createPax, getPaxPage } from "../../Pax/handler";
import { useDebouncedValue } from "../../common/useDebouncedValue";
import { initials } from "../utils/formatters";

interface AddPaxDialogProps {
  open: boolean;
  // Pasajeros que ya están en el file (no se muestran)
  excludeIds: string[];
  onClose: () => void;
  // Devuelve true si se agregaron
  onAdd: (paxs: iPax[]) => Promise<boolean> | boolean;
}

const emptyPax = (): iPax => ({
  id: "",
  firstname: "",
  lastname: "",
  dni: "",
  dniVto: null,
  passport: "",
  passportVto: null,
  dob: null,
  adress: "",
  email: "",
  phoneNumber: "",
  obs: "",
});

// Usa lo que se buscó para no tipearlo de nuevo: con números es el DNI, si no nombre y apellido
const prefill = (search: string): iPax => {
  const q = search.trim();
  if (/\d/.test(q)) return { ...emptyPax(), dni: q };
  const [firstname = "", ...rest] = q.split(/\s+/);
  return { ...emptyPax(), firstname, lastname: rest.join(" ") };
};

/**
 * Ventana para sumar pasajeros a un file: buscar y tildar, o cargar uno nuevo ahí mismo
 */
export const AddPaxDialog = ({ open, excludeIds, onClose, onAdd }: AddPaxDialogProps) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [results, setResults] = useState<iPax[] | null>(null);
  const [selected, setSelected] = useState<iPax[]>([]);
  const [adding, setAdding] = useState(false);
  // Carga rápida de un pasajero nuevo
  const [newPax, setNewPax] = useState<iPax | null>(null);
  const [newPaxError, setNewPaxError] = useState("");
  const [creating, setCreating] = useState(false);

  // Al abrir, empieza de cero
  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSelected([]);
    setNewPax(null);
    setNewPaxError("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setResults(null);
    getPaxPage(1, debouncedSearch).then((page) => !cancelled && setResults(page.data));
    return () => {
      cancelled = true;
    };
  }, [open, debouncedSearch]);

  const isSelected = (id: string) => selected.some((p) => p.id === id);
  const toggle = (pax: iPax) =>
    setSelected((prev) => (isSelected(pax.id) ? prev.filter((p) => p.id !== pax.id) : [...prev, pax]));
  const visible = (results ?? []).filter((p) => !excludeIds.includes(p.id));

  const handleCreate = async () => {
    if (!newPax) return;
    if (!newPax.firstname.trim() || !newPax.lastname.trim()) {
      setNewPaxError("Completá nombre y apellido.");
      return;
    }
    setCreating(true);
    setNewPaxError("");
    try {
      const resp = await createPax(newPax);
      const body = await resp.json().catch(() => null);
      if (!resp.ok || !body?.data?.id) {
        setNewPaxError(body?.msg || "No se pudo cargar el pasajero. Intentá de nuevo.");
        return;
      }
      setSelected((prev) => [...prev, body.data as iPax]);
      setNewPax(null);
    } catch {
      setNewPaxError("No se pudo cargar el pasajero. Intentá de nuevo.");
    } finally {
      setCreating(false);
    }
  };

  const handleAdd = async () => {
    setAdding(true);
    const ok = await onAdd(selected);
    setAdding(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={open} onClose={() => !adding && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.35rem" }}>Agregar pasajeros</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
        {selected.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
            <Typography sx={{ fontWeight: 600 }}>Elegidos:</Typography>
            {selected.map((p) => (
              <Chip
                key={p.id}
                label={`${p.firstname} ${p.lastname}`}
                onDelete={() => toggle(p)}
                color="primary"
                sx={{ fontWeight: 600, backgroundColor: "#0D5B75" }}
              />
            ))}
          </Box>
        )}

        {newPax ? (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Pasajero nuevo</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5 }}>
              Cargá lo básico; el resto lo completás después desde su ficha.
            </Typography>
            {newPaxError && <Alert severity="error">{newPaxError}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre *"
                  autoFocus
                  fullWidth
                  value={newPax.firstname}
                  onChange={(e) => setNewPax({ ...newPax, firstname: e.target.value })}
                  inputProps={{ maxLength: 25 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Apellido *"
                  fullWidth
                  value={newPax.lastname}
                  onChange={(e) => setNewPax({ ...newPax, lastname: e.target.value })}
                  inputProps={{ maxLength: 25 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="DNI"
                  fullWidth
                  value={newPax.dni ?? ""}
                  onChange={(e) => setNewPax({ ...newPax, dni: e.target.value })}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Celular"
                  fullWidth
                  value={newPax.phoneNumber ?? ""}
                  onChange={(e) => setNewPax({ ...newPax, phoneNumber: e.target.value })}
                  inputProps={{ maxLength: 35 }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button onClick={() => setNewPax(null)} disabled={creating} sx={{ textTransform: "none" }}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleCreate} disabled={creating} sx={{ textTransform: "none", fontWeight: 700 }}>
                {creating ? "Guardando..." : "Guardar y elegir"}
              </Button>
            </Box>
          </Paper>
        ) : (
          <>
            <TextField
              autoFocus
              fullWidth
              placeholder="Buscar por nombre, DNI o pasaporte"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ border: "1px solid #e0e7ea", borderRadius: 2, maxHeight: 340, overflow: "auto" }}>
              {results === null ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <CircularProgress size={24} />
                </Box>
              ) : visible.length === 0 ? (
                <Typography color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
                  {search ? "No se encontró ningún pasajero con esa búsqueda." : "No hay pasajeros para agregar."}
                </Typography>
              ) : (
                visible.map((pax) => (
                  <Box
                    key={pax.id}
                    role="checkbox"
                    aria-checked={isSelected(pax.id)}
                    tabIndex={0}
                    onClick={() => toggle(pax)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle(pax))}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 1.5,
                      py: 1,
                      cursor: "pointer",
                      borderBottom: "1px solid #eef2f4",
                      "&:last-of-type": { borderBottom: "none" },
                      backgroundColor: isSelected(pax.id) ? "#e3f0f4" : undefined,
                      "&:hover, &:focus-visible": { backgroundColor: "#f2f8fa", outline: "none" },
                    }}
                  >
                    <Checkbox checked={isSelected(pax.id)} tabIndex={-1} sx={{ p: 0.5 }} />
                    <Avatar sx={{ bgcolor: "#0D5B75", width: 34, height: 34, fontSize: 14 }}>
                      {initials(pax.lastname, pax.firstname)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600 }}>
                        {pax.firstname} {pax.lastname}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[pax.dni && `DNI ${pax.dni}`, pax.passport && `Pasaporte ${pax.passport}`].filter(Boolean).join(" · ") ||
                          "Sin documento cargado"}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
            <Button
              startIcon={<PersonAddIcon />}
              onClick={() => setNewPax(prefill(search))}
              sx={{ alignSelf: "flex-start", textTransform: "none", fontSize: "1rem", fontWeight: 600 }}
            >
              ¿No está? Cargar un pasajero nuevo
            </Button>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={adding} sx={{ textTransform: "none", fontSize: "1rem" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={adding || selected.length === 0 || !!newPax}
          sx={{ textTransform: "none", fontSize: "1rem", fontWeight: 700, px: 3, backgroundColor: "#0D5B75", "&:hover": { backgroundColor: "#0a4a5e" } }}
        >
          {adding
            ? "Agregando..."
            : selected.length === 0
              ? "Agregar"
              : `Agregar ${selected.length === 1 ? "1 pasajero" : `${selected.length} pasajeros`}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

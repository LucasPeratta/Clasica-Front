import { useState } from "react";
import { Alert, AlertTitle, Box, Button, CircularProgress, IconButton, Paper, Snackbar, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { deleteHabitacion } from "../handler";
import { iGrupo, iHabitacion, ROOM_TYPES } from "../model";
import { HabitacionDialog } from "./HabitacionDialog";
import { downloadRooming } from "../utils/roomingExcel";

const date = (value: string | null) => (value ? dayjs(value).format("DD/MM/YYYY") : "—");

/**
 * Rooming: habitación por habitación, con los datos de cada pasajero; se descarga en Excel
 */
export const RoomingTab = ({ grupo, onChange }: { grupo: iGrupo; onChange: () => void }) => {
  const [editing, setEditing] = useState<iHabitacion | "new" | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (room: iHabitacion) => {
    const result = await deleteHabitacion(grupo.id, room.id);
    if (result.ok) onChange();
    else setError(result.msg);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadRooming(grupo);
    } catch (e) {
      console.error(e);
      setError("No se pudo armar el Excel. Intentá de nuevo.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0D5B75" }}>
          Rooming
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={downloading ? <CircularProgress size={18} /> : <DownloadIcon />}
            onClick={handleDownload}
            disabled={downloading || grupo.pasajeros.length === 0}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            Descargar rooming (Excel)
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setEditing("new")}
            disabled={grupo.sinHabitacion.length === 0}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            Agregar habitación
          </Button>
        </Box>
      </Box>

      {grupo.sinHabitacion.length > 0 && grupo.pasajeros.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle sx={{ fontWeight: 700 }}>
            {grupo.sinHabitacion.length === 1 ? "1 pasajero sin habitación" : `${grupo.sinHabitacion.length} pasajeros sin habitación`}
          </AlertTitle>
          {grupo.sinHabitacion.map((p) => `${p.firstname} ${p.lastname}`).join(", ")}
        </Alert>
      )}

      {grupo.habitaciones.length === 0 ? (
        <Typography color="text.secondary">
          {grupo.pasajeros.length === 0
            ? "Primero agregá las reservas con sus pasajeros."
            : 'Todavía no hay habitaciones. Tocá "Agregar habitación", elegí el tipo y quiénes duermen ahí.'}
        </Typography>
      ) : (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" } }}>
          {grupo.habitaciones.map((room, index) => (
            <Paper key={room.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    Habitación {index + 1} · {ROOM_TYPES.find((t) => t.value === room.tipo)?.label}
                  </Typography>
                  {room.obs && (
                    <Typography variant="body2" color="text.secondary">
                      {room.obs}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Cambiar">
                    <IconButton onClick={() => setEditing(room)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Quitar habitación">
                    <IconButton color="error" onClick={() => handleDelete(room)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              {room.pasajeros.map((p) => (
                <Box key={p.id} sx={{ py: 0.75, borderTop: "1px solid #eef2f4", mt: 0.75 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {p.lastname}, {p.firstname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nac. {date(p.dob)} · DNI {p.dni || "—"} (vto. {date(p.dniVto)}) · Pasaporte {p.passport || "—"} (vto. {date(p.passportVto)})
                  </Typography>
                </Box>
              ))}
            </Paper>
          ))}
        </Box>
      )}

      {editing && (
        <HabitacionDialog
          grupo={grupo}
          habitacion={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChange();
          }}
        />
      )}
      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError(null)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

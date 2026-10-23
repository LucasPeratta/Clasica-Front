import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link as MuiLink,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useGoBack } from "../../../common/useGoBack";
import { iFile } from "../../model";
import { formatFileNumber } from "../../utils/fileNumber";
import { Link } from "react-router-dom";
import { ReservaEditDialog } from "../../../Grupos/components/ReservaEditDialog";

interface FileProfileHeaderProps {
  file: iFile;
  // Devuelve true si se guardó
  onSave: (editedFile: iFile) => Promise<boolean>;
  // Abre la confirmación para eliminar el file
  onDelete?: () => void;
  // Reservas de grupos: se cambió el nombre o el plan
  onReservaSaved?: (changes: { nombre: string; planId: string | null; habitacionTipo: string | null }) => void;
}

const buttonSx = { textTransform: "none", fontSize: "1rem", fontWeight: 600, borderRadius: 2, px: 2.5 };

/**
 * Encabezado del file: número grande, destino y referencia, y los botones Volver / Editar datos / Eliminar
 */
export const FileProfileHeader = ({ file, onSave, onDelete, onReservaSaved }: FileProfileHeaderProps) => {
  // Una reserva de grupo vuelve a su grupo
  const goBack = useGoBack(file.grupoId ? `/grupos/${file.grupoId}` : "/files");
  const [editingReserva, setEditingReserva] = useState(false);
  const [editedFile, setEditedFile] = useState<iFile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const number = formatFileNumber(file);

  const openEdit = () => {
    if (file.grupo) {
      setEditingReserva(true);
      return;
    }
    setEditedFile(file);
    setSaveError(false);
  };

  const handleSave = async () => {
    if (!editedFile) return;
    setSaving(true);
    const ok = await onSave(editedFile);
    setSaving(false);
    if (ok) setEditedFile(null);
    else setSaveError(true);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        backgroundColor: "#fff",
        boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box>
        {file.grupo ? (
          <Typography sx={{ fontSize: "0.95rem", color: "#5b6d74", fontWeight: 600 }}>
            Reserva de la salida grupal{" "}
            <MuiLink component={Link} to={`/grupos/${file.grupo.id}`} underline="hover" sx={{ fontWeight: 700, color: "#0D5B75" }}>
              {file.grupo.titulo}
            </MuiLink>
          </Typography>
        ) : (
          <Typography sx={{ fontSize: "0.95rem", color: "#5b6d74", fontWeight: 600 }}>
            {number ? `File ${number}` : "File"}
            {file.nro ? ` · Ref: ${file.nro}` : ""}
          </Typography>
        )}
        <Typography component="h1" sx={{ fontWeight: 700, fontSize: { xs: "1.6rem", md: "2rem" }, lineHeight: 1.2 }}>
          {(file.grupo ? file.reservaNombre : file.destino) || "Sin destino"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={goBack} sx={buttonSx}>
          Volver
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={openEdit}
          sx={{ ...buttonSx, fontWeight: 700, backgroundColor: "#0D5B75", "&:hover": { backgroundColor: "#0a4a5e" } }}
        >
          Editar datos
        </Button>
        {onDelete && (
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete} sx={buttonSx}>
            Eliminar
          </Button>
        )}
      </Box>

      {/* Reserva de grupo: nombre y plan */}
      {editingReserva && file.grupo && (
        <ReservaEditDialog
          grupo={file.grupo}
          fileId={file.id}
          nombre={file.reservaNombre ?? ""}
          planId={file.grupoPlanId ?? null}
          habitacionTipo={file.habitacionTipo ?? null}
          onClose={() => setEditingReserva(false)}
          onSaved={(changes) => {
            setEditingReserva(false);
            onReservaSaved?.(changes);
          }}
        />
      )}

      {/* Editar los datos generales del file */}
      <Dialog open={!!editedFile} onClose={() => !saving && setEditedFile(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Editar datos del file</DialogTitle>
        {editedFile && (
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
            {saveError && <Alert severity="error">No se pudo guardar. Intentá de nuevo.</Alert>}
            <TextField
              label="Destino"
              value={editedFile.destino || ""}
              onChange={(e) => setEditedFile({ ...editedFile, destino: e.target.value })}
              fullWidth
            />
            <TextField
              label="Fecha de salida"
              type="date"
              value={editedFile.fechaSalida ? dayjs(editedFile.fechaSalida).format("YYYY-MM-DD") : ""}
              onChange={(e) => setEditedFile({ ...editedFile, fechaSalida: dayjs(e.target.value) })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Referencia (opcional)"
              value={editedFile.nro || ""}
              onChange={(e) => setEditedFile({ ...editedFile, nro: e.target.value })}
              helperText="Un código propio, por ejemplo el de la reserva del mayorista"
              fullWidth
            />
            <TextField
              label="Observaciones"
              value={editedFile.obs || ""}
              onChange={(e) => setEditedFile({ ...editedFile, obs: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </DialogContent>
        )}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditedFile(null)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !editedFile?.destino?.trim()}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

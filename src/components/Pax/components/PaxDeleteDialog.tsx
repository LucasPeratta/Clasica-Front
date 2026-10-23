import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import dayjs from "dayjs";
import { iPaxFile } from "../handler";
import { formatFileNumber } from "../../File/utils/fileNumber";

interface PaxDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  // Files en los que está el pasajero; null mientras se cargan
  files: iPaxFile[] | null;
  // No se pudo averiguar en qué files está
  filesError?: boolean;
  deleting?: boolean;
}

export const PaxDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  files,
  filesError,
  deleting,
}: PaxDeleteDialogProps) => {
  const loadingFiles = files === null && !filesError;
  const inFiles = files !== null && files.length > 0;
  // Está en files con pagos o facturados: no se elimina (se guarda para la AFIP)
  const protectedFiles = (files ?? []).filter(
    (f) => f.facturado || (f.total !== undefined && f.falta !== undefined && f.falta < f.total)
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent>
        {loadingFiles ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={28} />
          </Box>
        ) : protectedFiles.length > 0 ? (
          <Alert severity="info">
            <AlertTitle>No se puede eliminar</AlertTitle>
            Este pasajero está en {protectedFiles.length === 1 ? "un file que tiene" : `${protectedFiles.length} files que tienen`} pagos
            o facturas, así que se guarda para tener todo en orden ante la AFIP.
          </Alert>
        ) : inFiles ? (
          <Alert severity="warning">
            <AlertTitle>
              Este pasajero está en {files.length}{" "}
              {files.length === 1 ? "file" : "files"}
            </AlertTitle>
            Si lo eliminás, se va a quitar de:
            <List dense disablePadding>
              {files.map((f) => (
                <ListItem key={f.id} disableGutters sx={{ py: 0 }}>
                  <ListItemText
                    primary={`• ${formatFileNumber(f) ? `File ${formatFileNumber(f)} — ` : ""}${f.destino} — ${dayjs(
                      f.fechaSalida
                    ).format("DD/MM/YYYY")}`}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        ) : (
          <>
            {filesError && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No se pudo revisar si el pasajero está en algún file.
              </Alert>
            )}
            <DialogContentText>
              ¿Estás seguro de que deseas eliminar este pasajero?
            </DialogContentText>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {protectedFiles.length > 0 ? (
          <Button variant="contained" onClick={onClose}>
            Entendido
          </Button>
        ) : (
          <>
            <Button onClick={onClose}>Cancelar</Button>
            <Button
              color="error"
              variant={inFiles ? "contained" : "text"}
              onClick={onConfirm}
              disabled={loadingFiles || deleting}
            >
              {deleting ? "Eliminando..." : inFiles ? "Eliminar igual" : "Eliminar"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

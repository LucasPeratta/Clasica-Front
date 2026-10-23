import {
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import dayjs from "dayjs";
import { iFile } from "../model";
import { formatFileNumber } from "../utils/fileNumber";
import { fileProtectionReason } from "../utils/protection";

// Detalle del file a eliminar (con documentos); null mientras se carga
export type iFileToDelete = iFile & { pdfs?: unknown[] };

interface FileDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  file: iFileToDelete | null;
  // No se pudo cargar el detalle
  fileError?: boolean;
  deleting?: boolean;
}

const plural = (n: number, singular: string, pluralWord: string) =>
  `${n} ${n === 1 ? singular : pluralWord}`;

export const FileDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  file,
  fileError,
  deleting,
}: FileDeleteDialogProps) => {
  const loadingFile = file === null && !fileError;
  // Con plata (pagos o factura) no se elimina: se guarda para la AFIP
  const protectedReason = file ? fileProtectionReason(file) : null;
  const paxCount = file?.clients?.length ?? 0;
  const serviceCount = file?.services?.length ?? 0;
  const pdfCount = file?.pdfs?.length ?? 0;
  const fileName = file
    ? [formatFileNumber(file) && `File ${formatFileNumber(file)}`, file.destino]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Eliminar file</DialogTitle>
      <DialogContent>
        {loadingFile ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={28} />
          </Box>
        ) : file && protectedReason ? (
          <Alert severity="info">
            <AlertTitle>{fileName}</AlertTitle>
            Este file {protectedReason}, así que no se puede eliminar: se guarda para tener todo en orden ante la AFIP.
          </Alert>
        ) : file ? (
          <Alert severity="warning">
            <AlertTitle>
              {fileName}
              {file.fechaSalida && ` — sale el ${dayjs(file.fechaSalida).format("DD/MM/YYYY")}`}
            </AlertTitle>
            {serviceCount + pdfCount > 0 && (
              <>
                Se van a eliminar también:
                <ul style={{ margin: "4px 0 8px", paddingLeft: 20 }}>
                  {serviceCount > 0 && <li>{plural(serviceCount, "servicio", "servicios")}</li>}
                  {pdfCount > 0 && <li>{plural(pdfCount, "documento", "documentos")}</li>}
                </ul>
              </>
            )}
            {paxCount > 0 && (
              <div>
                {plural(paxCount, "pasajero se quita", "pasajeros se quitan")} del file, pero
                no se borra{paxCount === 1 ? "" : "n"} de la lista de pasajeros.
              </div>
            )}
            <div style={{ marginTop: 8, fontWeight: 600 }}>No se puede deshacer.</div>
          </Alert>
        ) : (
          <DialogContentText>¿Estás seguro de que deseas eliminar este file?</DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        {protectedReason ? (
          <Button variant="contained" onClick={onClose}>
            Entendido
          </Button>
        ) : (
          <>
            <Button onClick={onClose}>Cancelar</Button>
            <Button
              color="error"
              variant="contained"
              onClick={onConfirm}
              disabled={loadingFile || deleting}
            >
              {deleting ? "Eliminando..." : "Eliminar file"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

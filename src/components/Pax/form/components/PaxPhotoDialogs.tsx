import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface PaxPhotoDialogsProps {
  selectedPhoto: string | null;
  photoToDelete: string | null;
  onClosePreview: () => void;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
}

export const PaxPhotoDialogs = ({
  selectedPhoto,
  photoToDelete,
  onClosePreview,
  onCloseDelete,
  onConfirmDelete,
}: PaxPhotoDialogsProps) => {
  return (
    <>
      {/* Diálogo para confirmar eliminación de foto */}
      <Dialog open={photoToDelete !== null} onClose={onCloseDelete}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta foto?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDelete}>Cancelar</Button>
          <Button color="error" onClick={onConfirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para ver foto ampliada */}
      <Dialog
        open={selectedPhoto !== null}
        onClose={onClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Vista previa</Typography>
            <IconButton onClick={onClosePreview}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Vista previa"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 8,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

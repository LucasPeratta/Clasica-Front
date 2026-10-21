import { useState } from "react";
import {
  Typography,
  ImageList,
  ImageListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { PaxPhoto } from "../../types/paxPhoto";

interface PaxProfilePhotosProps {
  photos: PaxPhoto[];
  selectedPhoto: string | null;
  onPhotoClick: (url: string) => void;
  onCloseDialog: () => void;
  onDelete?: (photoId: string) => void;
}

export const PaxProfilePhotos = ({
  photos,
  selectedPhoto,
  onPhotoClick,
  onCloseDialog,
  onDelete,
}: PaxProfilePhotosProps) => {
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <ImageList
        sx={{ width: "100%", maxHeight: 500, mt: 1, mb: 2 }}
        cols={4}
        rowHeight={200}
        gap={12}
      >
        {photos.map((photo, index) => (
          <ImageListItem
            key={photo.id || `photo-${index}`}
            sx={{
              cursor: "pointer",
              borderRadius: 2,
              overflow: "hidden",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
              },
              "&:hover .delete-photo": { opacity: 1 },
            }}
            onClick={() => onPhotoClick(photo.url)}
          >
            <img
              src={photo.url}
              alt={photo.filename}
              loading="lazy"
              style={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
              }}
            />
            {onDelete && (
              <Tooltip title="Eliminar foto">
                <IconButton
                  className="delete-photo"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoToDelete(photo.id);
                  }}
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    opacity: 0,
                    transition: "opacity 0.2s",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    color: "error.main",
                    "&:hover": { backgroundColor: "#fff" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </ImageListItem>
        ))}
      </ImageList>

      {/* Diálogo para ver foto ampliada */}
      <Dialog
        open={selectedPhoto !== null}
        onClose={onCloseDialog}
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
            <IconButton onClick={onCloseDialog}>
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

      {/* Confirmación de borrado */}
      <Dialog open={photoToDelete !== null} onClose={() => setPhotoToDelete(null)}>
        <DialogTitle>Eliminar foto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que querés eliminar esta foto? No se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoToDelete(null)}>Cancelar</Button>
          <Button
            color="error"
            onClick={() => {
              if (photoToDelete && onDelete) onDelete(photoToDelete);
              setPhotoToDelete(null);
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

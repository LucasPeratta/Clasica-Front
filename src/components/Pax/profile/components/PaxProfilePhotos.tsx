import {
  Typography,
  ImageList,
  ImageListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PaxPhoto } from "../../types/paxPhoto";

interface PaxProfilePhotosProps {
  photos: PaxPhoto[];
  selectedPhoto: string | null;
  onPhotoClick: (url: string) => void;
  onCloseDialog: () => void;
}

export const PaxProfilePhotos = ({
  photos,
  selectedPhoto,
  onPhotoClick,
  onCloseDialog,
}: PaxProfilePhotosProps) => {
  if (photos.length === 0) return null;

  return (
    <>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Fotos del pasajero
      </Typography>
      <ImageList
        sx={{ width: "100%", maxHeight: 500 }}
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
    </>
  );
};

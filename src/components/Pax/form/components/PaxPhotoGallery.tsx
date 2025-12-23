import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { PaxPhoto } from "../../types/paxPhoto";
import { uploadPaxPhoto } from "../../handler";

interface PaxPhotoGalleryProps {
  id: string;
  photos: PaxPhoto[];
  setPhotos: React.Dispatch<React.SetStateAction<PaxPhoto[]>>;
  onPhotoClick: (url: string) => void;
  onDeleteClick: (photoId: string) => void;
}

export const PaxPhotoGallery = ({
  id,
  photos,
  setPhotos,
  onPhotoClick,
  onDeleteClick,
}: PaxPhotoGalleryProps) => {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!id || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    setUploadingPhoto(true);

    try {
      const response = await uploadPaxPhoto(id, file);
      if (response.ok) {
        const data = await response.json();
        const newPhoto = data.photo || data;
        setPhotos((prev) => [...prev, newPhoto]);
      } else {
        console.error("Error uploading photo:", response.status);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight={600}>
          Fotos del pasajero
        </Typography>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          disabled={uploadingPhoto}
        >
          {uploadingPhoto ? "Subiendo..." : "Subir foto"}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </Button>
      </Stack>

      {photos.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            color: "text.secondary",
          }}
        >
          <Typography>No hay fotos cargadas</Typography>
        </Box>
      ) : (
        <ImageList
          sx={{ width: "100%", maxHeight: 450 }}
          cols={4}
          rowHeight={200}
          gap={8}
        >
          {photos.map((photo, index) => (
            <ImageListItem
              key={photo.id || `photo-${index}`}
              sx={{
                cursor: "pointer",
                "&:hover .delete-button": {
                  opacity: 1,
                },
              }}
            >
              <img
                src={photo.url}
                alt={photo.filename}
                loading="lazy"
                style={{
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
                onClick={() => onPhotoClick(photo.url)}
              />
              <ImageListItemBar
                sx={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                }}
                position="top"
                actionIcon={
                  <IconButton
                    className="delete-button"
                    sx={{
                      color: "white",
                      opacity: 0,
                      transition: "opacity 0.2s",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(photo.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                actionPosition="right"
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </>
  );
};

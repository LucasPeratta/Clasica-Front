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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handlePhotoUpload = async (file: File) => {
    if (!id || !file) return;

    setUploadingPhoto(true);

    try {
      const response = await uploadPaxPhoto(id, file);
      if (response.ok) {
        const data = await response.json();
        const newPhoto = data.photo || data;
        setPhotos((prev) => [...prev, newPhoto]);
        setPreviewUrl(null);
        setPreviewFile(null);
      } else {
        console.error("Error uploading photo:", response.status);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      showPreview(file);
      event.target.value = "";
    }
  };

  const showPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setPreviewFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        showPreview(file);
      }
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
          disabled={uploadingPhoto || previewUrl !== null}
        >
          {uploadingPhoto ? "Subiendo..." : "Subir foto"}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileSelect}
          />
        </Button>
      </Stack>

      {/* Área de drag & drop + preview */}
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          borderRadius: 2,
          border: "2px dashed",
          borderColor: dragActive ? "primary.main" : "divider",
          backgroundColor: dragActive ? "action.hover" : "background.paper",
          p: 2,
          mb: 3,
          transition: "all 0.3s ease",
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        {previewUrl ? (
          <Stack spacing={2} alignItems="center">
            <Typography variant="subtitle2" color="text.secondary">
              Vista previa
            </Typography>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                borderRadius: 8,
              }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                onClick={() => previewFile && handlePhotoUpload(previewFile)}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? "Subiendo..." : "Guardar"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setPreviewUrl(null);
                  setPreviewFile(null);
                }}
              >
                Cancelar
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Typography color="text.secondary">
            Arrastra una foto aquí o usa el botón para seleccionar
          </Typography>
        )}
      </Box>

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

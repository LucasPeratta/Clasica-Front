import { useState } from "react";
import { Box, Paper, Snackbar, Alert } from "@mui/material";
import { LoadingScreen } from "../../LoadingScreen";
import { deletePaxPhoto } from "../handler";
import { usePaxForm } from "../hooks/usePaxForm";
import { PaxFormHeader } from "./components/PaxFormHeader";
import { PaxFormFields } from "./components/PaxFormFields";
import { PaxPhotoGallery } from "./components/PaxPhotoGallery";
import { PaxPhotoDialogs } from "./components/PaxPhotoDialogs";

export const PaxForm = () => {
  const {
    id,
    loading,
    formData,
    setFormData,
    photos,
    setPhotos,
    notificationOpen,
    setNotificationOpen,
    errorNotificationOpen,
    setErrorNotificationOpen,
    handleChange,
    handleSubmit,
  } = usePaxForm();

  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (loading) return <LoadingScreen />;

  const handleDeletePhoto = async () => {
    if (!id || !photoToDelete) return;

    try {
      const response = await deletePaxPhoto(id, photoToDelete);
      if (response.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoToDelete));
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
    } finally {
      setPhotoToDelete(null);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 6 },
        py: 3,
        background:
          "linear-gradient(135deg, #0D5B75 0%, #1a7a99 50%, #89c2d9 100%)",
        backgroundImage:
          "linear-gradient(135deg, #0D5B75 0%, #1a7a99 50%, #89c2d9 100%), " +
          "radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%), " +
          "radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 2,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: 3,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        <PaxFormHeader formData={formData} id={id} />
      </Paper>

      {/* Formulario */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 2,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: 3,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        <form id="pax-form" onSubmit={handleSubmit}>
          <PaxFormFields
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
          />
        </form>
      </Paper>

      {/* Sección de fotos - Solo en modo edición */}
      {id && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <PaxPhotoGallery
            id={id}
            photos={photos}
            setPhotos={setPhotos}
            onPhotoClick={(url) => setSelectedPhoto(url)}
            onDeleteClick={(photoId) => setPhotoToDelete(photoId)}
          />
        </Paper>
      )}

      {/* Snackbars */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={4000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setNotificationOpen(false)} severity="success">
          {id ? "Pax actualizado correctamente" : "Pax creado correctamente"}
        </Alert>
      </Snackbar>

      <Snackbar
        open={errorNotificationOpen}
        autoHideDuration={4000}
        onClose={() => setErrorNotificationOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setErrorNotificationOpen(false)} severity="error">
          El mail ingresado ya se encuentra registrado
        </Alert>
      </Snackbar>

      {/* Diálogos de fotos */}
      <PaxPhotoDialogs
        selectedPhoto={selectedPhoto}
        photoToDelete={photoToDelete}
        onClosePreview={() => setSelectedPhoto(null)}
        onCloseDelete={() => setPhotoToDelete(null)}
        onConfirmDelete={handleDeletePhoto}
      />
    </Box>
  );
};

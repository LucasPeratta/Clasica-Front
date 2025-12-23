import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { LoadingScreen } from "../../LoadingScreen";
import { useFileForm } from "../hooks/useFileForm";
import { FileFormHeader } from "./components/FileFormHeader";
import { FileFormFields } from "./components/FileFormFields";
import { FilePaxSelector } from "./components/FilePaxSelector";
import { FileServiceManager } from "./components/FileServiceManager";

export const FileForm = () => {
  const {
    id,
    paxs,
    formData,
    setFormData,
    selectedPaxIds,
    setSelectedPaxIds,
    fileServices,
    setFileServices,
    loading,
    notificationOpen,
    setNotificationOpen,
    errorNotificationOpen,
    setErrorNotificationOpen,
    handleChange,
    handleSubmit,
    navigate,
    createService,
    softDeleteService,
    getServiceById,
  } = useFileForm();

  if (loading) return <LoadingScreen />;

  return (
    <Box
      sx={{
        px: { xs: 3, md: 10 },
        py: 4,
        background: "linear-gradient(135deg, #eaf3ff 0%, #dfeefe 100%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <FileFormHeader id={id} />

      <Card elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* IZQUIERDA - Datos del File */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#0d47a1", fontWeight: 600 }}
              >
                Datos del File
              </Typography>
              <FileFormFields
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
              />
            </Grid>

            {/* DERECHA - Relaciones */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#0d47a1", fontWeight: 600 }}
              >
                Relaciones
              </Typography>

              {/* Pasajeros */}
              <FilePaxSelector
                paxs={paxs}
                selectedPaxIds={selectedPaxIds}
                setSelectedPaxIds={setSelectedPaxIds}
              />

              {/* Servicios */}
              <FileServiceManager
                fileServices={fileServices}
                setFileServices={setFileServices}
                createService={createService}
                softDeleteService={softDeleteService}
                getServiceById={getServiceById}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }} />

      {/* Botones */}
      <Box display="flex" justifyContent="center" gap={2}>
        <Button
          variant="outlined"
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          onClick={() => navigate(id ? `/files/profile/${id}` : "/files")}
        >
          Volver
        </Button>
        <Button
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            background: "linear-gradient(135deg, #007bff 0%, #6f42c1 100%)",
          }}
          onClick={handleSubmit}
        >
          {id ? "Actualizar File" : "Crear File"}
        </Button>
      </Box>

      {/* Snackbars */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={4000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setNotificationOpen(false)}>
          {id ? "File actualizado correctamente" : "File creado correctamente"}
        </Alert>
      </Snackbar>

      <Snackbar
        open={errorNotificationOpen}
        autoHideDuration={4000}
        onClose={() => setErrorNotificationOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setErrorNotificationOpen(false)}>
          Debes completar todos los campos requeridos (*)
        </Alert>
      </Snackbar>
    </Box>
  );
};

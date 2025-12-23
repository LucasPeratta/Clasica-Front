import { Box, Paper, Typography } from "@mui/material";
import { LoadingScreen } from "../LoadingScreen";
import { usePaxProfile } from "./hooks/usePaxProfile";
import { PaxProfileHeader } from "./profile/components/PaxProfileHeader";
import { PaxProfileData } from "./profile/components/PaxProfileData";
import { PaxProfilePhotos } from "./profile/components/PaxProfilePhotos";

export const PaxProfile = (): JSX.Element => {
  const { pax, loading, photos, selectedPhoto, setSelectedPhoto, fromFileId } =
    usePaxProfile();

  if (loading) return <LoadingScreen />;
  if (!pax) return <Typography>Error</Typography>;

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
        <PaxProfileHeader pax={pax} fromFileId={fromFileId} />
      </Paper>

      {/* Datos */}
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
        <PaxProfileData pax={pax} />
      </Paper>

      {/* Sección de Fotos */}
      {photos.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mt: 2,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <PaxProfilePhotos
            photos={photos}
            selectedPhoto={selectedPhoto}
            onPhotoClick={(url) => setSelectedPhoto(url)}
            onCloseDialog={() => setSelectedPhoto(null)}
          />
        </Paper>
      )}
    </Box>
  );
};

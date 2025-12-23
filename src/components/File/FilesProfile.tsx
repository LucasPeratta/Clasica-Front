import { useFileProfile } from "./hooks/useFileProfile";
import { LoadingScreen } from "../LoadingScreen";
import { Box, Typography } from "@mui/material";
import { FileProfileHeader } from "./profile/components/FileProfileHeader";
import { FileProfileData } from "./profile/components/FileProfileData";
import { FileProfileClients } from "./profile/components/FileProfileClients";
import { FileProfileServices } from "./profile/components/FileProfileServices";

export const FilesProfile = (): JSX.Element => {
  const { file, loading } = useFileProfile();

  if (loading) return <LoadingScreen />;
  if (!file) return <Typography>Error al cargar el archivo.</Typography>;

  return (
    <Box
      sx={{
        px: { xs: 3, md: 10 },
        py: 4,
        background: "linear-gradient(135deg, #eaf3ff 0%, #dfeefe 100%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <FileProfileHeader fileId={file.id} />
      <FileProfileData file={file} />
      <FileProfileClients clients={file.clients} fileId={file.id} />
      <FileProfileServices services={file.services} />
    </Box>
  );
};

import { useState, MouseEvent } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "../LoadingScreen";
import { useFiles } from "./hooks/useFiles";
import { normalize } from "./utils/formatters";
import { FileSearchBar } from "./components/FileSearchBar";
import { FileTable } from "./components/FileTable";
import { FileDeleteDialog } from "./components/FileDeleteDialog";

export const Files = (): JSX.Element => {
  const { files, loading, handleDelete } = useFiles();
  const [searchTerm, setSearchTerm] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDeleteId, setFileToDeleteId] = useState("");

  const navigate = useNavigate();

  if (loading) return <LoadingScreen />;

  const terms = normalize(searchTerm).split(" ").filter(Boolean);

  const filteredFiles = files
    .filter((f) => {
      if (!terms.length) return true;

      const dest = normalize(f.destino);
      const nro = normalize(f.nro || "");

      const allPaxNames =
        f.clients
          ?.map((client) => normalize(`${client.lastname} ${client.firstname}`))
          .join(" ") || "";

      return terms.every(
        (t) => dest.includes(t) || allPaxNames.includes(t) || nro.includes(t)
      );
    })
    .sort((a, b) => {
      if (a.fechaSalida && b.fechaSalida)
        return a.fechaSalida < b.fechaSalida ? -1 : 1;
      return 0;
    });

  const handleAdd = () => navigate("/files/create");
  const handleView = (id: string) => navigate(`/files/profile/${id}`);

  const handleDeleteConfirm = (id: string, e?: MouseEvent) => {
    e?.stopPropagation();
    setFileToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await handleDelete(fileToDeleteId);
    setSuccessOpen(true);
    setDeleteDialogOpen(false);
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
      <FileSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAdd={handleAdd}
      />

      <FileTable
        files={filteredFiles}
        searchTerm={searchTerm}
        onView={handleView}
        onDeleteConfirm={handleDeleteConfirm}
      />

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success">
          ¡File eliminado con éxito!
        </Alert>
      </Snackbar>

      <FileDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};

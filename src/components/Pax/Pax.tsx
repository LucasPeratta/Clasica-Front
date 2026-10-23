import { useState } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { deletePax, getPaxFiles, getPaxPage, iPaxFile } from "./handler";
import { LoadingScreen } from "../LoadingScreen";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { PageHeader } from "../common/PageHeader";
import { SearchBox } from "../common/SearchBox";
import { PaxTable } from "./components/PaxTable";
import { PaxDeleteDialog } from "./components/PaxDeleteDialog";
import { usePaginatedList } from "../common/Pagination/usePaginatedList";
import { TablePaginationBar } from "../common/Pagination/TablePaginationBar";

export const Pax = (): JSX.Element => {
  const {
    items: pax,
    total,
    totalPages,
    pageSize,
    page,
    setPage,
    searchInput,
    setSearchInput,
    initialLoading,
    loading,
    reload,
  } = usePaginatedList(getPaxPage);
  const [successOpen, setSuccessOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paxToDeleteId, setPaxToDeleteId] = useState("");
  const [paxFiles, setPaxFiles] = useState<iPaxFile[] | null>(null);
  const [paxFilesError, setPaxFilesError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const navigate = useNavigate();

  if (initialLoading) return <LoadingScreen />;

  const handleView = (id: string) => navigate(`/paxs/profile/${id}`);

  // Antes de confirmar, se buscan los files en los que está el pasajero
  const askDelete = (id: string) => {
    setPaxToDeleteId(id);
    setPaxFiles(null);
    setPaxFilesError(false);
    setDeleteDialogOpen(true);
    getPaxFiles(id)
      .then(setPaxFiles)
      .catch(() => setPaxFilesError(true));
  };

  const handleDelete = async () => {
    setDeleting(true);
    const error = await deletePax(paxToDeleteId);
    setDeleting(false);
    setDeleteDialogOpen(false);
    if (error) {
      setDeleteError(error);
    } else {
      reload();
      setSuccessOpen(true);
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
      <Box sx={{ maxWidth: 1300, mx: "auto" }}>
        <PageHeader
          title="Pasajeros"
          description="Todas las personas que viajan con nosotros. Tocá un pasajero para ver sus datos."
          action={{ label: "Cargar un pasajero", icon: <PersonAddIcon />, to: "/paxs/create" }}
        />
        <SearchBox
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Buscá por nombre, apellido, DNI, pasaporte o email"
        />

        {/* Tabla */}
        <Box sx={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
          <PaxTable pax={pax} onView={handleView} onDelete={askDelete} />
        </Box>

        {/* Paginación */}
        <TablePaginationBar
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </Box>

      {/* Notificación de éxito */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success">
          ¡Pasajero eliminado con éxito!
        </Alert>
      </Snackbar>

      {/* Notificación de error */}
      <Snackbar
        open={!!deleteError}
        autoHideDuration={4000}
        onClose={() => setDeleteError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setDeleteError(null)} severity="error">
          {deleteError}
        </Alert>
      </Snackbar>

      {/* Diálogo de confirmación (avisa si el pasajero está en algún file) */}
      <PaxDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        files={paxFiles}
        filesError={paxFilesError}
        deleting={deleting}
      />
    </Box>
  );
};

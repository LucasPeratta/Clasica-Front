import { useState, useEffect, MouseEvent } from "react";
import { Box, Snackbar, Alert, Button, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingScreen } from "../LoadingScreen";
import { useFiles, FileTab } from "./hooks/useFiles";
import { FileTabs } from "./components/FileTabs";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { PageHeader } from "../common/PageHeader";
import { SearchBox } from "../common/SearchBox";
import { FileTable } from "./components/FileTable";
import { FileDeleteDialog, iFileToDelete } from "./components/FileDeleteDialog";
import { getFileById } from "./handler";
import { TablePaginationBar } from "../common/Pagination/TablePaginationBar";

export const Files = (): JSX.Element => {
  const {
    files,
    total,
    totalPages,
    pageSize,
    page,
    setPage,
    search,
    searchInput,
    setSearchInput,
    initialLoading,
    loading,
    tab,
    setTab,
    counts,
    handleDelete,
  } = useFiles();
  const [successOpen, setSuccessOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDeleteId, setFileToDeleteId] = useState("");
  const [fileToDelete, setFileToDelete] = useState<iFileToDelete | null>(null);
  const [fileToDeleteError, setFileToDeleteError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Si se llega después de eliminar un file desde su perfil, mostrar el aviso (una sola vez)
  useEffect(() => {
    if ((location.state as { fileDeleted?: boolean } | null)?.fileDeleted) {
      setSuccessOpen(true);
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [location, navigate]);

  if (initialLoading) return <LoadingScreen />;

  const handleView = (id: string) => navigate(`/files/profile/${id}`);

  // Antes de confirmar se carga el detalle, para mostrar qué se va a eliminar
  const handleDeleteConfirm = (id: string, e?: MouseEvent) => {
    e?.stopPropagation();
    setFileToDeleteId(id);
    setFileToDelete(null);
    setFileToDeleteError(false);
    setDeleteDialogOpen(true);
    getFileById(id).then((data) => {
      if (data) setFileToDelete(data);
      else setFileToDeleteError(true);
    });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    const ok = await handleDelete(fileToDeleteId);
    setDeleting(false);
    setDeleteDialogOpen(false);
    if (ok) setSuccessOpen(true);
    else setErrorOpen(true);
  };

  // Mensaje cuando la pestaña no tiene files; si hay resultados en la otra, se ofrece ir
  const otherTab: FileTab = tab === "current" ? "finished" : "current";
  const tabName = { current: "Vigentes", finished: "Finalizados" };
  const otherCount = counts?.[otherTab] ?? 0;

  const emptyMessage = (
    <>
      <Typography variant="body1" color="text.secondary">
        {search
          ? `No hay resultados para "${search}" en ${tabName[tab]}.`
          : tab === "current"
            ? "No hay viajes vigentes."
            : "Todavía no hay files finalizados."}
      </Typography>
      {search && otherCount > 0 && (
        <Button size="small" sx={{ mt: 1 }} onClick={() => setTab(otherTab)}>
          Ver {otherCount} en {tabName[otherTab]}
        </Button>
      )}
    </>
  );

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
          title="Files"
          description="Cada file es un viaje vendido, con sus pasajeros, servicios y pagos. Tocá uno para verlo."
          action={{ label: "Crear un file", icon: <NoteAddIcon />, to: "/files/create" }}
        />
        <SearchBox
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Buscá por número de file (ej. 55), destino o pasajero"
        />

        <FileTabs tab={tab} onChange={setTab} counts={counts} />

        <Box sx={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
          <FileTable
            files={files}
            emptyMessage={emptyMessage}
            showTripStatus={tab === "current"}
            onView={handleView}
            onDeleteConfirm={handleDeleteConfirm}
          />
        </Box>

        <TablePaginationBar
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </Box>

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

      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setErrorOpen(false)} severity="error">
          No se pudo eliminar el file. Intentá de nuevo.
        </Alert>
      </Snackbar>

      {/* Confirmación: muestra qué contiene el file antes de eliminarlo */}
      <FileDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        file={fileToDelete}
        fileError={fileToDeleteError}
        deleting={deleting}
      />
    </Box>
  );
};

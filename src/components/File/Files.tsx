import { useState, MouseEvent } from "react";
import { Box, Snackbar, Alert, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "../LoadingScreen";
import { useFiles, FileTab } from "./hooks/useFiles";
import { FileTabs } from "./components/FileTabs";
import { FileSearchBar } from "./components/FileSearchBar";
import { FileTable } from "./components/FileTable";
import { FileDeleteDialog } from "./components/FileDeleteDialog";
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

  const navigate = useNavigate();

  if (initialLoading) return <LoadingScreen />;

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
      <FileSearchBar
        searchTerm={searchInput}
        onSearchChange={setSearchInput}
        onAdd={handleAdd}
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

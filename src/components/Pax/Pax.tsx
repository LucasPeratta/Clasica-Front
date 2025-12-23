import { useState, useEffect } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { deletePax, getPax } from "./handler";
import type { iPax } from "./model";
import { LoadingScreen } from "../LoadingScreen";
import { PaxSearchBar } from "./components/PaxSearchBar";
import { PaxTable } from "./components/PaxTable";
import { PaxDeleteDialog } from "./components/PaxDeleteDialog";

export const Pax = (): JSX.Element => {
  const [pax, setPax] = useState<iPax[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paxToDeleteId, setPaxToDeleteId] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPax = async () => {
      setLoading(true);
      try {
        const data = await getPax();
        const sortedPax = (data || []).sort((a, b) =>
          `${a.lastname} ${a.firstname}`.localeCompare(
            `${b.lastname} ${b.firstname}`
          )
        );
        setPax(sortedPax);
      } catch (error) {
        console.error("Error al cargar pasajeros:", error);
        setPax([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPax();
  }, []);

  if (loading) return <LoadingScreen />;

  const filteredPax = pax.filter((p) =>
    `${p.lastname} ${p.firstname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => navigate("/paxs/create");
  const handleView = (id: string) => navigate(`/paxs/profile/${id}`);

  const askDelete = (id: string) => {
    setPaxToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    deletePax(paxToDeleteId).then(() => {
      setPax((prev) => prev.filter((p) => p.id !== paxToDeleteId));
      setSuccessOpen(true);
      setDeleteDialogOpen(false);
    });
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
      {/* Barra de búsqueda */}
      <PaxSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={handleAdd}
      />

      {/* Tabla */}
      <PaxTable pax={filteredPax} onView={handleView} onDelete={askDelete} />

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

      {/* Diálogo de confirmación */}
      <PaxDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

import { useState, useEffect, MouseEvent } from "react";
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { deleteFile, getFile } from "./handler";
import { LoadingScreen } from "../LoadingScreen";
import { iFile } from "./model";

export const Files = (): JSX.Element => {
  const [files, setFiles] = useState<iFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDeleteId, setFileToDeleteId] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getFile().then((data) => {
      const sorted = data.sort((a, b) =>
        a.fechaSalida && b.fechaSalida
          ? a.fechaSalida < b.fechaSalida
            ? -1
            : 1
          : 0
      );
      setFiles(sorted);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingScreen />;

  // normalizador para buscar por destino o pax
  const normalize = (s: string) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  const terms = normalize(searchTerm).split(" ").filter(Boolean);

  const filteredFiles = files
    .filter((f) => {
      if (!terms.length) return true;

      const dest = normalize(f.destino);
      const firstPax = f.clients?.[0];
      const paxName = firstPax
        ? normalize(`${firstPax.lastname} ${firstPax.firstname}`)
        : "";

      return terms.every((t) => dest.includes(t) || paxName.includes(t));
    })
    .sort((a, b) => {
      if (a.fechaSalida && b.fechaSalida)
        return a.fechaSalida < b.fechaSalida ? -1 : 1;
      return 0;
    });

  const handleAdd = () => navigate("/files/create");
  const handleView = (id: string) => navigate(`/files/profile/${id}`);

  const handleDeleteConfirm = (id: string, e?: MouseEvent) => {
    // no dejar que el click borre y navegue
    e?.stopPropagation();
    setFileToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteFile(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setSuccessOpen(true);
    setDeleteDialogOpen(false);
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 6 },
        py: 3,
        background: "linear-gradient(135deg, #eaf3ff 0%, #dfeefe 100%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Header: buscador + botón */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          placeholder="Buscar por destino o pasajero..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* botón lindo como en Pax */}
        <Button
          variant="contained"
          onClick={handleAdd}
          startIcon={<AddIcon />}
          sx={{
            textTransform: "uppercase",
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            py: 1,
            background: "linear-gradient(135deg, #007bff 0%, #6f42c1 100%)",
            boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
            color: "#fff",
            "& .MuiSvgIcon-root": {
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: "50%",
              padding: "4px",
              fontSize: "1.2rem",
            },
            "&:hover": {
              background: "linear-gradient(135deg, #0056d2 0%, #5936a2 100%)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            },
          }}
        >
          Nuevo file
        </Button>
      </Paper>

      {/* Tabla */}
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          borderRadius: 2,
          overflowY: "auto",
          maxHeight: "70vh",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Destino</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Primer pasajero
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Fecha de salida
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Tarifa total
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredFiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron resultados para “{searchTerm}”.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredFiles.map((row, i) => {
                const firstPax = row.clients?.[0];
                const paxName = firstPax
                  ? `${firstPax.lastname} ${firstPax.firstname}`
                  : "—";

                return (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => handleView(row.id)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor:
                        i % 2
                          ? "rgba(255,255,255,0.7)"
                          : "rgba(255,255,255,0.9)",
                      "&:hover": {
                        backgroundColor: "rgba(2,136,209,0.08)",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>
                      {row.destino}
                    </TableCell>
                    <TableCell align="center">{paxName}</TableCell>
                    <TableCell align="center">
                      {dayjs(row.fechaSalida).format("DD-MM-YYYY")}
                    </TableCell>
                    <TableCell align="center">
                      {row.tarifaTotal && !isNaN(Number(row.tarifaTotal))
                        ? `$${Number(row.tarifaTotal).toFixed(2)}`
                        : "—"}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Eliminar file">
                        <IconButton
                          color="error"
                          onClick={(e) => handleDeleteConfirm(row.id, e)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Notificación */}
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

      {/* Confirmación de borrado */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este file?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={() => handleDelete(fileToDeleteId)}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

import { useState, useEffect } from "react";
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
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { deletePax, getPax } from "./handler";
import type { iPax } from "./model";
import { LoadingScreen } from "../LoadingScreen";

function initials(lastname: string, firstname: string) {
  const a = (lastname || "").trim()[0] ?? "";
  const b = (firstname || "").trim()[0] ?? "";
  return (a + b).toUpperCase();
}

export const Pax = (): JSX.Element => {
  const [pax, setPax] = useState<iPax[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paxToDeleteId, setPaxToDeleteId] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getPax().then((data) => {
      const sortedPax = data.sort((a, b) =>
        `${a.lastname} ${a.firstname}`.localeCompare(
          `${b.lastname} ${b.firstname}`
        )
      );
      setPax(sortedPax);
      setLoading(false);
    });
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

  const handleDelete = (id: string) => {
    deletePax(id).then(() => {
      setPax((prev) => prev.filter((p) => p.id !== id));
      setSuccessOpen(true);
    });
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
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderRadius: 2,
        }}
      >
        <TextField
          fullWidth
          placeholder="Buscar pasajero"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#fff",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleAdd}
          startIcon={<AddIcon />}
          sx={{
            textTransform: "uppercase",
            fontWeight: 600,
            borderRadius: 8,
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
          Nuevo pasajero
        </Button>
      </Paper>

      {/* Tabla */}
      <TableContainer
        component={Paper}
        elevation={1}
        sx={{
          maxHeight: "64vh",
          overflowY: "auto",
          borderRadius: 2,
        }}
      >
        <Table stickyHeader size="medium" aria-label="tabla de pasajeros">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: "40%" }}>
                APELLIDO & NOMBRE
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: "35%" }}>
                EMAIL
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: "15%" }}>
                TELÉFONO
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: "10%" }} align="right">
                ACCIONES
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredPax.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay resultados para “{searchTerm}”.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPax.map((row, idx) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => handleView(row.id)}
                  sx={{
                    backgroundColor:
                      idx % 2
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(255,255,255,0.9)",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "rgba(2,136,209,0.08)" },
                  }}
                >
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        sx={{ bgcolor: "primary.main", width: 34, height: 34 }}
                      >
                        {initials(row.lastname, row.firstname)}
                      </Avatar>
                      <Typography sx={{ fontWeight: 600 }}>
                        {row.lastname} {row.firstname}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ color: "text.primary" }}>
                      {row.email || "—"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ color: "text.secondary" }}>
                      {row.phoneNumber || "—"}
                    </Typography>
                  </TableCell>

                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        color="primary"
                        onClick={() => handleView(row.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        color="error"
                        onClick={() => askDelete(row.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

      {/* Confirmación de borrado */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este pasajero?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            color="error"
            onClick={() => {
              setDeleteDialogOpen(false);
              handleDelete(paxToDeleteId);
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

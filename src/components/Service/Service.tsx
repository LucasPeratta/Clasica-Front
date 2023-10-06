import { useState, useEffect } from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { getService, softDeleteService } from "./handler";
import { LoadingScreen } from "../LoadingScreen";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import { iService } from "./model";

export const Service = (): JSX.Element => {
  const [service, setService] = useState<iService[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorNotificationOpen, setErrorNotificationOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDeleteId, setServiceToDeleteId] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    getService().then((data) => {
      setLoading(true);

      const sortedService = data.sort((a, b) =>
        a.createdAt && b.createdAt ? (a.createdAt > b.createdAt ? -1 : 1) : 0
      );
      setService(sortedService);
      setLoading(false);
    });
  }, [setService, setLoading]);

  if (loading) {
    return <LoadingScreen />;
  }

  const filteredService = service.filter((p) =>
    `${p.provider}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddButtonClick = () => {
    navigate("/services/create");
  };

  const handleViewserviceBottomClick = (id: string) => {
    navigate(`/services/profile/${id}`);
  };

  const openDeletedNotification = () => {
    setErrorNotificationOpen(true);
  };

  const handleDeleteButtonClick = (id: string) => {
    setServiceToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteService = async (idService: string) => {
    const response = await softDeleteService(idService);
    console.log(response);
    if (response?.ok) {
      openDeletedNotification();
      setDeleteDialogOpen(false);
      setService((prevService) => {
        return prevService.filter((service) => service.id !== idService);
      });
    }
  };

  return (
    <div style={{ margin: "0 80px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
          margin: "auto",
        }}
      >
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            margin: "auto",
            display: "flex",
            alignItems: "center",
            flex: 1,
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Buscar service"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
        <Fab
          color="success"
          aria-label="add"
          sx={{ ml: 2 }}
          onClick={handleAddButtonClick}
        >
          <AddIcon />
        </Fab>
      </div>

      <TableContainer
        component={Paper}
        style={{ maxHeight: "53em", overflowY: "auto" }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow
              style={{ position: "sticky", top: 0, background: "#FFF" }}
            >
              <TableCell>
                <Typography variant="subtitle1" fontWeight="bold">
                  Proveedor
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  PRECIO NETO
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  TARIFA
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  $
                </Typography>
              </TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredService.map((service) => (
              <TableRow key={service.id}>
                <TableCell component="th" scope="row">
                  {`${service.provider}`}
                </TableCell>
                <TableCell align="right">{service.precioNeto}</TableCell>
                <TableCell align="right">{service.tarifa}</TableCell>
                <TableCell align="right">{service.currency}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Eliminar service" placement="top">
                    <IconButton
                      aria-label="delete"
                      color="error"
                      onClick={() => handleDeleteButtonClick(service.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ver Detalles" placement="top">
                    <IconButton
                      aria-label="details"
                      color="primary"
                      onClick={() => handleViewserviceBottomClick(service.id)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={errorNotificationOpen}
        autoHideDuration={3000}
        onClose={() => setErrorNotificationOpen(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={() => setErrorNotificationOpen(false)}
          severity="success"
        >
          Servicio eliminado con exito!
        </Alert>
      </Snackbar>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este Servicio?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              handleDeleteService(serviceToDeleteId);
            }}
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

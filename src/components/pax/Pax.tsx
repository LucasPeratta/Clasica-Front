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
import { deletePax, getPax } from "./handler";
import type { iPax } from "./model";
import { Alert, Snackbar } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { LoadingScreen } from "../LoadingScreen";

export const Pax = (): JSX.Element => {
  const [pax, setPax] = useState<iPax[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorNotificationOpen, setErrorNotificationOpen] = useState(false);
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

  if (loading) {
    return <LoadingScreen />;
  }

  const filteredPax = pax.filter((p) =>
    `${p.lastname} ${p.firstname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleAddButtonClick = () => {
    navigate("/paxs/create");
  };

  const handleViewPaxBottomClick = (id: string) => {
    navigate(`/paxs/profile/${id}`);
  };

  const openErrorNotification = () => {
    setErrorNotificationOpen(true);
  };

  const handleDeleteButtonClick = (id: string) => {
    setPaxToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeletePax = (id: string) => {
    deletePax(id).then(() => {
      setPax((prevPax) => prevPax.filter((pax) => pax.id !== id));
      openErrorNotification();
    });
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
            placeholder="Buscar Pax"
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
                  APELLIDO & NOMBRE
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  EMAIL
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  PhoneNumber
                </Typography>
              </TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPax.map((pax) => (
              <TableRow key={pax.id}>
                <TableCell component="th" scope="row">
                  {`${pax.lastname} ${pax.firstname} `}
                </TableCell>
                <TableCell align="right">{pax.email}</TableCell>
                <TableCell align="right">{pax.phoneNumber}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Eliminar pax" placement="top">
                    <IconButton
                      aria-label="delete"
                      color="error"
                      onClick={() => handleDeleteButtonClick(pax.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ver Detalles" placement="top">
                    <IconButton
                      aria-label="details"
                      color="primary"
                      onClick={() => handleViewPaxBottomClick(pax.id)}
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
          Pax eliminado con exito!
        </Alert>
      </Snackbar>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este Pax?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              handleDeletePax(paxToDeleteId);
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

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
import { deleteFile, getFile } from "./handler";
import type { iFile } from "../model";
import dayjs from "dayjs";
import { Alert, Snackbar } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { LoadingScreen } from "../LoadingScreen";

export const Files = (): JSX.Element => {
  const [file, setFile] = useState<iFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorNotificationOpen, setErrorNotificationOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDeleteId, setFileToDeleteId] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getFile().then((data) => {
      const sortedfile = data.sort((a, b) =>
        a.fechaSalida && b.fechaSalida
          ? a.fechaSalida < b.fechaSalida
            ? -1
            : 1
          : 0
      );
      setFile(sortedfile);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const searchTerms = searchTerm.toLowerCase().split(" ");

  const filteredfile = file
    .filter(
      (p) =>
        !searchTerm ||
        p.clients.some((client) =>
          searchTerms.every(
            (term) =>
              client.lastname.toLowerCase().includes(term) ||
              client.firstname.toLowerCase().includes(term)
          )
        )
    )
    .sort((a, b) => {
      if (!searchTerm) {
        // If no search term, show files without clients first
        if (a.clients.length === 0 && b.clients.length > 0) return -1;
        if (a.clients.length > 0 && b.clients.length === 0) return 1;
      }
      // Sort by other criteria (you can adjust this part as needed)
      return a.fechaSalida && b.fechaSalida
        ? a.fechaSalida < b.fechaSalida
          ? -1
          : 1
        : 0;
    });

  const handleAddButtonClick = () => {
    navigate("/files/create");
  };

  const handleViewfileBottomClick = (id: string) => {
    navigate(`/files/profile/${id}`);
  };

  const openErrorNotification = () => {
    setErrorNotificationOpen(true);
  };

  const handleDeleteButtonClick = (id: string) => {
    setFileToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteFile = (id: string) => {
    deleteFile(id).then(() => {
      setFile((prevFile) => prevFile.filter((file) => file.id !== id));
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
            placeholder="Buscar file..."
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
                  DESTINO
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  FECHA DE SALIDA
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  TARIFA
                </Typography>
              </TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredfile.map((file) => (
              <TableRow key={file.id}>
                <TableCell component="th" scope="row">
                  {`${file.destino}`}
                </TableCell>
                <TableCell align="right">
                  {dayjs(file.fechaSalida).format("DD-MM-YYYY")}
                </TableCell>
                <TableCell align="right">{file.tarifaTotal}</TableCell>

                <TableCell align="right">
                  <Tooltip title="Eliminar file" placement="top">
                    <IconButton
                      aria-label="delete"
                      color="error"
                      onClick={() => handleDeleteButtonClick(file.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Ver Detalles" placement="top">
                    <IconButton
                      aria-label="details"
                      color="primary"
                      onClick={() => handleViewfileBottomClick(file.id)}
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
          File eliminado con exito!
        </Alert>
      </Snackbar>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este FILE?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              handleDeleteFile(fileToDeleteId);
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

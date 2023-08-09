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

export const Files = (): JSX.Element => {
  const [file, setFile] = useState<iFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getFile().then((data) => {
      const sortedfile = data.sort((a, b) =>
        a.fechaSalida && b.fechaSalida
          ? a.fechaSalida < b.fechaSalida
            ? -1
            : 1
          : 0
      );
      setFile(sortedfile);
    });
  }, []);

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

  const handleDeleteButtonClick = (id: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este FILE?"
    );
    if (confirmed) {
      deleteFile(id).then(() => {
        setFile((prevFile) => prevFile.filter((file) => file.id !== id));
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
            placeholder="Buscar file"
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
    </div>
  );
};

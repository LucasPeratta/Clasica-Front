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

interface Currency {
  usd: string;
  pesos: string;
  euro: string;
}

interface Service {
  id: string;
  provider: string;
  neto: string;
  currency: Currency;
  obs: string;
}

const getService = async (): Promise<Service[]> => {
  try {
    const response = await fetch("http://localhost:3001/api/service");
    const data = await response.json();
    return data.services;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const Service = (): JSX.Element => {
  const [service, setService] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getService().then((data) => {
      const sortedService = data.sort((a, b) =>
        `${a.provider}`.localeCompare(`${b.provider}`)
      );
      setService(sortedService);
    });
  }, []);

  const filteredservice = service.filter((p) =>
    `${p.provider} `.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddButtonClick = () => {
    navigate("/service/create");
  };

  return (
    <>
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
                  NOMBRE MAYORISTA
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  PRECIO NETO
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  OBSERVACIONES
                </Typography>
              </TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredservice.map((service) => (
              <TableRow key={service.id}>
                <TableCell component="th" scope="row">
                  {service.provider}
                </TableCell>
                <TableCell align="right">{`${service.neto} ${service.currency}`}</TableCell>
                <TableCell align="right">{service.obs}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Eliminar service" placement="top">
                    <IconButton aria-label="delete" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ver Detalles" placement="top">
                    <IconButton aria-label="details" color="primary">
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

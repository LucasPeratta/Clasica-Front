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

interface Pax {
  id: string;
  firstname: string;
  lastname: string;
  dni: string;
  passport: string;
  dob: string;
  adress: string;
  email: string;
  PhoneNumber: string;
  obs: string;
}

const getPax = async (): Promise<Pax[]> => {
  try {
    const response = await fetch("http://localhost:3001/api/pax");
    const data = await response.json();
    return data.paxs;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const deletePax = async (id: string): Promise<void> => {
  try {
    await fetch(`http://localhost:3001/api/pax/${id}`, {
      method: "DELETE",
    });
    console.log("Pax deleted successfully");
  } catch (error) {
    console.error(error);
  }
};

export const Pax = (): JSX.Element => {
  const [pax, setPax] = useState<Pax[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getPax().then((data) => {
      const sortedPax = data.sort((a, b) =>
        `${a.lastname} ${a.firstname}`.localeCompare(
          `${b.lastname} ${b.firstname}`
        )
      );
      setPax(sortedPax);
    });
  }, []);

  const filteredPax = pax.filter((p) =>
    `${p.lastname} ${p.firstname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  console.log(searchTerm);

  const handleAddButtonClick = () => {
    navigate("/paxs/create");
  };

  const handleViewPaxBottomClick = (id: string) => {
    navigate(`/paxs/allAboutPax/${id}`);
  };

  const handleDeleteButtonClick = (id: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este pasajero?"
    );
    if (confirmed) {
      deletePax(id).then(() => {
        setPax((prevPax) => prevPax.filter((pax) => pax.id !== id));
      });
    }
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
                <TableCell align="right">{pax.PhoneNumber}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Eliminar Pax" placement="top">
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
    </>
  );
};

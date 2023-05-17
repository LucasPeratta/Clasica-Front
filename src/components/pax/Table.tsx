import { usePax } from "./Pasajeros";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";

export const TableComponent = (): JSX.Element => {
  const pax = usePax();

  return (
    <>
      <Paper
        component="form"
        sx={{ p: "2px 4px", display: "flex", alignItems: "center", width: 400 }}
      >
        <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Buscar Pax" />
        <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Apellido y Nombre</TableCell>
              <TableCell align="right">email</TableCell>
              <TableCell align="right">dob</TableCell>
              <TableCell align="right">obs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pax.map((pax) => (
              <TableRow key={pax.id}>
                <TableCell component="th" scope="row">
                  {pax.firstname}
                </TableCell>
                <TableCell align="right">{pax.email}</TableCell>
                <TableCell align="right">{pax.dob}</TableCell>
                <TableCell align="right">{pax.obs}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

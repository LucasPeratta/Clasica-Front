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

interface Pax {
  id: number;
  firstname: string;
  email: string;
  dob: string;
  obs: string;
}

//fetchPax es una función asincrónica que devuelve una promesa de tipo Pax[]
//La función fetch devuelve una promesa que representa la respuesta HTTP.
//response.json() es otro método asincrónico que extrae los datos del cuerpo de la respuesta HTTP en formato JSON.
//Devuelve una promesa que se resuelve con los datos JSON obtenidos.
const fetchPax = async (): Promise<Pax[]> => {
  try {
    const response = await fetch("http://localhost:3001/api/pax");
    const data = await response.json();
    return data.paxs;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const Pax = (): JSX.Element => {
  const [pax, setPax] = useState<Pax[]>([]);
  useEffect(() => {
    fetchPax().then((data) => {
      setPax(data);
    });
  }, []);

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

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getPaxById } from "./handler";
import { iPax } from "../model";
import dayjs from "dayjs";
import { LoadingScreen } from "../LoadingScreen";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
  Button,
} from "@mui/material";

export const PaxProfile = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [pax, setPax] = useState<iPax | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPaxById(id)
      .then((data) => {
        setPax(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id]);

  if (!pax) {
    return <div>Error</div>;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {pax.firstname} {pax.lastname}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>DNI:</TableCell>
              <TableCell>{pax.dni}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Pasaporte:</TableCell>
              <TableCell>{pax.passport}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fecha de Nacimiento:</TableCell>
              <TableCell>{dayjs(pax.dob).format("DD-MM-YYYY")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Dirección:</TableCell>
              <TableCell>{pax.adress}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Email:</TableCell>
              <TableCell>{pax.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Celular:</TableCell>
              <TableCell>{pax.phoneNumber}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Observaciones:</TableCell>
              <TableCell>
                <Typography style={{ whiteSpace: "pre-wrap" }}>
                  {pax.obs}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Button component={Link} to={`/paxs`} variant="outlined" sx={{ mt: 2 }}>
        Volver
      </Button>
      <Button
        component={Link}
        to={`/paxs/update/${pax.id}`}
        variant="contained"
        color="primary"
        sx={{ ml: 2, mt: 2 }}
      >
        Editar
      </Button>
    </div>
  );
};

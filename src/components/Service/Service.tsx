import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FlightIcon from "@mui/icons-material/Flight";
import HotelIcon from "@mui/icons-material/Hotel";
import HikingIcon from "@mui/icons-material/Hiking";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import { getServicePage } from "./handler";
import { iService } from "./model";
import { LoadingScreen } from "../LoadingScreen";
import { usePaginatedList } from "../common/Pagination/usePaginatedList";
import { TablePaginationBar } from "../common/Pagination/TablePaginationBar";
import { PageHeader } from "../common/PageHeader";
import { SearchBox } from "../common/SearchBox";
import { formatFileNumber } from "../File/utils/fileNumber";
import { formatMoney } from "../File/utils/totals";

const TYPES: Record<string, { label: string; icon: JSX.Element }> = {
  AEREO: { label: "Aéreo", icon: <FlightIcon /> },
  HOTEL: { label: "Hotel", icon: <HotelIcon /> },
  EXCURSION: { label: "Excursión", icon: <HikingIcon /> },
  TRASLADO: { label: "Traslado", icon: <AirportShuttleIcon /> },
};

const headSx = { fontWeight: 700, fontSize: "0.95rem", color: "#0D5B75", backgroundColor: "#f2f8fa" };

const formatAmount = (amount: string, currency: string) =>
  amount && !isNaN(Number(amount)) ? formatMoney(Number(amount), currency) : "—";

const formatDates = (service: iService) => {
  const start = service.fechaInicio ? dayjs(service.fechaInicio).format("DD/MM/YYYY") : null;
  const end = service.fechaFin ? dayjs(service.fechaFin).format("DD/MM/YYYY") : null;
  return start && end && start !== end ? `${start} al ${end}` : start || end || "—";
};

/**
 * Buscador de todos los servicios vendidos. Cada servicio es de un file:
 * se agregan, editan y eliminan desde el file, así que al tocarlo se abre ese file.
 */
export const Service = (): JSX.Element => {
  const { items: services, total, totalPages, pageSize, page, setPage, search, searchInput, setSearchInput, initialLoading, loading } =
    usePaginatedList(getServicePage);
  const navigate = useNavigate();

  if (initialLoading) return <LoadingScreen />;

  return (
    <Box
      sx={{
        px: { xs: 2, md: 6 },
        py: 3,
        backgroundImage:
          "linear-gradient(135deg, #0D5B75 0%, #1a7a99 50%, #89c2d9 100%), " +
          "radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%), " +
          "radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Box sx={{ maxWidth: 1300, mx: "auto" }}>
        <PageHeader
          title="Servicios"
          description="Todo lo vendido: aéreos, hoteles, excursiones y traslados. Tocá uno para abrir su file."
        />
        <SearchBox
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Buscá por descripción, mayorista, localizador o número de file (ej. 55)"
        />

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            backgroundColor: "#fff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
            opacity: loading ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <Table aria-label="Servicios">
            <TableHead>
              <TableRow>
                <TableCell sx={headSx}>Servicio</TableCell>
                <TableCell sx={headSx}>Mayorista</TableCell>
                <TableCell sx={headSx}>Fechas</TableCell>
                <TableCell sx={headSx}>File</TableCell>
                <TableCell sx={headSx} align="right">
                  Precio
                </TableCell>
                <TableCell sx={headSx} />
              </TableRow>
            </TableHead>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      {search
                        ? `No se encontraron servicios para "${search}".`
                        : "Todavía no hay servicios. Se agregan desde cada file."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                services.map((row) => {
                  const file = row.File?.[0];
                  const type = TYPES[row.type];
                  const open = () => file && navigate(`/files/profile/${file.id}`);
                  return (
                    <TableRow
                      key={row.id}
                      hover
                      onClick={open}
                      sx={{ cursor: file ? "pointer" : "default", "&:hover": { backgroundColor: "#f2f8fa" } }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box sx={{ color: "#0D5B75", display: "flex" }}>{type?.icon}</Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>{row.nombre || "Sin descripción"}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {type?.label ?? row.type}
                              {row.localizador ? ` · Localizador ${row.localizador}` : ""}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{row.provider || "—"}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDates(row)}
                        {row.liquidado && (
                          <Chip size="small" color="success" variant="outlined" label="Liquidado" sx={{ ml: 1, fontWeight: 600 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {file ? (
                          <>
                            <Typography sx={{ fontWeight: 700, color: "#0D5B75" }}>{formatFileNumber(file) || "—"}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {file.destino}
                            </Typography>
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Typography sx={{ fontWeight: 600 }}>{formatAmount(row.tarifa, row.currency)}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Costo {formatAmount(row.precioNeto, row.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ width: 48 }}>
                        {file && <ChevronRightIcon sx={{ color: "#9db1b8" }} />}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePaginationBar page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </Box>
    </Box>
  );
};

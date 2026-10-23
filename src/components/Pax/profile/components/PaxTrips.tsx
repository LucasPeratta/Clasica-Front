import { useEffect, useState } from "react";
import { Box, Chip, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getPaxFiles, iPaxFile } from "../../handler";
import { formatFileNumber } from "../../../File/utils/fileNumber";
import { formatMoney } from "../../../File/utils/totals";
import { InfoCard } from "./PaxProfileData";

// "con Federico Gómez", "con Federico Gómez y 2 más"
const companionsText = (file: iPaxFile) => {
  const others = file.acompanantes ?? [];
  if (others.length === 0) return "viajó solo/a";
  const first = `${others[0].firstname} ${others[0].lastname}`;
  return others.length === 1 ? `con ${first}` : `con ${first} y ${others.length - 1} más`;
};

// Si pagó y si está facturado
const TripStatus = ({ file }: { file: iPaxFile }) => (
  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
    {file.estado === "PAGADO" ? (
      <Chip size="small" color="success" variant="outlined" label="Pagado ✓" sx={{ fontWeight: 600 }} />
    ) : file.moneda && file.falta ? (
      <Chip
        size="small"
        color={file.estado === "VENCIDO" ? "error" : "default"}
        variant="outlined"
        label={`Debe ${formatMoney(file.falta, file.moneda)}`}
        sx={{ fontWeight: 600 }}
      />
    ) : null}
    {file.facturado && <Chip size="small" color="success" label="Facturado" sx={{ fontWeight: 600 }} />}
  </Box>
);

const TripLine = ({ file, upcoming }: { file: iPaxFile; upcoming: boolean }) => {
  const navigate = useNavigate();
  const days = dayjs(file.fechaSalida).startOf("day").diff(dayjs().startOf("day"), "day");
  const open = () => navigate(`/files/profile/${file.id}`);
  return (
    <Box
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => e.key === "Enter" && open()}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.25,
        px: 1,
        mx: -1,
        borderRadius: 2,
        cursor: "pointer",
        borderBottom: "1px solid #eef2f4",
        "&:last-of-type": { borderBottom: "none" },
        "&:hover, &:focus-visible": { backgroundColor: "#f2f8fa", outline: "none" },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700 }}>{file.destino}</Typography>
        <Typography variant="body2" color="text.secondary">
          {formatFileNumber(file) ? `File ${formatFileNumber(file)} · ` : ""}
          {upcoming
            ? `sale ${days === 0 ? "hoy" : days === 1 ? "mañana" : `en ${days} días`} (${dayjs(file.fechaSalida).format("DD/MM/YYYY")})`
            : `salió el ${dayjs(file.fechaSalida).format("DD/MM/YYYY")}`}
          {" · "}
          {companionsText(file)}
        </Typography>
      </Box>
      <Box sx={{ textAlign: "right" }}>
        {file.moneda && file.total ? (
          <Typography sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{formatMoney(file.total, file.moneda)}</Typography>
        ) : null}
        <TripStatus file={file} />
      </Box>
      <ChevronRightIcon sx={{ color: "#9db1b8" }} />
    </Box>
  );
};

const SectionTitle = ({ children }: { children: string }) => (
  <Typography sx={{ fontSize: "0.85rem", color: "#5b6d74", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, mt: 1 }}>
    {children}
  </Typography>
);

/**
 * Historial de viajes del pasajero: los próximos y los anteriores (agrupados por año),
 * con con quién viajó, cuánto costó, si pagó y si está facturado. Cada uno lleva a su file.
 */
export const PaxTrips = ({ paxId }: { paxId: string }) => {
  const [files, setFiles] = useState<iPaxFile[] | null>(null);

  useEffect(() => {
    getPaxFiles(paxId)
      .then(setFiles)
      .catch(() => setFiles([]));
  }, [paxId]);

  const today = dayjs().startOf("day");
  const upcoming = (files ?? [])
    .filter((f) => !dayjs(f.fechaSalida).isBefore(today, "day"))
    .sort((a, b) => dayjs(a.fechaSalida).valueOf() - dayjs(b.fechaSalida).valueOf());
  const past = (files ?? []).filter((f) => dayjs(f.fechaSalida).isBefore(today, "day"));
  const pastYears = [...new Set(past.map((f) => dayjs(f.fechaSalida).year()))];

  // "8 viajes · viaja con nosotros desde 2023"
  const firstYear = files && files.length > 0 ? Math.min(...files.map((f) => dayjs(f.fechaSalida).year())) : null;
  const summary =
    files && files.length > 0
      ? `${files.length === 1 ? "1 viaje" : `${files.length} viajes`}${firstYear && firstYear < dayjs().year() ? ` · viaja con nosotros desde ${firstYear}` : ""}`
      : "";

  return (
    <InfoCard title={summary ? `Viajes (${summary})` : "Viajes"} icon={<FlightTakeoffIcon />}>
      {files === null ? (
        <CircularProgress size={24} />
      ) : files.length === 0 ? (
        <Typography color="text.secondary">Todavía no viajó con nosotros.</Typography>
      ) : (
        <>
          {upcoming.length > 0 && (
            <Box>
              <SectionTitle>Próximos</SectionTitle>
              {upcoming.map((f) => (
                <TripLine key={f.id} file={f} upcoming />
              ))}
            </Box>
          )}
          {pastYears.map((year) => (
            <Box key={year}>
              <SectionTitle>{`Viajes de ${year}`}</SectionTitle>
              {past
                .filter((f) => dayjs(f.fechaSalida).year() === year)
                .map((f) => (
                  <TripLine key={f.id} file={f} upcoming={false} />
                ))}
            </Box>
          ))}
        </>
      )}
    </InfoCard>
  );
};

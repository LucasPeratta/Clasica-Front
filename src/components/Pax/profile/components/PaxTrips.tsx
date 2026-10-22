import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getPaxFiles, iPaxFile } from "../../handler";
import { formatFileNumber } from "../../../File/utils/fileNumber";
import { InfoCard } from "./PaxProfileData";

const TripLine = ({ file, upcoming }: { file: iPaxFile; upcoming: boolean }) => {
  const navigate = useNavigate();
  const days = dayjs(file.fechaSalida).startOf("day").diff(dayjs().startOf("day"), "day");
  return (
    <Box
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/files/profile/${file.id}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/files/profile/${file.id}`)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: 1,
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
        <Typography sx={{ fontWeight: 600 }}>{file.destino}</Typography>
        <Typography variant="body2" color="text.secondary">
          {formatFileNumber(file) ? `File ${formatFileNumber(file)} · ` : ""}
          {upcoming
            ? `sale ${days === 0 ? "hoy" : days === 1 ? "mañana" : `en ${days} días`} (${dayjs(file.fechaSalida).format("DD/MM/YYYY")})`
            : `salió el ${dayjs(file.fechaSalida).format("DD/MM/YYYY")}`}
        </Typography>
      </Box>
      <ChevronRightIcon sx={{ color: "#9db1b8" }} />
    </Box>
  );
};

/**
 * Viajes del pasajero (próximos y anteriores), para entrar directo al file
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

  return (
    <InfoCard title="Viajes" icon={<FlightTakeoffIcon />}>
      {files === null ? (
        <CircularProgress size={24} />
      ) : files.length === 0 ? (
        <Typography color="text.secondary">Todavía no viajó con nosotros.</Typography>
      ) : (
        <>
          {upcoming.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: "0.85rem", color: "#5b6d74", mb: 0.5 }}>Próximos</Typography>
              {upcoming.map((f) => (
                <TripLine key={f.id} file={f} upcoming />
              ))}
            </Box>
          )}
          {past.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: "0.85rem", color: "#5b6d74", mb: 0.5 }}>Anteriores</Typography>
              {past.map((f) => (
                <TripLine key={f.id} file={f} upcoming={false} />
              ))}
            </Box>
          )}
        </>
      )}
    </InfoCard>
  );
};

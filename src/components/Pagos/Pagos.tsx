import { Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InsightsIcon from "@mui/icons-material/Insights";
import { CountTabs } from "../common/CountTabs";
import { CobrosTab } from "./CobrosTab";

/**
 * Sección "Pagos": cobros a pasajeros, pagos a mayoristas y balance.
 * La pestaña va en la URL (?seccion=...) para volver al mismo lugar.
 */
export const Pagos = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();
  const seccion = searchParams.get("seccion") ?? "cobros";

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
      <CountTabs
        value={seccion}
        // Al cambiar de sección se limpian búsqueda, página y filtros
        onChange={(value) => setSearchParams(value === "cobros" ? {} : { seccion: value }, { replace: true })}
        tabs={[
          { value: "cobros", label: "Cobros a pasajeros", icon: <PersonIcon /> },
          { value: "mayoristas", label: "Pagos a mayoristas", icon: <StorefrontIcon />, disabled: true, badgeText: "Próximamente" },
          { value: "balance", label: "Balance", icon: <InsightsIcon />, disabled: true, badgeText: "Próximamente" },
        ]}
      />

      {seccion === "cobros" && <CobrosTab />}
    </Box>
  );
};

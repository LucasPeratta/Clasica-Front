import { Box, Paper, Tab, Tabs } from "@mui/material";

export interface iCountTab {
  value: string;
  label: string;
  icon?: JSX.Element;
  count?: number;
  disabled?: boolean;
  // Texto chico al lado (ej. "Próximamente")
  badgeText?: string;
}

interface CountTabsProps {
  value: string;
  onChange: (value: string) => void;
  tabs: iCountTab[];
}

const Badge = ({ text, selected }: { text: string; selected: boolean }) => (
  <Box
    component="span"
    sx={{
      ml: 1,
      px: 1,
      minWidth: 24,
      lineHeight: "22px",
      borderRadius: 11,
      fontSize: "0.75rem",
      fontWeight: 700,
      textAlign: "center",
      transition: "all 0.2s ease",
      backgroundColor: selected ? "#0D5B75" : "rgba(0,0,0,0.08)",
      color: selected ? "#fff" : "text.secondary",
    }}
  >
    {text}
  </Box>
);

/**
 * Pestañas con ícono y contador, con el estilo de la app (las de files, pagos, etc.)
 */
export const CountTabs = ({ value, onChange, tabs }: CountTabsProps) => (
  <Paper
    elevation={3}
    sx={{
      mb: 2,
      px: 1,
      borderRadius: 3,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    }}
  >
    <Tabs
      value={value}
      onChange={(_, v: string) => onChange(v)}
      variant="scrollable"
      scrollButtons="auto"
      TabIndicatorProps={{
        sx: {
          height: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #0D5B75 0%, #1a7a99 100%)",
        },
      }}
    >
      {tabs.map((t) => (
        <Tab
          key={t.value}
          value={t.value}
          icon={t.icon}
          iconPosition="start"
          disabled={t.disabled}
          label={
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
              {t.label}
              {t.count !== undefined && <Badge text={String(t.count)} selected={value === t.value} />}
              {t.badgeText && <Badge text={t.badgeText} selected={false} />}
            </Box>
          }
          sx={{
            minHeight: 56,
            textTransform: "none",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "text.secondary",
            "&.Mui-selected": { color: "#0D5B75" },
            "&:hover": { color: "#0D5B75" },
          }}
        />
      ))}
    </Tabs>
  </Paper>
);

import { Box, Paper, Tab, Tabs } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import HistoryIcon from "@mui/icons-material/History";
import { FileTab } from "../hooks/useFiles";

interface FileTabsProps {
  tab: FileTab;
  onChange: (tab: FileTab) => void;
  counts?: Record<string, number>;
}

const CountBadge = ({ count, selected }: { count?: number; selected: boolean }) =>
  count === undefined ? null : (
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
      {count}
    </Box>
  );

export const FileTabs = ({ tab, onChange, counts }: FileTabsProps) => {
  const tabs: { value: FileTab; label: string; icon: JSX.Element }[] = [
    { value: "current", label: "Vigentes", icon: <FlightTakeoffIcon /> },
    { value: "finished", label: "Finalizados", icon: <HistoryIcon /> },
  ];

  return (
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
        value={tab}
        onChange={(_, value: FileTab) => onChange(value)}
        variant="fullWidth"
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
            label={
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
                {t.label}
                <CountBadge count={counts?.[t.value]} selected={tab === t.value} />
              </Box>
            }
            sx={{
              minHeight: 56,
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "text.secondary",
              transition: "color 0.2s ease",
              "&.Mui-selected": { color: "#0D5B75" },
              "&:hover": { color: "#0D5B75" },
            }}
          />
        ))}
      </Tabs>
    </Paper>
  );
};

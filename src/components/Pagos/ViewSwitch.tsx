import { Box, ButtonBase, Typography } from "@mui/material";

export interface iViewOption {
  value: string;
  label: string;
  description: string;
  icon: JSX.Element;
}

interface ViewSwitchProps {
  value: string;
  onChange: (value: string) => void;
  options: iViewOption[];
}

/**
 * Selector grande para elegir qué lista ver (una por vez), con una frase que explica cada una
 */
export const ViewSwitch = ({ value, onChange, options }: ViewSwitchProps) => (
  <Box
    role="tablist"
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: `repeat(${options.length}, 1fr)` },
      gap: 1.5,
      mb: 2,
    }}
  >
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <ButtonBase
          key={option.value}
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(option.value)}
          sx={{
            justifyContent: "flex-start",
            textAlign: "left",
            gap: 1.5,
            p: 2,
            borderRadius: 3,
            border: "2px solid",
            borderColor: selected ? "#fff" : "transparent",
            backgroundColor: selected ? "#fff" : "rgba(255,255,255,0.18)",
            color: selected ? "#0D5B75" : "#fff",
            boxShadow: selected ? "0 6px 18px rgba(0,0,0,0.18)" : "none",
            transition: "all 0.2s ease",
            "&:hover": { backgroundColor: selected ? "#fff" : "rgba(255,255,255,0.28)" },
            "&.Mui-focusVisible": { outline: "3px solid #fff", outlineOffset: 2 },
          }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              flexShrink: 0,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              backgroundColor: selected ? "#e6f1f5" : "rgba(255,255,255,0.2)",
              "& svg": { fontSize: 26 },
            }}
          >
            {option.icon}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>{option.label}</Typography>
            <Typography sx={{ fontSize: "0.9rem", opacity: selected ? 0.75 : 0.9 }}>{option.description}</Typography>
          </Box>
        </ButtonBase>
      );
    })}
  </Box>
);

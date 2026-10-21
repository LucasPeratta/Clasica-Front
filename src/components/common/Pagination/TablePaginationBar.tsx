import { Paper, Pagination, Typography } from "@mui/material";

interface TablePaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const TablePaginationBar = ({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: TablePaginationBarProps) => {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <Paper
      elevation={3}
      sx={{
        mt: 2,
        px: 2,
        py: 1.5,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Mostrando {from}–{to} de {total}
      </Typography>

      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => onPageChange(value)}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      )}
    </Paper>
  );
};

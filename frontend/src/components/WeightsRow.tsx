import {
  Box,
  Typography,
  TextField,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer
} from "@mui/material";

type Props = {
  criteria: { name: string; displayName: string }[];
  value: Record<string, number>; // 👈 контролируемое значение
  onChange: (weights: Record<string, number>) => void;
};

export default function WeightsRow({ criteria, value, onChange }: Props) {
  const handleChange = (name: string, val: string) => {
    const num = parseFloat(val);
    const newWeights = {
      ...value,
      [name]: isNaN(num) ? 0 : num
    };
    onChange(newWeights); // передаём новое значение вверх
  };

  return (
    <Box mt={2}>
      <Typography variant="subtitle1" gutterBottom>
        Веса важности критериев
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableBody>
            <TableRow>
              {criteria.map((crit) => (
                <TableCell key={crit.name}>
                  <TextField
                    type="number"
                    size="small"
                    label={crit.displayName}
                    value={String(value[crit.name] ?? "")}
                    onChange={(e) => handleChange(crit.name, e.target.value)}
                    slotProps={{ htmlInput: { step: "any" } }}
                    fullWidth
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

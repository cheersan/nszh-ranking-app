// src/components/ProjectTable.tsx
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  TableContainer,
  Button
} from "@mui/material";
import { useState, useEffect } from "react";

type Props = {
  alternatives: { company: string; name: string }[];
  criteria: { name: string; displayName: string; direction: "min" | "max" }[];
  initialMatrix: number[][]; // альт × критерий
  onUpdate: (matrix: number[][]) => void;
  isNew: boolean;
};

export default function ProjectTable({
  alternatives,
  criteria,
  initialMatrix,
  onUpdate,
  isNew
}: Props) {
  const [matrix, setMatrix] = useState<number[][]>(initialMatrix);

  useEffect(() => {
    onUpdate(matrix);
  }, [matrix]);

  useEffect(() => {
    if (isNew) {
      const newMatrix = alternatives.map(() =>
        criteria.map(() => 0)
      );
      setMatrix(newMatrix);
    }
  }, [alternatives, criteria, isNew]);


  const handleChange = (row: number, col: number, value: string) => {
    const newVal = parseFloat(value);
    if (!isNaN(newVal)) {
      const updated = [...matrix];
      updated[row][col] = newVal;
      setMatrix(updated);
    }
  };
  const handleResetMatrix = () => {
    const emptyMatrix = alternatives.map(() =>
      criteria.map(() => 0)
    );
    setMatrix(emptyMatrix);
  };
  const handleAutoFillMatrix = () => {
    const filled = alternatives.map((alt) =>
      criteria.map((crit) => {
        const value = alt[crit.name];
        if (typeof value === "number") return value;
        if (typeof value === "boolean") return value ? 1 : 0;
        return 0;
      })
    );
    setMatrix(filled);
  };



  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Таблица проекта (редактируемые значения)
      </Typography>
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Button size="small" variant="outlined" onClick={handleResetMatrix}>
          Обнулить матрицу
        </Button>
        <Button size="small" variant="outlined" onClick={handleAutoFillMatrix}>
          Заполнить автоматически
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Компания</TableCell>
              <TableCell>Программа</TableCell>
              {criteria.map((crit) => (
                <TableCell key={crit.name} align="center">
                  {crit.displayName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {alternatives.map((alt, rowIdx) => (
              <TableRow key={`${alt.company}-${alt.name}`}>
                <TableCell>{alt.company}</TableCell>
                <TableCell>{alt.name}</TableCell>
                {criteria.map((crit, colIdx) => (
                  <TableCell key={crit.name} align="center">
                    <TextField
                      type="number"
                      value={matrix[rowIdx]?.[colIdx] ?? ""}
                      onChange={(e) =>
                        handleChange(rowIdx, colIdx, e.target.value)
                      }
                      size="small"
                      slotProps={{ htmlInput: { step: "any" } }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

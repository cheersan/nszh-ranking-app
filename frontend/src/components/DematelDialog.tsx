// src/components/DematelDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField
} from "@mui/material";
import { useState, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  criteria: { name: string; displayName: string }[];
  onApply: (weights: Record<string, number>) => void;
};

export default function DematelDialog({ open, onClose, criteria, onApply }: Props) {
  const [matrix, setMatrix] = useState<number[][]>([]);

  useEffect(() => {
    if (criteria.length > 0) {
      setMatrix(
        Array(criteria.length)
          .fill(0)
          .map(() => Array(criteria.length).fill(0))
      );
    }
  }, [criteria]);

  const handleChange = (i: number, j: number, value: string) => {
    if (i === j) return; // запрет редактирования диагонали
    const newMatrix = matrix.map(row => [...row]);
    const val = parseFloat(value);
    newMatrix[i][j] = isNaN(val) ? 0 : val;
    setMatrix(newMatrix);
  };

  const handleApply = () => {
    // Встроенный алгоритм DEMATEL
    const normalize = (matrix: number[][]) => {
      const rowSums = matrix.map((row) => row.reduce((a, b) => a + b, 0));
      const maxSum = Math.max(...rowSums);
      return matrix.map((row) => row.map((val) => val / maxSum));
    };

    const matrixMultiply = (a: number[][], b: number[][]): number[][] => {
      return a.map((row, i) =>
        b[0].map((_, j) =>
          row.reduce((sum, val, k) => sum + val * b[k][j], 0)
        )
      );
    };

    const matrixInverse = (matrix: number[][]): number[][] => {
      const n = matrix.length;
      const aug = matrix.map((row, i) => [
        ...row,
        ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
      ]);

      for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(aug[j][i]) > Math.abs(aug[maxRow][i])) maxRow = j;
        }
        [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

        const pivot = aug[i][i];
        if (pivot === 0) throw new Error("Матрица не обратима");
        for (let j = 0; j < 2 * n; j++) aug[i][j] /= pivot;

        for (let k = 0; k < n; k++) {
          if (k !== i) {
            const factor = aug[k][i];
            for (let j = 0; j < 2 * n; j++) {
              aug[k][j] -= factor * aug[i][j];
            }
          }
        }
      }

      return aug.map((row) => row.slice(n));
    };

    const rowSums = (matrix: number[][]) =>
      matrix.map((row) => row.reduce((a, b) => a + b, 0));

    const colSums = (matrix: number[][]) => {
      const cols = matrix[0].length;
      const sums = Array(cols).fill(0);
      for (let j = 0; j < cols; j++) {
        for (let i = 0; i < matrix.length; i++) {
          sums[j] += matrix[i][j];
        }
      }
      return sums;
    };

    // Основной расчёт
    const X = normalize(matrix);
    const I = X.map((_, i) => X[0].map((_, j) => (i === j ? 1 : 0)));
    const IminusX = I.map((row, i) => row.map((val, j) => val - X[i][j]));
    const Y = matrixInverse(IminusX);
    const T = matrixMultiply(X, Y);
    const D = rowSums(T);
    const R = colSums(T);
    const dPlusR = D.map((d, i) => d + R[i]);
    const total = dPlusR.reduce((a, b) => a + b, 0);
    const weights = dPlusR.map((v) => parseFloat((v / total).toFixed(3)));

    // Преобразуем в объект весов
    const weightObj: Record<string, number> = {};
    criteria.forEach((c, i) => {
      weightObj[c.name] = weights[i];
    });

    onApply(weightObj);
    onClose();
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>Матрица влияния (DEMATEL)</DialogTitle>
      <DialogContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {criteria.map((c, j) => (
                <TableCell key={j} align="center">
                  {c.displayName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {criteria.map((cRow, i) => (
              <TableRow key={i}>
                <TableCell>{cRow.displayName}</TableCell>
                {criteria.map((_, j) => (
                  <TableCell key={j}>
                    {i === j ? (
                      <TextField
                        type="number"
                        size="small"
                        value={0}
                        disabled
                        slotProps={{ htmlInput: { readOnly: true } }}
                      />
                    ) : (
                      <TextField
                        type="number"
                        size="small"
                        value={matrix[i]?.[j] ?? 0}
                        onChange={(e) => handleChange(i, j, e.target.value)}
                        slotProps={{ htmlInput: { step: "any" } }}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleApply} variant="contained">ОК</Button>
      </DialogActions>
    </Dialog>
  );
}

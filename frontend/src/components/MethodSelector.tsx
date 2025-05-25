// src/components/MethodSelector.tsx
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

type Criterion = {
  name: string;
  displayName: string;
  direction: "min" | "max";
};

type Props = {
  criteria: Criterion[];
  onChange: (method: string, params: Record<string, any>) => void;
  initialMethod?: "promethee_ii" | "electre_iii";
  initialParams?: Record<string, any>;
};


const preferenceFunctions = [
  "Usual",
  "U-shape",
  "V-shape",
  "Level",
  "Linear",
  "Gaussian"
];

export default function MethodSelector({ criteria, onChange, initialMethod, initialParams }: Props) {
  const [method, setMethod] = useState<"promethee_ii" | "electre_iii">("promethee_ii");
  const [params, setParams] = useState<Record<string, any>>({});

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      if (initialMethod) setMethod(initialMethod);
      if (initialParams) setParams(initialParams);
      initialized.current = true;
    }
  }, [initialMethod, initialParams]);
;

  useEffect(() => {
    onChange(method, params);
  }, [method, params]);

  const handleParamChange = (
    critName: string,
    field: string,
    value: string | number
  ) => {
    setParams((prev) => ({
      ...prev,
      [critName]: {
        ...prev[critName],
        [field]: value
      }
    }));
  };

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Метод ранжирования
      </Typography>

      <RadioGroup
        row
        value={method}
        onChange={(e) => setMethod(e.target.value as "promethee_ii" | "electre_iii")}
      >
        <FormControlLabel
          value="promethee_ii"
          control={<Radio />}
          label="PROMETHEE II"
        />
        <FormControlLabel
          value="electre_iii"
          control={<Radio />}
          label="ELECTRE III"
        />
      </RadioGroup>

      <Typography variant="subtitle1" mt={2}>
        Параметры критериев
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Критерий</TableCell>
              {method === "promethee_ii" && <TableCell>Функция</TableCell>}
              <TableCell>q</TableCell>
              <TableCell>p</TableCell>
              <TableCell>{initialMethod === "promethee_ii" ? "s" : "v"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {criteria.map((crit) => {
              const row = params[crit.name] || {};
              return (
                <TableRow key={crit.name}>
                  <TableCell>{crit.displayName}</TableCell>
                  {method === "promethee_ii" && (
                    <TableCell>
                      <TextField
                        select
                        value={row.function || ""}
                        onChange={(e) =>
                          handleParamChange(crit.name, "function", e.target.value)
                        }
                        size="small"
                      >
                        {preferenceFunctions.map((fn) => (
                          <MenuItem key={fn} value={fn}>
                            {fn}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                  )}
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={row.q ?? ""}
                      onChange={(e) =>
                        handleParamChange(crit.name, "q", parseFloat(e.target.value))
                      }
					            slotProps={{ htmlInput: { step: "any" } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={row.p ?? ""}
                      onChange={(e) =>
                        handleParamChange(crit.name, "p", parseFloat(e.target.value))
                      }
                      slotProps={{ htmlInput: { step: "any" } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={row.v ?? ""}
                      onChange={(e) =>
                        handleParamChange(crit.name, "v", parseFloat(e.target.value))
                      }
                      slotProps={{ htmlInput: { step: "any" } }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

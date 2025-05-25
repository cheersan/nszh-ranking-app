import {
  Box,
  Button,
  Checkbox,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  FormControlLabel
} from "@mui/material";
import { useEffect, useState, useRef } from "react";

type Criterion = {
  name: string;
  displayName: string;
  direction: "min" | "max";
};

type Alternative = {
  id: number;
  company: string;
  name: string;
  rating: number;
  income: number;
  contribution: number;
  term: number;
};

type Props = {
  onSelect: ({ alternatives, criteria }: { alternatives: any[]; criteria: any[] }) => void;
  selectedAlternatives: any[];
  selectedCriteria: any[];
};


export default function AlternativeSelector({ onSelect, selectedAlternatives, selectedCriteria }: Props) {
  const [allAlternatives, setAllAlternatives] = useState<Alternative[]>([]);
  const [allCriteria, setAllCriteria] = useState<Criterion[]>([]);

  const [selectedAlts, setSelectedAlts] = useState<Set<number>>(new Set());
  const [selectedCrits, setSelectedCrits] = useState<Set<string>>(new Set());
  const [directions, setDirections] = useState<Record<string, "min" | "max">>({});
  const initialized = useRef(false);

  useEffect(() => {
    if (
      !initialized.current &&
      selectedAlternatives?.length &&
      selectedCriteria?.length
    ) {
      initialized.current = true;
      setSelectedAlts(new Set(selectedAlternatives.map((a) => a.id)));
      setSelectedCrits(new Set(selectedCriteria.map((c) => c.name)));
      setDirections(() => {
        const initial: Record<string, "min" | "max"> = {};
        selectedCriteria.forEach((c) => {
          initial[c.name] = c.direction;
        });
        return initial;
      });
      onSelect({
        alternatives: selectedAlternatives,
        criteria: selectedCriteria
      });
    }
  }, [selectedAlternatives, selectedCriteria]);

  useEffect(() => {
    const fetchData = async () => {
      const [altsRes, critsRes] = await Promise.all([
        fetch("http://localhost:3001/alternatives"),
        fetch("http://localhost:3001/criteria")
      ]);

      const [alts, crits] = await Promise.all([
        altsRes.json(),
        critsRes.json()
      ]);

      setAllAlternatives(alts);
      setAllCriteria(crits);
      const dir: Record<string, "min" | "max"> = {};
      for (const c of crits) {
        dir[c.name] = (c.direction === "min" ? "min" : "max"); // безопасно
      }
      setDirections(dir);
    };

    fetchData();
  }, []);
  
  const toggleAlt = (id: number) => {
    setSelectedAlts(prev => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 8) {
          alert("Можно выбрать не более 8 альтернатив");
          return prev; // 🔒 не меняем состояние
        }
        next.add(id);
      }

      return next;
    });
  };

  const toggleCrit = (name: string) => {
    setSelectedCrits(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };
  
  const changeDirection = (name: string, newDir: "min" | "max") => {
    setDirections(prev => ({ ...prev, [name]: newDir }));
  };

  useEffect(() => {
    const selectedCriteria = allCriteria
      .filter(c => selectedCrits.has(c.name))
      .map(c => ({
        ...c,
        direction: directions[c.name] || c.direction
      }));

    const selectedAlternatives = allAlternatives.filter(a =>
      selectedAlts.has(a.id)
    );

    if (selectedAlternatives?.length && selectedCriteria?.length) {
    onSelect({ alternatives: selectedAlternatives, criteria: selectedCriteria });
  }
  }, [selectedAlts, selectedCrits, directions]);

  const renderCell = (crit: Criterion, alt: any): string | number => {
  const raw = alt[crit.name];

  // Булевы значения
  if (typeof raw === "boolean") return raw ? "Да" : "Нет";

  // Отображение текстов вместо кодов
  if (crit.name === "payoutEncoded") return alt.payoutType;
  if (crit.name === "paymentFrequencyEncoded") return alt.paymentFrequency;

  // Всё остальное
  return raw;
};


  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Выбор альтернатив
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        {/* <Button
          size="small"
          variant="outlined"
          onClick={() => {
            if (selectedAlts.size === allAlternatives.length) {
              setSelectedAlts(new Set());
            } else {
              setSelectedAlts(new Set(allAlternatives.map(a => a.id)));
            }
          }}
        >
          {selectedAlts.size === allAlternatives.length ? "Снять выбор альтернатив" : "Выбрать все альтернативы"}
        </Button> */}
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            if (selectedCrits.size === allCriteria.length) {
              setSelectedCrits(new Set());
            } else {
              setSelectedCrits(new Set(allCriteria.map(c => c.name)));
            }
          }}
        >
          {selectedCrits.size === allCriteria.length ? "Снять выбор критериев" : "Выбрать все критерии"}
        </Button>

        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={() => {
            setSelectedAlts(new Set());
            setSelectedCrits(new Set());
          }}
        >
          Очистить всё
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                {/* Пусто над чекбоксами */}
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Компания</TableCell>
              <TableCell>Программа</TableCell>
              {allCriteria.map((crit) => (
                <TableCell key={crit.name} align="center">
                  <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCrits.has(crit.name)}
                          onChange={() => toggleCrit(crit.name)}
                        />
                      }
                      label={<Typography variant="caption">{crit.displayName}</Typography>}
                      labelPlacement="bottom"
                    />
                    <Select
                      size="small"
                      value={directions[crit.name] || ""}
                      onChange={(e) =>
                        changeDirection(crit.name, e.target.value as "min" | "max")
                      }
                    >
                      <MenuItem value="min">min</MenuItem>
                      <MenuItem value="max">max</MenuItem>
                    </Select>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {allAlternatives.map((alt) => (
              <TableRow
                key={alt.id}
                selected={selectedAlts.has(alt.id)}
                sx={{
                  backgroundColor: selectedAlts.has(alt.id) ? "rgba(0, 0, 255, 0.05)" : "inherit"
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAlts.has(alt.id)}
                    onChange={() => toggleAlt(alt.id)}
                  />
                </TableCell>
                <TableCell>{alt.id}</TableCell>
                <TableCell>{alt.company}</TableCell>
                <TableCell>{alt.name}</TableCell>
                {allCriteria.map((crit) => (
                  <TableCell key={crit.name} align="center">
                    {renderCell(crit, alt)}
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

// src/components/FullReportDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box
} from "@mui/material";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { generatePdfReport } from "../utils/generatePdfReport";


type Props = {
  open: boolean;
  onClose: () => void;
  report: any; // можно типизировать позже
};

export default function FullReportDialog({ open, onClose, report }: Props) {

  const saveAsJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "full_report.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Полный отчёт</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6">Метод</Typography>
        <Typography>{report.method}</Typography>

        <Typography variant="h6" mt={2}>Критерии</Typography>
        <List dense>
          {report.criteria.map(c => (
            <ListItem key={c.name}>
              <ListItemText primary={`${c.name} (${c.direction})`} />
            </ListItem>
          ))}
        </List>

        <Typography variant="h6" mt={2}>Веса</Typography>
        <Table size="small">
          <TableBody>
            {Object.entries(report.weights).map(([name, weight]) => (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell>{weight}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography variant="h6" mt={2}>Пороги</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Критерий</TableCell>
              <TableCell>q</TableCell>
              <TableCell>p</TableCell>
              <TableCell>v</TableCell>
              <TableCell>Тип функции</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(report.thresholds).map(([name, t]) => (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell>{t.q ?? "-"}</TableCell>
                <TableCell>{t.p ?? "-"}</TableCell>
                <TableCell>{t.v ?? "-"}</TableCell>
                <TableCell>{t.function ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography variant="h6" mt={2}>Матрица решений</Typography>
        <Table size="small">
          <TableBody>
            {report.matrix.map((row, i) => (
              <TableRow key={i}>
                {row.map((val, j) => (
                  <TableCell key={j}>{val}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography variant="h6" mt={2}>Альтернативы</Typography>
        <List dense>
          {report.alternatives.map(a => (
            <ListItem key={a.id}>
              <ListItemText primary={`${a.name} (${a.company})`} />
            </ListItem>
          ))}
        </List>
        {report.scores && report.scores.length === report.alternatives.length && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>Итоговое ранжирование</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Компания</TableCell>
                  <TableCell>Программа</TableCell>
                  <TableCell>Оценка</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.alternatives.map((alt: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{alt.company}</TableCell>
                    <TableCell>{alt.name}</TableCell>
                    <TableCell>{report.scores[i].toFixed(3)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}


        {report.intermediate && (
          <>
            <Typography variant="h6" mt={2}>Промежуточные вычисления</Typography>

            {report.method === "electre_iii" ? (
              <>
                <Typography variant="subtitle1" mt={2}>Матрица согласия</Typography>
                <Table size="small">
                  <TableBody>
                    {report.intermediate.concordance.map((row: number[], i: number) => (
                      <TableRow key={i}>
                        {row.map((val, j) => (
                          <TableCell key={j}>{val.toFixed(2)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Typography variant="subtitle1" mt={2}>Матрица доверия</Typography>
                <Table size="small">
                  <TableBody>
                    {report.intermediate.credibility.map((row: number[], i: number) => (
                      <TableRow key={i}>
                        {row.map((val, j) => (
                          <TableCell key={j}>{val.toFixed(2)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Typography variant="subtitle1" mt={2}>Нисходящее ранжирование</Typography>
                <List dense>
                  {report.intermediate.descending.map((item: string, i: number) => (
                    <ListItem key={i}>
                      <ListItemText primary={`${i + 1}) ${item}`} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle1" mt={2}>Восходящее ранжирование</Typography>
                <List dense>
                  {report.intermediate.ascending.map((item: string, i: number) => (
                    <ListItem key={i}>
                      <ListItemText primary={`${i + 1}) ${item}`} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle1" mt={2}>Матрица парных итоговых бинарных отношений</Typography>
                <Table size="small">
                  <TableBody>
                    {report.intermediate.poMatrix.map((row: string[], i: number) => (
                      <TableRow key={i}>
                        {row.map((val, j) => (
                          <TableCell key={j}>{val}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>
                {JSON.stringify(report.intermediate, null, 2)}
              </pre>
            )}
            {report.method === "promethee_ii" && report.intermediate && (
              <>
                <Typography variant="subtitle1" mt={2}>Матрица агрегированных индексов предпочтения</Typography>
                <Table size="small">
                  <TableBody>
                    {report.intermediate.pdMatrix.map((row: number[], i: number) => (
                      <TableRow key={i}>
                        {row.map((val, j) => (
                          <TableCell key={j}>{val.toFixed(2)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Typography variant="subtitle1" mt={2}>Положительные потоки (Phi⁺)</Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      {report.intermediate.phiPlus.map((val: number, i: number) => (
                        <TableCell key={i}>{val.toFixed(3)}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>

                <Typography variant="subtitle1" mt={2}>Отрицательные потоки (Phi⁻)</Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      {report.intermediate.phiMinus.map((val: number, i: number) => (
                        <TableCell key={i}>{val.toFixed(3)}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            )}
          </>
        )}

      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        <Button onClick={saveAsJson} variant="outlined">
          Скачать JSON
        </Button>
        <Button onClick={() => generatePdfReport(report)} variant="outlined">
          Скачать PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}

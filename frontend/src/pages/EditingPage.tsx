// src/pages/EditingPage.tsx
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@mui/material";
import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AlternativeSelector from "../components/AlternativeSelector";
import ProjectTable from "../components/ProjectTable";
import MethodSelector from "../components/MethodSelector";
import DematelDialog from "../components/DematelDialog";
import WeightsRow from "../components/WeightsRow";
import FullReportDialog from "../components/FullReportDialog";
import type { ProjectData } from "../types/ProjectData";
import type { CalculateInput } from "../types/CalculateInput";
import type { RankingResult } from "./RankingResult";

export default function EditingPage() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isNew = projectId === "new";
  const nameFromUrl = searchParams.get("name");

  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState("");

  const [selectedAlternatives, setSelectedAlternatives] = useState<any[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<any[]>([]);
  const [allAlternatives, setAllAlternatives] = useState<any[]>([]);
  const [allCriteria, setAllCriteria] = useState<any[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(true);
  const [loadingCriteria, setLoadingCriteria] = useState(true);


  const [projectMatrix, setProjectMatrix] = useState<number[][]>([]);

  const [method, setMethod] = useState<"promethee_ii" | "electre_iii">("promethee_ii");
  const [methodParams, setMethodParams] = useState<Record<string, any>>({});

  const [dematelOpen, setDematelOpen] = useState(false);
  const [weights, setWeights] = useState<Record<string, number>>({});

  const [rankingResult, setRankingResult] = useState<RankingResult | null>(null);

  const [savedSeed, setSavedSeed] = useState<string | null>(null);

  const [showFullReport, setShowFullReport] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/alternatives")
      .then(res => res.json())
      .then((alts) => {
        setAllAlternatives(alts);
        setLoadingAlternatives(false);
      });

    fetch("http://localhost:3001/criteria")
      .then(res => res.json())
      .then((crits) => {
        setAllCriteria(crits);
        setLoadingCriteria(false);
      });
  }, []);

  const handleCalculate = async () => {
    const selectedCriterionNames = selectedCriteria.map((c) => c.name);
    // отфильтровываем thresholds
    const filteredThresholds = Object.fromEntries(
      Object.entries(methodParams).filter(([key]) => selectedCriterionNames.includes(key))
    );
    // отфильтровываем weights
    const filteredWeights = Object.fromEntries(
      Object.entries(weights).filter(([key]) => selectedCriterionNames.includes(key))
    );

    const payload: CalculateInput = {
      method,
      matrix: projectMatrix,
      weights: filteredWeights,
      directions: selectedCriteria.map((c) => c.direction as "min" | "max"),
      thresholds: filteredThresholds,
      alternatives: selectedAlternatives.map((a) => ({
        id: a.id,
        name: a.name,
        company: a.company
      })),
      criteria: selectedCriteria.map((c) => ({
        id: c.id,
        name: c.name,
        direction: c.direction as "min" | "max"
      }))
    };

    try {
      const res = await fetch("http://localhost:3001/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Ошибка расчёта: " + err.error);
        return;
      }

      const result = await res.json();
      setRankingResult(result); // { scores, intermediate }
    } catch (error) {
      console.error("Ошибка при расчёте:", error);
      alert("Ошибка связи с сервером");
    }
  };



  const handleSaveProject = async () => {
    const name = prompt("Введите название проекта", projectName || "Новый проект");
    if (!name) return;

    const payload: Partial<ProjectData> = {
      seed: projectId === "new" ? undefined : projectId,
      name,
      method,
      alternativeIds: selectedAlternatives.map((a) => a.id),
      criterionIds: selectedCriteria.map((c) => c.id),
      matrix: projectMatrix,
      weights,
      directions: selectedCriteria.map((c) => c.direction as "min" | "max"),
      thresholds: methodParams,
      scores: rankingResult?.scores ?? [],
    };

    try {
      const response = await fetch("http://localhost:3001/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      alert(`Проект сохранён! Seed: ${data.seed}`);
    } catch (err) {
      alert("Ошибка при сохранении проекта");
      console.error(err);
    }
  };


  useEffect(() => {
    const loadProject = async () => {
      if (isNew) {
        setProjectName(nameFromUrl ?? "Новый проект");
        setLoading(false);
        return;
      }

      const project = await fetchProjectBySeed(projectId!);
      if (!project) {
        alert("Проект не найден");
        setLoading(false);
        return;
      }

      setProjectName(project.name);
      setMethod(project.method as "promethee_ii" | "electre_iii");
      setProjectMatrix(project.matrix);
      setWeights(project.weights);
      setMethodParams(project.thresholds);

      const selectedAlts = project.alternativeIds
        .map((id: number) => allAlternatives.find(a => a.id === id))
        .filter(Boolean);

      const selectedCrits = project.criterionIds
        .map((id: number) => allCriteria.find(c => c.id === id))
        .filter(Boolean);

      setSelectedAlternatives(selectedAlts);
      setSelectedCriteria(selectedCrits);

      if (project.scores) {
        setRankingResult({ scores: project.scores });
      }

      setLoading(false);
    };

    if (!loadingAlternatives && !loadingCriteria) {
      loadProject();
    }
  }, [loadingAlternatives, loadingCriteria, isNew, nameFromUrl, projectId]);


  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        p={4}
      >
        <CircularProgress size={24} />
        <Typography variant="h6">Загрузка проекта...</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">{projectName}</Typography>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
        >
          Назад
        </Button>
      </Stack>

      <Typography color="text.secondary" mb={3}>
        ID: {projectId === "new" ? "(новый проект)" : projectId}
      </Typography>

      <AlternativeSelector
        selectedAlternatives={selectedAlternatives}
        selectedCriteria={selectedCriteria}
        onSelect={({ alternatives, criteria }) => {
          setSelectedAlternatives(alternatives);
          setSelectedCriteria(criteria);

          const matrix = alternatives.map((alt) =>
            criteria.map((crit) => {
              const raw = (alt as any)[crit.name];
              if (typeof raw === "boolean") return raw ? 1 : 0;
              if (typeof raw === "number") return raw;
              return 0;
            })
          );
          setProjectMatrix(matrix);
        }}
      />

      {selectedAlternatives.length > 0 && selectedCriteria.length > 0 && (
        <ProjectTable
          alternatives={selectedAlternatives}
          criteria={selectedCriteria}
          initialMatrix={projectMatrix}
          onUpdate={setProjectMatrix}
          isNew={isNew}
        />
      )}
      {selectedCriteria.length > 0 && (
        <MethodSelector
          criteria={selectedCriteria}
          initialMethod={method}
          initialParams={methodParams}
          onChange={(method, params) => {
            setMethod(method as "promethee_ii" | "electre_iii");
            setMethodParams(params);
          }}
        />
      )}
      {selectedCriteria.length > 0 && (
        <WeightsRow
          criteria={selectedCriteria}
          value={weights}
          onChange={setWeights}
        />
      )}
      <Stack direction="row" spacing={2} mt={3}>
        <Button
          variant="outlined"
          sx={{ mt: 3 }}
          onClick={() => setDematelOpen(true)}
        >
          DEMATEL
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 4 }}
          onClick={handleCalculate}
        >
          Рассчитать
        </Button>
        <Button variant="outlined" onClick={handleSaveProject}>
          Сохранить проект
        </Button>
      </Stack>
      
      <DematelDialog
        open={dematelOpen}
        onClose={() => setDematelOpen(false)}
        criteria={selectedCriteria}
        onApply={(w) => {
          setWeights(w);
          console.log("Полученные веса от DEMATEL:", w);
        }}
      />

      {rankingResult && selectedAlternatives?.length === rankingResult.scores.length && (
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
              {selectedAlternatives.map((alt, i) => (
                <TableRow key={i}>
                  <TableCell>{alt.company}</TableCell>
                  <TableCell>{alt.name}</TableCell>
                  <TableCell>{rankingResult.scores[i].toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}


      <Button
        variant="text"
        onClick={() => setShowFullReport(true)}
        sx={{ mt: 1 }}
      >
        Показать полный отчёт
      </Button>

      <FullReportDialog
        open={showFullReport}
        onClose={() => setShowFullReport(false)}
        report={{
          method,
          criteria: selectedCriteria,
          weights,
          thresholds: methodParams,
          matrix: projectMatrix,
          alternatives: selectedAlternatives,
          scores: rankingResult?.scores ?? [],
          intermediate: rankingResult?.intermediate ?? null
        }}
      />

      {savedSeed && (
        <Box mt={2}>
          <Typography color="success.main">
            Проект сохранён. Ваш seed: <strong>{savedSeed}</strong>
          </Typography>
          <Typography variant="body2">
            Вы можете вернуться к проекту позже через главный экран.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

async function fetchProjectBySeed(seed: string): Promise<any | null> {
  try {
    const res = await fetch(`http://localhost:3001/projects/${seed}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

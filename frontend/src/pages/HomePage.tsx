// src/pages/HomePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Paper
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export default function HomePage() {
  const navigate = useNavigate();

  const [seedInput, setSeedInput] = useState("");
  const [projectName, setProjectName] = useState("");
  const [showSeedField, setShowSeedField] = useState(false);
  const [showProjectField, setShowProjectField] = useState(false);
  const [error, setError] = useState("");

  const handleOpenProject = async () => {
    const isValid = await checkProjectBySeed(seedInput);
    if (isValid) {
      navigate(`/editingProject/${seedInput}`);
    } else {
      setError("Проект не найден. Возможно, он не существует или сид введён с ошибкой.");
    }
  };

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      setError("Введите название проекта.");
      return;
    }
    navigate(`/editingProject/new?name=${encodeURIComponent(projectName)}`);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="background.default"
    >
      <Paper elevation={4} sx={{ padding: 6, width: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Многокритериальный выбор НСЖ-программы
        </Typography>

        <Stack spacing={2} mt={2}>
          <Button
            variant="contained"
            startIcon={<FolderOpenIcon />}
            onClick={() => {
              setShowSeedField(true);
              setShowProjectField(false);
              setError("");
            }}
            fullWidth
          >
            Открыть существующий проект
          </Button>

          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => {
              setShowProjectField(true);
              setShowSeedField(false);
              setError("");
            }}
            fullWidth
          >
            Создать новый проект
          </Button>

          {showSeedField && (
            <>
              <TextField
                label="Введите сид проекта"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={handleOpenProject} fullWidth>
                Открыть
              </Button>
            </>
          )}

          {showProjectField && (
            <>
              <TextField
                label="Название проекта"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={handleCreateProject} fullWidth>
                Создать
              </Button>
            </>
          )}

          {error && (
            <Typography color="error" textAlign="center">
              {error}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

async function checkProjectBySeed(seed: string): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:3001/projects/${seed}`);
    return res.ok;
  } catch {
    return false;
  }
}
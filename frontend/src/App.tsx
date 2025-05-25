// src/App.tsx
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EditingPage from "./pages/EditingPage"; // Заглушка пока

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/editingProject/:projectId" element={<EditingPage />} />
    </Routes>
  );
}

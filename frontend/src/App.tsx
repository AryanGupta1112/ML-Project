import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import RootLayout from "@/app/layout";
import AboutPage from "@/app/about/page";
import DashboardPage from "@/app/dashboard/page";
import HistoryPage from "@/app/history/page";
import LandingPage from "@/app/page";
import ModelsPage from "@/app/models/page";
import WhatIfPage from "@/app/what-if/page";

export default function App() {
  return (
    <BrowserRouter>
      <RootLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/what-if" element={<WhatIfPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
}

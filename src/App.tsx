import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Overview } from './pages/Overview';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { DigitalTwin } from './pages/DigitalTwin';
import { Pipeline } from './pages/Pipeline';
import { AIDetection } from './pages/AIDetection';
import { AIForecast } from './pages/AIForecast';
import { SmartVision } from './pages/SmartVision';
import { IoTNetwork } from './pages/IoTNetwork';
import { Alerts } from './pages/Alerts';
import { Impact } from './pages/Impact';
import { ROICalculator } from './pages/ROICalculator';
import { Settings } from './pages/Settings';
import { Presentation } from './pages/Presentation';
import { useSimulationClock } from './hooks/useSimulationClock';

export default function App() {
  useSimulationClock();

  return (
    <Routes>
      <Route path="/presentation" element={<Presentation />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/live" element={<LiveMonitoring />} />
        <Route path="/twin" element={<DigitalTwin />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/ai-detection" element={<AIDetection />} />
        <Route path="/forecast" element={<AIForecast />} />
        <Route path="/vision" element={<SmartVision />} />
        <Route path="/network" element={<IoTNetwork />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/roi" element={<ROICalculator />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

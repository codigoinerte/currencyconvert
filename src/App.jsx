import { useEffect }   from 'react';
import useDashboardStore from './store/useDashboardStore';
import TopBar            from './components/TopBar';
import ChartPanel        from './components/ChartPanel';
import ConverterPanel    from './components/ConverterPanel';
import HistoryPanel      from './components/HistoryPanel';
import './styles/global.css';

export default function App() {
  const theme = useDashboardStore((s) => s.theme);

  // Apply persisted theme on first render
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="dashboard">
      <TopBar />
      <div className="main-area">
        <ChartPanel />
        <ConverterPanel />
      </div>
      <HistoryPanel />
    </div>
  );
}

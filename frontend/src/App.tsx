import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import IncidentDetail from './pages/IncidentDetail';
import RCAForm from './pages/RCAForm';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Navbar />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incident/:id" element={<IncidentDetail />} />
            <Route path="/incident/:id/rca" element={<RCAForm />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

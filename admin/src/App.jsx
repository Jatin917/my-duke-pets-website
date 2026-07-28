import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pets from './pages/Pets';
import PetForm from './pages/PetForm';
import Categories from './pages/Categories';
import Breeds from './pages/Breeds';
import Enquiries from './pages/Enquiries';
import DonateSettings from './pages/DonateSettings';
import EnquiryPromptSettings from './pages/EnquiryPromptSettings';
import SellRequests from './pages/SellRequests';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/pets/new" element={<PetForm />} />
          <Route path="/pets/:id/edit" element={<PetForm />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/breeds" element={<Breeds />} />
          <Route path="/enquiries" element={<Enquiries />} />
          <Route path="/enquiry-prompt" element={<EnquiryPromptSettings />} />
          <Route path="/sell" element={<SellRequests />} />
          <Route path="/donate" element={<DonateSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

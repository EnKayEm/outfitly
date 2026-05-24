import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import StyleCreator from './pages/StyleCreator';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import MyOutfits from './pages/MyOutfits';
import Contact from './pages/Contact';
import Deklaracja from './pages/Deklaracja';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/style-creator" element={<StyleCreator />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/my-outfits" element={<MyOutfits />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/deklaracja-dostepnosci" element={<Deklaracja />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
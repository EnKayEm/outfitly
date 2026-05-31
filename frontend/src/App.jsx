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
import { Toaster } from 'react-hot-toast';


function App() {
  return (
    <>
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

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '16px',
            background: '#1e293b',
            color: '#fff',
            padding: '12px 16px',
          },
          success: {
            style: {
              background: '#16a34a',
            },
          },
          error: {
            style: {
              background: '#dc2626',
            },
          },
        }}
      />
    </>
  );
}


export default App;
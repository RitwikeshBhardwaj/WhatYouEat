import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-surface-950">
      <Navbar />
      <main key={location.pathname} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 animate-fade-in">
        {children}
      </main>
      <Footer />
    </div>
  );
}

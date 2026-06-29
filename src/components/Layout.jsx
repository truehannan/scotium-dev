import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useSidebar } from '../context/SidebarContext';

export default function Layout({ children }) {
  const { isMinimized } = useSidebar();

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className={`flex-1 transition-all duration-300 ${isMinimized ? 'lg:ml-16' : 'lg:ml-64'}`}>
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}

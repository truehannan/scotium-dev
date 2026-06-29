import Navbar from './Navbar';
import Footer from './Footer';
import AnnouncementBar from './ui/AnnouncementBar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

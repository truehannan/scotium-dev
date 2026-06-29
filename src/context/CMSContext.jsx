import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CMSContext = createContext(null);

export function CMSProvider({ children }) {
  const [announcements, setAnnouncements] = useState([]);
  const [banners, setBanners] = useState([]);
  const [sponsoredRepos, setSponsoredRepos] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { fetchCMSData(); }, []);

  const fetchCMSData = async () => {
    try {
      const res = await axios.get('/api/cms/public');
      if (res.data) {
        setAnnouncements(res.data.announcements || []);
        setBanners(res.data.banners || []);
        setSponsoredRepos(res.data.sponsored_repos || []);
      }
    } catch {
      // Fallback: use localStorage for dev
      try {
        setAnnouncements(JSON.parse(localStorage.getItem('cms_announcements') || '[]'));
        setBanners(JSON.parse(localStorage.getItem('cms_banners') || '[]'));
        setSponsoredRepos(JSON.parse(localStorage.getItem('cms_sponsored') || '[]'));
      } catch {}
    }
    setLoaded(true);
  };

  return (
    <CMSContext.Provider value={{ announcements, banners, sponsoredRepos, loaded, refetch: fetchCMSData }}>
      {children}
    </CMSContext.Provider>
  );
}

export const useCMS = () => {
  const ctx = useContext(CMSContext);
  if (!ctx) throw new Error('useCMS must be used within CMSProvider');
  return ctx;
};

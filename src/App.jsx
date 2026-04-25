import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ContactDevelopers from './pages/ContactDevelopers';
import EgyptPrices from './pages/EgyptPrices';
import AutoDiscover from './pages/AutoDiscover';
import Feed from './pages/Feed';
import Memories from './pages/Memories';
import Museum3D from './pages/Museum3D';
import AIStoryTeller from './pages/AIStoryTeller';
import ArtificialGuide from './pages/ArtificialGuide';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { db } from '@/api/apiClient';
import { useEffect } from 'react';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
/** @type {React.ComponentType<any>} */
const MainPage = mainPageKey ? Pages[mainPageKey] : () => <></>;

/**
 * @param {{ children: React.ReactNode, currentPageName: string }} props
 * @returns {React.ReactElement}
 */
const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

/**
 * @param {{ children: React.ReactNode, isAuthenticated: boolean, isLoading: boolean }} props
 * @returns {React.ReactElement}
 */
const ProtectedRoute = ({ children, isAuthenticated, isLoading }) => {
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated, authError } = useAuth();

  // Auto-add Egyptian places from Wikipedia every minute
  useEffect(() => {
    const autoAddPlaces = async () => {
      try {
        // Get a random Egyptian place query
        const egyptianPlaces = [
  'Siwa Oasis','Dahab diving site','Saint Catherine Monastery',
  'White Desert Farafra','Fayoum Oasis','Wadi El Rayan',
  'Bahariya Oasis','Dakhla Oasis','Kharga Oasis',
  'Ras Mohammed National Park','Colored Canyon','Abydos Temple',
  'Dendera Temple','Edfu Temple','Kom Ombo Temple',
  'Philae Temple','Abu Simbel','Nubian Museum',
  'Egyptian Museum','Khan el-Khalili','Al-Azhar Mosque',
  'Coptic Cairo','Bibliotheca Alexandrina','Qaitbay Citadel',
  'Montaza Palace','El Alamein','Marsa Alam',
  'Valley of the Kings','Karnak Temple','Hatshepsut Temple',
  'Colossi of Memnon','Wadi Hitan','Lake Qarun',
  'Black Desert','Crystal Mountain','Sannur Cave',
  'Ras Abu Galum','Blue Hole Dahab','Nabq Bay',
  'Tiran Island','Saint Anthony Monastery','Saint Paul Monastery',
  'Wadi Degla','Petrified Forest','Temple of Luxor',
  'Mosque of Muhammad Ali','Saladin Citadel','Giza Pyramids',
  'Great Sphinx','Saqqara Step Pyramid','Memphis',
  'Dahshur pyramids','Meidum Pyramid','Beni Hasan',
  'Tell el-Amarna','Abusir pyramids',
  'Hurghada Marina','Giftun Island','Mahmya Island','Sharm El Sheikh',
  'Naama Bay','Shark Bay','SOHO Square Sharm','Ras Um Sid',
  'Farsha Mountain Lounge','El Fanar Beach','Old Market Sharm',
  'Taba Heights','Pharaohs Island','Castle Zaman Taba',
  'Nuweiba Port','Coloured Canyon Nuweiba','Ain Khudra Oasis',
  'Bir Sweir','Mount Sinai','Wadi Feiran',
  'El Tor Sinai','Ras Sudr','Abu Zenima',
  'Suez Canal','Ismailia Museum','Lake Timsah',
  'Port Said Lighthouse','Port Fouad','Lake Manzala',
  'Damietta Corniche','Ras El Bar','New Damietta',
  'Mansoura University','Talkha Nile View','Tanta Mosque of Ahmad al-Badawi',
  'Kafr El Sheikh Museum','Baltim Beach','Burullus Lake',
  'Rosetta Rashid','Qaitbay Fort Rashid','Idku Lake',
  'Stanley Bridge','Alexandria Corniche','Catacombs of Kom El Shoqafa',
  'Pompey Pillar','Kom El Dikka','Royal Jewelry Museum',
  'Graeco Roman Museum','Abu Mena','Borg El Arab',
  'Wadi El Natrun','Deir Anba Bishoi','Deir El Baramus',
  'Minya','Tuna El Gebel','Beni Hassan Tombs',
  'Ashmunein','Mallawi Museum','Assiut Barrage',
  'Sohag','Abydos','Red Monastery Sohag',
  'Qena','Naqada','Esna Temple',
  'Luxor Museum','Mummification Museum','Ramesseum',
  'Medinet Habu','Deir el-Medina','Valley of the Queens',
  'Aswan High Dam','Unfinished Obelisk','Elephantine Island',
  'Kitchener Island','Aga Khan Mausoleum','Kalabsha Temple',
  'Wadi Alaqi','Gebel Elba','Shalateen',
  'Halayeb','Berenice Troglodytica','El Quseir',
  'Wadi Hammamat','Mons Claudianus','Mons Porphyrites',
  'Ain Sokhna','Galala Mountain','Zaafarana',
  'New Administrative Capital','Al Masa Hotel NAC','Cathedral of the Nativity',
  'Al Fattah Al Aleem Mosque','Al Azhar Park','Manial Palace',
  'Abdeen Palace','Baron Empain Palace','Heliopolis Basilica',
  'Ain Shams Obelisk','Nilometer Roda','Bab Zuweila',
  'Bab al-Futuh','Bab al-Nasr','Al Muizz Street',
  'Sultan Hassan Mosque','Al Rifai Mosque','Ibn Tulun Mosque',
  'Gayer Anderson Museum','Manasterly Palace','Prince Mohamed Ali Palace'
        ];

        const randomQuery = egyptianPlaces[Math.floor(Math.random() * egyptianPlaces.length)];

        // Search Wikipedia for the place
        const searchResults = await db.integrations.External.wikipedia('search', { query: randomQuery });
        if (!searchResults.success || !searchResults.results || searchResults.results.length === 0) return;

        const firstResult = searchResults.results[0];
        const placeName = firstResult.title;

        // Check if place already exists (avoid duplicates)
        const existingPlaces = await db.entities.Place.filter({ name_en: placeName });
        if (existingPlaces.length > 0) return; // Already exists

        // Get detailed info about the place
        const details = await db.integrations.External.wikipedia('details', { query: placeName });
        if (!details.success) return;

        // Add the place to database
        await db.entities.Place.create({
          name_en: details.title,
          name_ar: details.title, // Will be translated later if needed
          description_en: details.extract?.substring(0, 1000) || '',
          description_ar: '',
          latitude: details.coordinates?.lat || null,
          longitude: details.coordinates?.lon || null,
          image_url: details.thumbnail || null,
          category: 'historical',
          wikipedia_url: details.url,
          source: 'wikipedia-auto',
          views_count: 0,
          is_featured: false,
          tags: ['wikipedia', 'auto-added']
        });

        console.log(`✓ Auto-added place: ${placeName}`);
      } catch (error) {
        console.error('Auto-add places error:', error);
      }
    };

    // Run immediately, then every minute
    autoAddPlaces();
    const interval = setInterval(autoAddPlaces, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  // Show loading spinner while checking auth
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError && isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  const publicPages = new Set(['Home', 'Explore', 'Search', 'PlaceDetails', 'MapView', 'ContactDev', 'TravelPrices', 'WeatherGuide', 'AutoDiscover']);

  // Render the main app
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />

      {/* Protected Routes */}
      <Route path="/" element={
        publicPages.has(mainPageKey)
          ? <LayoutWrapper currentPageName={mainPageKey}><MainPage /></LayoutWrapper>
          : <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
              <LayoutWrapper currentPageName={mainPageKey}>
                <MainPage />
              </LayoutWrapper>
            </ProtectedRoute>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            publicPages.has(path)
              ? <LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>
              : <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
                  <LayoutWrapper currentPageName={path}>
                    <Page />
                  </LayoutWrapper>
                </ProtectedRoute>
          }
        />
      ))}
      <Route path="/ContactDevelopers" element={
        <LayoutWrapper currentPageName="ContactDevelopers"><ContactDevelopers /></LayoutWrapper>
      } />
      <Route path="/EgyptPrices" element={
        <LayoutWrapper currentPageName="EgyptPrices"><EgyptPrices /></LayoutWrapper>
      } />
      <Route path="/AutoDiscover" element={
        <LayoutWrapper currentPageName="AutoDiscover"><AutoDiscover /></LayoutWrapper>
      } />
      <Route path="/Feed" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName="Feed"><Feed /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/Memories" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName="Memories"><Memories /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/Museum3D" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName="Museum3D"><Museum3D /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/AIStoryTeller" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName="AIStoryTeller"><AIStoryTeller /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/ArtificialGuide" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName="ArtificialGuide"><ArtificialGuide /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
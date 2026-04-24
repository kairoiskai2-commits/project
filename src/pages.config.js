import Admin from './pages/Admin';
import AskAI from './pages/AskAI';
import Explore from './pages/Explore';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import Itinerary from './pages/Itinerary';
import BudgetCalculator from './pages/BudgetCalculator';
import MapView from './pages/MapView';
import PlaceDetails from './pages/PlaceDetails';
import Profile from './pages/Profile';
import Quiz from './pages/Quiz';
import Search from './pages/Search';
import Social from './pages/Social';
import Chat from './pages/Chat';
import FamilyTrips from './pages/FamilyTrips';
import TravelPersonality from './pages/TravelPersonality';
import PackingAssistant from './pages/PackingAssistant';
import Challenges from './pages/Challenges';
import SafetyHub from './pages/SafetyHub';
import RouteOptimizer from './pages/RouteOptimizer';
import TravelDashboard from './pages/TravelDashboard';
import ContactDev from './pages/ContactDev';
import TravelPrices from './pages/TravelPrices';
import WeatherGuide from './pages/WeatherGuide';
import __Layout from './Layout.jsx';

export const PAGES = {
    "Admin": Admin,
    "AskAI": AskAI,
    "BudgetCalculator": BudgetCalculator,
    "Challenges": Challenges,
    "Chat": Chat,
    "ContactDev": ContactDev,
    "Explore": Explore,
    "Favorites": Favorites,
    "FamilyTrips": FamilyTrips,
    "Home": Home,
    "Itinerary": Itinerary,
    "MapView": MapView,
    "PackingAssistant": PackingAssistant,
    "PlaceDetails": PlaceDetails,
    "Profile": Profile,
    "Quiz": Quiz,
    "RouteOptimizer": RouteOptimizer,
    "SafetyHub": SafetyHub,
    "Search": Search,
    "Social": Social,
    "TravelDashboard": TravelDashboard,
    "TravelPersonality": TravelPersonality,
    "TravelPrices": TravelPrices,
    "WeatherGuide": WeatherGuide,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
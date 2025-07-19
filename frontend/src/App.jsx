import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AddVehiclePage from './pages/AddVechiclePage';
import SearchBookPage from './pages/SearchBookPage';
import BookedVehicles from './components/BookedVehicles';

export default function App() {
  return (
    <Router>
      <nav className="bg-blue-600 p-4 sticky top-0">
        <ul className="flex space-x-4 text-white">
          <li>
            <Link to="/" className="hover:underline">Add Vehicle</Link>
          </li>
          <li>
            <Link to="/search" className="hover:underline">Search & Book</Link>
          </li>
          <li>
            <Link to="/booked" className="hover:underline">Booked Vehicle</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<AddVehiclePage />} />
        <Route path="/search" element={<SearchBookPage />} />
          <Route path="/booked" element={<BookedVehicles />} />
      </Routes>
    </Router>
  );
}
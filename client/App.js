import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import MyTrips from "./pages/MyTrips";
import TripDetail from "./pages/TripDetail";
import Settings from "./pages/Settings";
import CityAttractions from "./pages/CityAttractions";

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    {/* public */}
                    <Route path="/login" element={<Login />} />

                    {/* protected */}
                    <Route path="/" element={
                        <ProtectedRoute><MyTrips /></ProtectedRoute>
                    } />
                    <Route path="/trips/:id" element={
                        <ProtectedRoute><TripDetail /></ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                        <ProtectedRoute><Settings /></ProtectedRoute>
                    } />
                    <Route path="/cities/:id" element={
                        <ProtectedRoute><CityAttractions /></ProtectedRoute>
                    } />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;

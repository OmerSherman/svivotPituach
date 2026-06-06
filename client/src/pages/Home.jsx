import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import SouthAmericaMap from "../components/SouthAmericaMap";
import citiesService from "../services/citiesService";
import "./Home.css";

function Home() {
    const navigate = useNavigate();

    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // fetch cities on mount
    useEffect(function() {
        async function fetchCities() {
            try {
                const data = await citiesService.getAll();
                setCities(data);
            } catch (err) {
                setError("לא ניתן לטעון את הערים: " + err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchCities();
    }, []);

    return (
        <div className="home-page">
            <header className="home-hero">
                <h1>ברוכים הבאים לשביל הטחינה</h1>
                <p className="home-subtitle">
                    מדריך הטיולים שלך לדרום אמריקה — גלו את היעדים, האטרקציות והמסלולים הכי מומלצים
                </p>
            </header>

            {/* the map section */}
            <section className="home-section">
                <h2>היעדים שלנו על המפה</h2>
                {loading && <p className="home-loading">טוען מפה...</p>}
                {error && <p className="home-error">{error}</p>}
                {!loading && !error && cities.length > 0 && (
                    <SouthAmericaMap cities={cities} />
                )}
            </section>

            {/* cards section */}
            <section className="home-section">
                <h2>הערים שלנו</h2>

                {loading && <p className="home-loading">טוען ערים...</p>}
                {error && <p className="home-error">{error}</p>}

                {!loading && !error && cities.length === 0 && (
                    <p className="home-empty">לא נמצאו ערים להצגה.</p>
                )}

                {!loading && !error && cities.length > 0 && (
                    <div className="home-grid">
                        {cities.map(function(city) {
                            return (
                                <ItemCard
                                    key={city.id}
                                    title={city.name_he}
                                    subtitle={city.name}
                                    description={city.summary_he}
                                    imageUrl={city.banner_image_url}
                                    badge="עיר"
                                    onClick={function() { navigate("/cities/" + city.id); }}
                                />
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;

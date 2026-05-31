import { Navigate } from "react-router-dom";
import authService from "../services/authService";

function ProtectedRoute({ children }) {
    var user = authService.getStoredUser();
    if (!user) {
        return <Navigate to="/login" />;
    }
    return children;
}

export default ProtectedRoute;

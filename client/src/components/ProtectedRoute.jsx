import { Navigate } from "react-router-dom";
import authService from "../services/authService";
import { useContext } from "react";
import userContext from "../contexts/userContext";

function ProtectedRoute({ children }) {
    const {user}  = useContext(userContext);
    if (!user) {
        return <Navigate to="/login" />;
    }
    return children;
}

export default ProtectedRoute;

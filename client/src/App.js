import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Users from "./pages/Users";
import About from "./pages/About";

function App() {
    return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<login />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
export default App;
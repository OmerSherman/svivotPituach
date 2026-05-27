import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
//import Home from "./pages/Home";
//import Users from "./pages/Users";
import Login_page from "./pages/Login"

// function App() {
//     return (
//     <BrowserRouter>
//       <Layout>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<login_page />} />
//         </Routes>
//       </Layout>
//     </BrowserRouter>
//   );
// }
function App() {
    return (
    <Login_page />
  );
}

export default App;
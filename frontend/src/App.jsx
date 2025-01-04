import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Gunakan Routes dan Route dari React Router v6
import axios from "axios";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Monitoring from "./components/Monitoring";
import StreamPage from "./components/Streampage";

function App() {
  const [array, setArray] = useState([]);

  const fetchAPI = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8080/api/users");
      console.log(response.data.users);
      setArray(response.data.users);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Hero />
                <About />
                <Monitoring />
              </>
            }
          />
          <Route path="/stream" element={<StreamPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

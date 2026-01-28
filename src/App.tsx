import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import France from "./pages/France";
import Argentina from "./pages/Argentina";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/france">France</NavLink>
        <NavLink to="/argentina">Argentina</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/france" element={<France />} />
        <Route path="/argentina" element={<Argentina />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

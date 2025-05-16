// src/App.jsx
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar.jsx";

function App() {
    return (
        <div className="flex">
            <Sidebar />
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <Home />
            </div>
        </div>
    );
}

export default App;

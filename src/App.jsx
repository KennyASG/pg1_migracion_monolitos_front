import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";

function App() {
    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <Navbar />
                <main className="p-6 overflow-y-auto flex-1">
                    <Home />
                </main>
            </div>
        </div>
    );
}

export default App;

// src/components/Navbar.jsx
const Navbar = () => {
    return (
        <nav className="bg-slate-800 text-white p-4 shadow-md fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-semibold tracking-wide">Microservicio Visualizer</h1>
            </div>
        </nav>
    );
};

export default Navbar;

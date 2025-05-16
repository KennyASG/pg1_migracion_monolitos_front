import { LayoutDashboard } from "lucide-react";

const Navbar = () => {
    return (
        <header className="bg-slate-700 text-white px-6 py-4 shadow-md flex items-center gap-4">
            <LayoutDashboard size={28} />
            <h1 className="text-xl font-semibold">Visualizador de Microservicios</h1>
        </header>
    );
};

export default Navbar;

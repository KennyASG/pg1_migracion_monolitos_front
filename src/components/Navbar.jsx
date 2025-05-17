import {LayoutDashboard, GitBranch, AlertTriangle, Settings, Blocks} from "lucide-react";
import { useState } from "react";

const Navbar = ({ projectName }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <header className="bg-slate-700 text-white px-6 py-4 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Blocks size={28} />
                <h1 className="text-xl font-semibold">Migración de Monolitos a Microservicios</h1>
            </div>

            <div className="flex items-center gap-6">
                {projectName && (
                    <div className="flex items-center gap-2 bg-slate-600 px-3 py-1 rounded-md">
                        <GitBranch size={16} />
                        <span className="font-medium">{projectName}</span>
                    </div>
                )}

                <div className="relative">
                    <button
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-600 hover:bg-slate-500 transition"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <Settings size={18} />
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-md shadow-lg py-1 z-10">
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100">Configuración</a>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100">Ayuda</a>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-100">Acerca de</a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;

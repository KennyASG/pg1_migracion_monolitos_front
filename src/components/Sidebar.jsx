// src/components/Sidebar.jsx
import { Home, FolderOpen, GitBranch } from "lucide-react";

const Sidebar = () => {
    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen py-6 px-4 shadow-lg">
            <h2 className="text-2xl font-bold mb-10 text-center">🧩 MicroVisor</h2>

            <nav className="flex flex-col gap-6">
                <a
                    href="#"
                    className="flex items-center gap-3 text-slate-100 hover:bg-slate-700 px-4 py-2 rounded-lg transition"
                >
                    <Home size={20} /> <span>Inicio</span>
                </a>
                <a
                    href="#"
                    className="flex items-center gap-3 text-slate-100 hover:bg-slate-700 px-4 py-2 rounded-lg transition"
                >
                    <FolderOpen size={20} /> <span>Proyectos</span>
                </a>
                <a
                    href="#"
                    className="flex items-center gap-3 text-slate-100 hover:bg-slate-700 px-4 py-2 rounded-lg transition"
                >
                    <GitBranch size={20} /> <span>Dependencias</span>
                </a>
            </nav>
        </aside>
    );
};

export default Sidebar;

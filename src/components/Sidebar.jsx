import { Home, FolderOpen, GitBranch } from "lucide-react";

const Sidebar = () => {
    return (
        <aside className="w-64 bg-slate-800 text-white h-screen p-6">
            <h2 className="text-xl font-bold mb-10 text-center">🧩 MicroVisor</h2>

            <nav className="flex flex-col gap-4">
                <a className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 rounded-lg transition">
                    <Home size={20} /> Inicio
                </a>
                <a className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 rounded-lg transition">
                    <FolderOpen size={20} /> Proyectos
                </a>
                <a className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 rounded-lg transition">
                    <GitBranch size={20} /> Dependencias
                </a>
            </nav>
        </aside>
    );
};

export default Sidebar;

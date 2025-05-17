import { Home, FolderOpen, GitBranch, GitMerge, Box, Settings, HelpCircle, Container  } from "lucide-react";
import { useState } from "react";

const Sidebar = ({ activePage, onNavigate }) => {
    const [expanded, setExpanded] = useState(true);

    const menuItems = [
        { id: "home", label: "Inicio", icon: Home },
        { id: "projects", label: "Proyectos", icon: FolderOpen },
        { id: "dependencies", label: "Dependencias", icon: GitBranch },
        { id: "microservices", label: "Microservicios", icon: Box },
        { id: "extract", label: "Extracción", icon: GitMerge },
    ];

    const handleClick = (id) => {
        if (onNavigate) {
            onNavigate(id);
        }
    };

    return (
        <aside className={`${expanded ? 'w-64' : 'w-20'} bg-slate-800 text-white h-screen p-4 transition-all duration-300 `}>
            <div className="flex items-start mb-8 justify-between">
                <Container size={30} className="mt-3" />
                <h2 className={`text-lg font-bold mr-20 py-4 ${expanded ? 'block' : 'hidden'}`}>Menú</h2>
                <button
                    className="p-1 mt-3 rounded-md hover:bg-slate-700 transition"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    )}
                </button>
            </div>

            <nav className="flex flex-col gap-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleClick(item.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                            activePage === item.id ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700'
                        }`}
                    >
                        <item.icon size={20} />
                        {expanded && <span>{item.label}</span>}
                    </button>
                ))}
            </nav>

            <div className="mt-auto mb-4">
                <div className="border-t border-slate-700 my-4"></div>
                <button className={`flex items-center gap-3 px-4 py-2 w-full hover:bg-slate-700 rounded-lg transition`}>
                    <Settings size={20} />
                    {expanded && <span>Configuración</span>}
                </button>
                <button className={`flex items-center gap-3 px-4 py-2 w-full hover:bg-slate-700 rounded-lg transition`}>
                    <HelpCircle size={20} />
                    {expanded && <span>Ayuda</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

import { FileBox, GitBranch, PackageOpen, Boxes } from "lucide-react";

const Sidebar = ({ activePage, onNavigate, proyectoCargado }) => {
    const steps = [
        {
            id: "project",
            label: "1. Proyecto",
            icon: FileBox,
            description: "Cargar proyecto",
            enabled: true
        },
        {
            id: "dependencies",
            label: "2. Dependencias",
            icon: GitBranch,
            description: "Analizar dependencias",
            enabled: proyectoCargado
        },
        {
            id: "extraction",
            label: "3. Extracción",
            icon: PackageOpen,
            description: "Extraer módulos",
            enabled: proyectoCargado
        },
        {
            id: "microservices",
            label: "4. Microservicios",
            icon: Boxes,
            description: "Generar microservicios",
            enabled: proyectoCargado
        }
    ];

    return (
        <div className="w-64 bg-slate-800 text-white flex flex-col">
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-xl font-bold">Migración a Microservicios</h1>
                <p className="text-xs text-slate-400 mt-1">Sistema de transformación</p>
            </div>

            <nav className="flex-1 p-4">
                <div className="space-y-2">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = activePage === step.id;
                        const isDisabled = !step.enabled;

                        return (
                            <button
                                key={step.id}
                                onClick={() => step.enabled && onNavigate(step.id)}
                                disabled={isDisabled}
                                className={`w-full text-left p-3 transition-colors flex items-start gap-3 ${
                                    isActive
                                        ? "bg-slate-700 text-white"
                                        : isDisabled
                                            ? "text-slate-500 cursor-not-allowed"
                                            : "text-slate-300 hover:bg-slate-700/50"
                                }`}
                            >
                                <Icon size={20} className="mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{step.label}</div>
                                    <div className="text-xs opacity-75 truncate">{step.description}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </nav>

            <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
                <p>© 2025 PG1 Migration Tool</p>
            </div>
        </div>
    );
};

export default Sidebar;
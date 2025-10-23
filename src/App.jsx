import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProjectInput from "./components/ProjectInput";
import TablaDependencias from "./components/TablaDependencias";
import Extraccion from "./pages/Extraccion";
import { ToastProvider } from "./components/ToastProvider";

function App() {
    const [activePage, setActivePage] = useState("project");
    const [projectName, setProjectName] = useState("");
    const [proyectoProcesado, setProyectoProcesado] = useState("");

    const handleNavigate = (pageId) => {
        setActivePage(pageId);
    };

    const handleProjectSuccess = () => {
        setProyectoProcesado(projectName);
        setActivePage("dependencies");
    };

    const renderContent = () => {
        switch (activePage) {
            case "project":
                return (
                    <div className="px-6 py-8 bg-gray-50 min-h-screen">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white border border-gray-200 p-8">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                    Paso 1: Cargar Proyecto
                                </h2>
                                <p className="text-slate-600 mb-6">
                                    Sube tu proyecto monolítico (.zip) para iniciar el análisis
                                </p>

                                {!proyectoProcesado ? (
                                    <ProjectInput
                                        projectName={projectName}
                                        setProjectName={setProjectName}
                                        onSuccess={handleProjectSuccess}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-green-50 border border-green-200 p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-green-700 font-medium">Proyecto cargado</p>
                                                <p className="text-lg font-bold text-green-900">{proyectoProcesado}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setProyectoProcesado("");
                                                    setProjectName("");
                                                }}
                                                className="px-4 py-2 text-sm bg-white border border-green-300 text-green-700 hover:bg-green-50"
                                            >
                                                Cambiar proyecto
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => setActivePage("dependencies")}
                                            className="w-full px-6 py-3 bg-slate-800 text-white font-medium hover:bg-slate-700"
                                        >
                                            Continuar al análisis de dependencias →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case "dependencies":
                return (
                    <div className="px-6 py-8 bg-gray-50 min-h-screen">
                        <div className="max-w-7xl mx-auto">
                            <div className="bg-white border border-gray-200 p-8">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                    Paso 2: Análisis de Dependencias
                                </h2>
                                <p className="text-slate-600 mb-6">
                                    Visualiza las dependencias del proyecto y los módulos candidatos
                                </p>

                                {!proyectoProcesado ? (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4">
                                        <p className="font-medium">No hay proyecto cargado</p>
                                        <p className="text-sm mt-1">Primero debes cargar un proyecto</p>
                                        <button
                                            className="mt-3 px-4 py-2 bg-amber-600 text-white hover:bg-amber-700"
                                            onClick={() => setActivePage("project")}
                                        >
                                            Ir a cargar proyecto
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <TablaDependencias proyecto={proyectoProcesado} />
                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={() => setActivePage("extraction")}
                                                className="px-6 py-3 bg-slate-800 text-white font-medium hover:bg-slate-700"
                                            >
                                                Continuar a extracción →
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case "extraction":
                return (
                    <div className="px-6 py-8 bg-gray-50 min-h-screen">
                        <div className="max-w-7xl mx-auto">
                            <div className="bg-white border border-gray-200 p-8">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                    Paso 3: Extracción de Módulos
                                </h2>
                                <p className="text-slate-600 mb-6">
                                    Selecciona y extrae los módulos que se convertirán en microservicios
                                </p>

                                {!proyectoProcesado ? (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4">
                                        <p className="font-medium">No hay proyecto cargado</p>
                                        <p className="text-sm mt-1">Primero debes cargar un proyecto</p>
                                        <button
                                            className="mt-3 px-4 py-2 bg-amber-600 text-white hover:bg-amber-700"
                                            onClick={() => setActivePage("project")}
                                        >
                                            Ir a cargar proyecto
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <Extraccion proyectoProcesado={proyectoProcesado} />
                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={() => setActivePage("microservices")}
                                                className="px-6 py-3 bg-slate-800 text-white font-medium hover:bg-slate-700"
                                            >
                                                Continuar a microservicios →
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case "microservices":
                return (
                    <div className="px-6 py-8 bg-gray-50 min-h-screen">
                        <div className="max-w-7xl mx-auto">
                            <div className="bg-white border border-gray-200 p-8">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                    Paso 4: Generación de Microservicios
                                </h2>
                                <p className="text-slate-600 mb-6">
                                    Genera y configura los microservicios extraídos
                                </p>

                                {!proyectoProcesado ? (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4">
                                        <p className="font-medium">No hay proyecto cargado</p>
                                        <p className="text-sm mt-1">Primero debes cargar un proyecto</p>
                                        <button
                                            className="mt-3 px-4 py-2 bg-amber-600 text-white hover:bg-amber-700"
                                            onClick={() => setActivePage("project")}
                                        >
                                            Ir a cargar proyecto
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200 p-6 text-center text-slate-600">
                                        <p className="font-medium mb-2">Funcionalidad en desarrollo</p>
                                        <p className="text-sm">Próximamente disponible</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <ToastProvider>
            <div className="flex h-screen bg-slate-50">
                <Sidebar
                    activePage={activePage}
                    onNavigate={handleNavigate}
                    proyectoCargado={!!proyectoProcesado}
                />
                <div className="flex flex-col flex-1">
                    <Navbar projectName={proyectoProcesado} />
                    <main className="overflow-y-auto flex-1">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
}

export default App;
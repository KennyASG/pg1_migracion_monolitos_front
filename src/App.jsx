import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import ProjectInput from "./components/ProjectInput";

function App() {
    const [activePage, setActivePage] = useState("home");
    const [projectName, setProjectName] = useState("");
    const [proyectoProcesado, setProyectoProcesado] = useState("");

    const handleNavigate = (pageId) => {
        setActivePage(pageId);
    };

    const handleProjectSuccess = () => {
        setProyectoProcesado(projectName);
        if (activePage === "home") {
            setActivePage("dependencies");
        }
    };

    const renderContent = () => {
        switch (activePage) {
            case "dependencies":
                return (
                    <Home
                        projectName={projectName}
                        setProjectName={setProjectName}
                        proyectoProcesado={proyectoProcesado}
                        setProyectoProcesado={setProyectoProcesado}
                        onSuccess={handleProjectSuccess}
                    />
                );
            case "projects":
                return (
                    <div className="px-6 pb-10 bg-gray-100 min-h-screen w-full">
                        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 w-full">
                            <h2 className="text-xl font-semibold text-slate-700 mb-4">Gestión de Proyectos</h2>
                            <p className="text-gray-600 mb-4">
                                Carga un proyecto monolítico para comenzar el análisis y proceso de migración.
                            </p>
                            <div className="max-w-2xl">
                                <ProjectInput
                                    projectName={projectName}
                                    setProjectName={setProjectName}
                                    onSuccess={handleProjectSuccess}
                                />
                            </div>
                        </div>
                    </div>
                );

            case "microservices":
                return (
                    <div className="px-6 pb-10 bg-gray-100 min-h-screen w-full">
                        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 w-full">
                            <h2 className="text-xl font-semibold text-slate-700 mb-4">Candidatos a Microservicios</h2>
                            {!proyectoProcesado ? (
                                <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg">
                                    <p>Primero debes cargar y procesar un proyecto para identificar candidatos a microservicios.</p>
                                    <button
                                        className="mt-2 text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-md"
                                        onClick={() => setActivePage("home")}
                                    >
                                        Ir a cargar proyecto
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-gray-600 mb-4">
                                        Basado en el análisis de dependencias, aquí se presentan los módulos candidatos
                                        a ser convertidos en microservicios independientes.
                                    </p>
                                    {/* Componente de candidatos a microservicios */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                                        Función en desarrollo - Próximamente disponible
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case "extract":
                return (
                    <div className="px-6 pb-10 bg-gray-100 min-h-screen w-full">
                        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 w-full">
                            <h2 className="text-xl font-semibold text-slate-700 mb-4">Extracción de Microservicios</h2>
                            {!proyectoProcesado ? (
                                <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg">
                                    <p>Primero debes cargar y procesar un proyecto, y seleccionar candidatos para la extracción.</p>
                                    <button
                                        className="mt-2 text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-md"
                                        onClick={() => setActivePage("home")}
                                    >
                                        Ir a cargar proyecto
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-gray-600 mb-4">
                                        Inicia el proceso de extracción de los módulos seleccionados como microservicios independientes.
                                    </p>
                                    {/* Componente de extracción */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                                        Función en desarrollo - Próximamente disponible
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return <Home />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar activePage={activePage} onNavigate={handleNavigate} />
            <div className="flex flex-col flex-1 ">
                <Navbar projectName={proyectoProcesado} />
                <main className="overflow-y-auto flex-1">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default App;



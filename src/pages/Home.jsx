import { useState, useEffect } from "react";
import ProjectInput from "../components/ProjectInput";
import TablaDependencias from "../components/TablaDependencias";
import {Box} from "lucide-react";

const Home = ({
                  projectName,
                  setProjectName,
                  proyectoProcesado,
                  setProyectoProcesado,
                  onSuccess
              }) => {

    const [showWelcome, setShowWelcome] = useState(true);


    useEffect(() => {
        if (proyectoProcesado) {
            setShowWelcome(false);
        }
    }, [proyectoProcesado]);

    const handleSuccess = () => {

        setProyectoProcesado(projectName);
        setShowWelcome(false);
        if (onSuccess) onSuccess();
    };

    return (
        <div className="px-6 pb-10 bg-gray-100 min-h-screen w-full">
            {showWelcome && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6 text-indigo-800">

                    <span className="flex"><h1 className="text-2xl font-bold mb-2"> Bienvenido a la herramienta de migración </h1> <Box size={30} className="ml-3" /> </span>
                    <p className="mb-3">
                        Esta herramienta te ayudará a migrar tus aplicaciones monolíticas a una
                        arquitectura de microservicios mediante un análisis automatizado.
                    </p>
                    <ul className="list-disc pl-6 mb-3 space-y-1">
                        <li>Visualiza las dependencias entre componentes</li>
                        <li>Identifica módulos candidatos para convertirse en microservicios</li>
                        <li>Genera automáticamente la estructura para microservicios independientes</li>
                        <li>Implementa patrones de integración entre servicios</li>
                    </ul>
                    <p>Comienza cargando un proyecto monolítico a continuación.</p>
                </div>
            )}

            <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 w-full">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">
                    {proyectoProcesado ? "Proyecto Analizado" : "Análisis de Dependencias"}
                </h2>

                {!proyectoProcesado ? (
                    <div className="max-w-2xl">
                        <ProjectInput
                            projectName={projectName}
                            setProjectName={setProjectName}
                            onSuccess={handleSuccess}
                        />
                    </div>
                ) : (
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <span className="text-sm text-gray-500">Proyecto actual:</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">
                                    {proyectoProcesado}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setProyectoProcesado("")}
                            className="text-sm text-gray-500 hover:text-indigo-600 underline"
                        >
                            Cargar otro proyecto
                        </button>
                    </div>
                )}

                {proyectoProcesado && <TablaDependencias proyecto={proyectoProcesado} />}
            </div>
        </div>
    );
};

export default Home;

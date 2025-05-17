import ProjectInput from "../components/ProjectInput";
import GraphContainer from "../components/GraphContainer";
import { useState } from "react";

const Home = () => {
    const [projectName, setProjectName] = useState("");
    const [proyectoProcesado, setProyectoProcesado] = useState("");

    return (
        <div className="pt-20 px-6 pb-10 bg-gray-100 min-h-screen w-full">
            <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 w-full">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Análisis de Dependencias</h2>
                <ProjectInput
                    projectName={projectName}
                    setProjectName={setProjectName}
                    onSuccess={() => setProyectoProcesado(projectName)}
                />
                {proyectoProcesado && <GraphContainer proyecto={proyectoProcesado} />}
            </div>
        </div>
    );
};

export default Home;

import { useState } from "react";
import ProjectInput from "../components/ProjectInput";
import GraphContainer from "../components/GraphContainer";

const Home = () => {
    const [projectName, setProjectName] = useState("");

    const handleLoadGraph = () => {
        console.log("Cargar proyecto:", projectName);
    };

    return (
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Análisis de Dependencias</h2>
            <ProjectInput
                projectName={projectName}
                setProjectName={setProjectName}
                onLoad={handleLoadGraph}
            />
            <GraphContainer />
        </div>
    );
};

export default Home;

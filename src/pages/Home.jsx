// src/pages/Home.jsx
import { useState } from "react";
import ProjectInput from "../components/ProjectInput";
import GraphContainer from "../components/GraphContainer";

const Home = () => {
    const [projectName, setProjectName] = useState("");

    const handleLoadGraph = () => {
        console.log("Cargar proyecto:", projectName);
    };

    return (
        <div className="pt-20 px-4 md:px-8 lg:px-16 xl:px-32 bg-gray-100 min-h-screen">
            <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Análisis de Dependencias</h2>
                <ProjectInput
                    projectName={projectName}
                    setProjectName={setProjectName}
                    onLoad={handleLoadGraph}
                />
                <GraphContainer />
            </div>
        </div>
    );
};

export default Home;

// src/components/ProjectInput.jsx
const ProjectInput = ({ projectName, setProjectName, onLoad }) => {
    return (
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <input
                type="text"
                placeholder="Nombre del proyecto"
                className="px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500 w-full sm:w-2/3 transition"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
            />
            <button
                onClick={onLoad}
                className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-6 py-2 rounded-xl transition shadow-md"
            >
                Cargar Dependencias
            </button>
        </div>
    );
};

export default ProjectInput;

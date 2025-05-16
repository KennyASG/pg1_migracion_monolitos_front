import { useRef, useState } from "react";

const ProjectInput = ({ projectName, setProjectName }) => {
    const fileInputRef = useRef();
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.name.endsWith(".zip")) {
            setSelectedFile(file);
        } else {
            alert("Solo se permite cargar archivos .zip");
        }
    };

    const handleSubmit = async () => {
        if (!projectName || !selectedFile) {
            alert("Debes ingresar el nombre del proyecto y seleccionar un archivo ZIP.");
            return;
        }

        const formData = new FormData();
        formData.append("ProjectName", projectName);
        formData.append("File", selectedFile);

        try {
            const response = await fetch("https://localhost:7251/api/Archivo/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            alert("✅ Subido: " + result.message);
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error);
            alert("Ocurrió un error al subir el archivo.");
        }
    };

    return (
        <div className="mb-6 flex flex-col gap-4">
            <input
                type="text"
                placeholder="Nombre del proyecto"
                className="px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
            />

            <input
                type="file"
                accept=".zip"
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                 file:rounded-lg file:border-0
                 file:text-sm file:font-semibold
                 file:bg-indigo-600 file:text-white
                 hover:file:bg-indigo-700"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            <button
                onClick={handleSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-xl transition shadow-md w-fit"
            >
                Subir y Procesar ZIP
            </button>
        </div>
    );
};

export default ProjectInput;

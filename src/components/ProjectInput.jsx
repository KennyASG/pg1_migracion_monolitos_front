import { useRef, useState } from "react";
import { FolderOpen, Upload, Loader2, AlertTriangle } from "lucide-react";

const ProjectInput = ({ projectName, setProjectName, onSuccess }) => {
    const fileInputRef = useRef();
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const name = file.name.toLowerCase();

            if (name.endsWith(".zip") || name.endsWith(".csproj")) {
                setSelectedFile(file);
                setFileName(file.name);
                setError("");


                if (name.endsWith(".zip")) {
                    const baseName = file.name.replace(/\.zip$/i, "");
                    setProjectName(baseName);
                }
            } else {
                setError("Solo se permiten archivos .zip o .csproj");
                setSelectedFile(null);
                setFileName("");
            }
        }
    };

    const handleSubmit = async () => {
        if (!projectName) {
            setError("Debes ingresar el nombre del proyecto");
            return;
        }

        if (!selectedFile) {
            setError("Debes seleccionar un archivo");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("ProjectName", projectName);
            formData.append("File", selectedFile);

            const uploadResponse = await fetch("https://localhost:7251/api/Archivo/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error("Error al subir el archivo");
            }

            const result = await uploadResponse.json();
            alert("✅ Subido: " + result.message);
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("Error:", error);
            setError(error.message || "Ocurrió un error al subir el archivo");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mb-6 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Cargar Proyecto Monolítico</h2>

            <div className="flex flex-col gap-4">
                <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Proyecto
                    </label>
                    <input
                        id="projectName"
                        type="text"
                        placeholder="Ej: Sistema de Gestión Bancaria"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Archivo del Proyecto (.zip o .csproj)
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FolderOpen size={18} />
                            Seleccionar Archivo
                        </button>
                        {fileName && (
                            <span className="text-sm text-gray-600 truncate max-w-xs">
                                {fileName}
                            </span>
                        )}
                        <input
                            type="file"
                            accept=".zip,.csproj"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-sm flex items-center gap-1">
                        <AlertTriangle size={16} />
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`flex items-center justify-center gap-2 
                              ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} 
                              text-white font-medium px-6 py-3 rounded-lg transition shadow-md w-full mt-2`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            <Upload size={18} />
                            Subir y Analizar Proyecto
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProjectInput;

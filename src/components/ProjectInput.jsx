import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "./ToastProvider";

const ProjectInput = ({ projectName, setProjectName, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.zip')) {
                addToast('Por favor selecciona un archivo .zip', 'error');
                return;
            }
            setFile(selectedFile);
            setProjectName(selectedFile.name.replace('.zip', ''));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!projectName) {
            addToast('Debes ingresar el nombre del proyecto', 'warning');
            return;
        }

        if (!file) {
            addToast('Debes seleccionar un archivo', 'warning');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("ProjectName", projectName);
        formData.append("File", file);

        try {
            const response = await fetch("https://localhost:7251/api/Archivo/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                addToast(
                    result.message || 'Archivo recibido y análisis completado',
                    'success',
                    4000,
                    () => {
                        if (onSuccess) onSuccess();
                    }
                );
            } else {
                const errorText = await response.text();
                addToast(`Error: ${errorText}`, 'error');
            }
        } catch (error) {
            addToast('Error de conexión con el servidor', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre del Proyecto
                </label>
                <input
                    type="text"
                    placeholder="Ej: MonolithPro"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    disabled={loading}
                    className="w-full p-3 border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-slate-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Archivo del proyecto (.zip)
                </label>
                <div className="relative">
                    <input
                        type="file"
                        accept=".zip"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        disabled={loading}
                    />
                    <label
                        htmlFor="file-upload"
                        className={`flex items-center gap-3 p-4 border-2 border-dashed border-slate-300 
                            bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <Upload size={20} className="text-slate-600" />
                        <span className="text-sm text-slate-600">
                            {file ? file.name : 'Seleccionar archivo...'}
                        </span>
                    </label>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || !file || !projectName}
                className={`w-full py-3 px-4 font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                    loading || !file || !projectName
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-slate-700'
                }`}
            >
                {loading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Procesando...</span>
                    </>
                ) : (
                    <span>Cargar y Analizar</span>
                )}
            </button>
        </form>
    );
};

export default ProjectInput;
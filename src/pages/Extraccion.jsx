import { useState } from "react";
import { Loader2, Package } from "lucide-react";
import { useToast } from "../components/ToastProvider";
import { transformacionFuncionalApi } from "../services/api";

const Extraccion = ({ proyectoProcesado }) => {
    const [modulo, setModulo] = useState("");
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);
    const { addToast } = useToast();
    
    // Módulos disponibles
    const modulos = ["Users", "Orders", "Inventory"];

    const handleGenerarMicroservicio = async () => {
        if (!modulo) {
            addToast("Por favor selecciona un módulo", "warning");
            return;
        }

        setLoading(true);
        setResultado(null);

        try {
            const response = await transformacionFuncionalApi.generarMicroservicio(proyectoProcesado, modulo);
            setResultado(response);
            addToast(
                response.message || `Microservicio '${modulo}' generado exitosamente`,
                'success'
            );
        } catch (err) {
            addToast(err.message || 'Error al generar microservicio', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <p className="text-slate-600 mb-6">
                Genera un microservicio funcional completo con la lógica de negocio del módulo seleccionado.
            </p>

            <div className="mb-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Módulo a Extraer
                    </label>
                    <select
                        value={modulo}
                        onChange={(e) => setModulo(e.target.value)}
                        disabled={loading}
                        className="w-full p-3 border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-slate-500"
                    >
                        <option value="">-- Seleccionar Módulo --</option>
                        {modulos.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleGenerarMicroservicio}
                    disabled={loading || !modulo}
                    className={`w-full py-3 px-4 font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                        loading || !modulo
                            ? 'bg-slate-400 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Generando Microservicio...</span>
                        </>
                    ) : (
                        <>
                            <Package size={18} />
                            <span>Generar Microservicio</span>
                        </>
                    )}
                </button>
            </div>

            {resultado && (
                <div className="space-y-4">
                    <div className="border border-slate-200 bg-white p-6 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                            <Package size={20} className="text-slate-600" />
                            <h3 className="text-lg font-bold text-slate-800">
                                Microservicio Generado
                            </h3>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500 mb-1">📁 Ruta del Microservicio:</p>
                            <div className="bg-slate-900 text-green-400 p-3 font-mono text-sm overflow-x-auto">
                                {resultado.rutaGenerada || resultado.rutaMicroservicio}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500 mb-1">💡 Ejecuta el microservicio:</p>
                            <div className="bg-slate-900 text-amber-300 p-3 font-mono text-sm overflow-x-auto">
                                cd {resultado.rutaGenerada || resultado.rutaMicroservicio} && dotnet run
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-slate-800">
                                    {resultado.detalles?.controllers || 0}
                                </p>
                                <p className="text-xs text-slate-600">Controllers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-slate-800">
                                    {resultado.detalles?.services || 0}
                                </p>
                                <p className="text-xs text-slate-600">Services</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-slate-800">
                                    {resultado.detalles?.modelos || 0}
                                </p>
                                <p className="text-xs text-slate-600">Modelos</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!resultado && !loading && (
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 text-sm text-slate-600">
                    <strong>Información:</strong> La migración funcional extrae el código completo del módulo
                    seleccionado, incluyendo modelos, servicios y controllers con su lógica de negocio.
                </div>
            )}
        </div>
    );
};

export default Extraccion;
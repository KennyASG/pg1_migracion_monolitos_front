// src/pages/Extraccion.jsx
import { useState } from "react";
import { transformacionFuncionalApi } from "../services/api";

const Extraccion = ({ proyectoProcesado }) => {
    const [modulo, setModulo] = useState("");
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState(null);
    
    // Módulos disponibles
    const modulos = ["Users", "Orders", "Inventory"];

    const handleGenerarMicroservicio = async () => {
        if (!modulo) {
            setError("Por favor selecciona un módulo");
            return;
        }

        setLoading(true);
        setError(null);
        setResultado(null);

        try {
            const response = await transformacionFuncionalApi.generarMicroservicio(proyectoProcesado, modulo);
            setResultado(response);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <p className="text-gray-600 mb-6">
                Genera un microservicio funcional completo con la lógica de negocio del módulo seleccionado.
            </p>

            {/* Formulario de selección */}
            <div className="mb-6 space-y-4">
                {/* Selector de Módulo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Módulo a Extraer
                    </label>
                    <select
                        value={modulo}
                        onChange={(e) => setModulo(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                        <option value="">-- Seleccionar Módulo --</option>
                        {modulos.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Botón de Generación */}
                <button
                    onClick={handleGenerarMicroservicio}
                    disabled={loading || !modulo}
                    className={`w-full py-3 px-6 rounded-xl font-medium transition shadow-md ${
                        loading || !modulo
                            ? "bg-gray-400 cursor-not-allowed text-gray-200"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                >
                    {loading ? "Generando..." : "Generar Microservicio"}
                </button>
            </div>

            {/* Mensaje de Error */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 font-medium">Error</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
            )}

            {/* Resultado de la Generación */}
            {resultado && (
                <div className="space-y-4">
                    {/* Mensaje de Éxito */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-green-700 font-medium">{resultado.message}</p>
                    </div>

                    {/* Ruta Generada */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 mb-2">
                            📁 Ruta del Microservicio:
                        </p>
                        <div className="bg-slate-800 text-green-400 p-3 rounded-lg font-mono text-sm break-all">
                            {resultado.rutaGenerada}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            💡 Ejecuta: <code className="bg-slate-200 px-2 py-1 rounded">cd {resultado.rutaGenerada} && dotnet run</code>
                        </p>
                    </div>

                    {/* Detalles de la Generación */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm font-medium text-blue-700 mb-2">
                             Resumen de Migración:
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-blue-600">
                                    {resultado.detalles?.controllers || 0}
                                </p>
                                <p className="text-xs text-blue-700">Controllers</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">
                                    {resultado.detalles?.services || 0}
                                </p>
                                <p className="text-xs text-blue-700">Services</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">
                                    {resultado.detalles?.modelos || 0}
                                </p>
                                <p className="text-xs text-blue-700">Modelos</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Información adicional */}
            {!resultado && !error && !loading && (
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-sm text-slate-600">
                        <strong>Información:</strong> La migración funcional extrae el código completo del módulo
                        seleccionado, incluyendo modelos, servicios y controllers con su lógica de negocio.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Extraccion;
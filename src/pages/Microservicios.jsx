import { useState } from "react";
import { Loader2, Package, Container, Play, Activity, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "../components/ToastProvider";
import { containerizationApi } from "../services/api";

const Microservicios = ({ proyectoProcesado, rutaMicroservicio, moduloGenerado }) => {
    const [currentStep, setCurrentStep] = useState(1); // 1: Build, 2: Deploy, 3: Status
    const [loading, setLoading] = useState(false);
    const [buildResult, setBuildResult] = useState(null);
    const [deployResult, setDeployResult] = useState(null);
    const [statusResult, setStatusResult] = useState(null);
    const { addToast } = useToast();

    // Módulos disponibles (si no viene de extracción)
    const [selectedModule, setSelectedModule] = useState(moduloGenerado || "");
    const modulos = ["Users", "Orders", "Inventory"];

    // BUILD - Paso 1
    const handleBuild = async () => {
        if (!selectedModule) {
            addToast("Debes seleccionar un módulo", "warning");
            return;
        }

        setLoading(true);
        setBuildResult(null);

        try {
            const result = await containerizationApi.buildMicroservicio(
                proyectoProcesado,
                selectedModule,
                rutaMicroservicio || `/Users/kennysaenz/RiderProjects/PGI_Migracion_Monolitos/TransformadorService/MicroserviciosGenerados/${selectedModule}`
            );
            
            setBuildResult(result);
            addToast("Imagen Docker construida exitosamente", "success");
            setCurrentStep(2); // Avanzar a Deploy
        } catch (error) {
            addToast(error.message || "Error al construir imagen", "error");
        } finally {
            setLoading(false);
        }
    };

    // DEPLOY - Paso 2
    const handleDeploy = async () => {
        setLoading(true);
        setDeployResult(null);

        try {
            const result = await containerizationApi.deployMicroservicio(
                selectedModule,
                false, // rebuildImage
                false  // forceRecreate
            );
            
            setDeployResult(result);
            addToast("Microservicio desplegado exitosamente", "success");
            setCurrentStep(3); // Avanzar a Status
        } catch (error) {
            addToast(error.message || "Error al desplegar contenedor", "error");
        } finally {
            setLoading(false);
        }
    };

    // STATUS - Paso 3
    const handleCheckStatus = async () => {
        setLoading(true);

        try {
            const result = await containerizationApi.getStatus(selectedModule);
            setStatusResult(result);
            addToast("Estado actualizado", "info");
        } catch (error) {
            addToast(error.message || "Error al obtener estado", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Selector de Módulo (si no viene de extracción) */}
            {!moduloGenerado && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Módulo a Contenerizar
                    </label>
                    <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        disabled={loading || currentStep > 1}
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
            )}

            {/* Indicador de Pasos */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <StepIndicator number={1} label="Build" active={currentStep === 1} completed={currentStep > 1} />
                <div className="flex-1 h-0.5 bg-slate-200 mx-2">
                    <div className={`h-full transition-all ${currentStep > 1 ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
                <StepIndicator number={2} label="Deploy" active={currentStep === 2} completed={currentStep > 2} />
                <div className="flex-1 h-0.5 bg-slate-200 mx-2">
                    <div className={`h-full transition-all ${currentStep > 2 ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
                <StepIndicator number={3} label="Status" active={currentStep === 3} completed={false} />
            </div>

            {/* PASO 1: BUILD */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Container size={20} className="text-slate-600" />
                        <h3 className="text-lg font-bold text-slate-800">Construir Imagen Docker</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                        Este paso crea una imagen Docker del microservicio seleccionado.
                    </p>
                    <button
                        onClick={handleBuild}
                        disabled={loading || !selectedModule}
                        className={`w-full py-3 px-4 font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                            loading || !selectedModule
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Construyendo...</span>
                            </>
                        ) : (
                            <>
                                <Package size={18} />
                                <span>Construir Imagen</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* PASO 2: DEPLOY */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Play size={20} className="text-slate-600" />
                        <h3 className="text-lg font-bold text-slate-800">Desplegar Contenedor</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                        Despliega el microservicio como un contenedor Docker en ejecución.
                    </p>

                    {buildResult && (
                        <div className="p-4 bg-slate-50 border border-slate-200 text-sm">
                            <p className="font-medium text-slate-700">Imagen construida:</p>
                            <p className="text-slate-600 font-mono text-xs mt-1">
                                {buildResult.imagenDocker || buildResult.containerId || buildResult.imageName || 'Imagen creada'}
                            </p>
                            {buildResult.message && (
                                <p className="text-slate-600 text-xs mt-2">{buildResult.message}</p>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleDeploy}
                        disabled={loading}
                        className={`w-full py-3 px-4 font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                            loading
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Desplegando...</span>
                            </>
                        ) : (
                            <>
                                <Play size={18} />
                                <span>Desplegar Contenedor</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* PASO 3: STATUS */}
            {currentStep === 3 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Activity size={20} className="text-slate-600" />
                        <h3 className="text-lg font-bold text-slate-800">Estado del Microservicio</h3>
                    </div>

                    {deployResult && (
                        <div className="p-4 bg-green-50 border border-green-200">
                            <p className="font-medium text-green-800">✓ Contenedor desplegado</p>
                            <div className="mt-2 space-y-1 text-sm text-green-700">
                                {deployResult.contenedorId && (
                                    <p>ID: <span className="font-mono text-xs">{deployResult.contenedorId}</span></p>
                                )}
                                {deployResult.uri && (
                                    <p>URL: <a href={deployResult.uri} target="_blank" rel="noopener noreferrer" className="underline">{deployResult.uri}</a></p>
                                )}
                                {deployResult.puertoAsignado && (
                                    <p>Puerto: <span className="font-mono">{deployResult.puertoAsignado}</span></p>
                                )}
                                {deployResult.imagenDocker && (
                                    <p>Imagen: <span className="font-mono text-xs">{deployResult.imagenDocker}</span></p>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleCheckStatus}
                        disabled={loading}
                        className={`w-full py-3 px-4 font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                            loading
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Verificando...</span>
                            </>
                        ) : (
                            <>
                                <Activity size={18} />
                                <span>Verificar Estado</span>
                            </>
                        )}
                    </button>

                    {statusResult && (
                        <div className="border border-slate-200 bg-white p-4">
                            <div className="flex items-center gap-2 mb-3">
                                {statusResult.isRunning ? (
                                    <CheckCircle size={20} className="text-green-500" />
                                ) : (
                                    <XCircle size={20} className="text-red-500" />
                                )}
                                <p className={`font-medium ${statusResult.isRunning ? 'text-green-700' : 'text-red-700'}`}>
                                    {statusResult.dockerStatus || 'Estado del contenedor'}
                                </p>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                                {statusResult.contenedorId && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Contenedor ID:</span>
                                        <span className="font-mono text-slate-800">{statusResult.contenedorId}</span>
                                    </div>
                                )}
                                {statusResult.imagenDocker && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Imagen:</span>
                                        <span className="font-mono text-slate-800">{statusResult.imagenDocker}</span>
                                    </div>
                                )}
                                {statusResult.puertoAsignado && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Puerto:</span>
                                        <span className="font-mono text-slate-800">{statusResult.puertoAsignado}</span>
                                    </div>
                                )}
                                {statusResult.uri && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">URL:</span>
                                        <a 
                                            href={statusResult.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-600 hover:underline"
                                        >
                                            {statusResult.uri}
                                        </a>
                                    </div>
                                )}
                                {statusResult.fechaCreacion && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Creado:</span>
                                        <span className="text-slate-800">{new Date(statusResult.fechaCreacion).toLocaleString()}</span>
                                    </div>
                                )}
                                {statusResult.fechaUltimaActualizacion && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Actualizado:</span>
                                        <span className="text-slate-800">{new Date(statusResult.fechaUltimaActualizacion).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Componente auxiliar para indicador de pasos
const StepIndicator = ({ number, label, active, completed }) => {
    return (
        <div className="flex flex-col items-center">
            <div className={`w-10 h-10 flex items-center justify-center font-bold border-2 transition-colors ${
                completed ? 'bg-slate-800 border-slate-800 text-white' :
                active ? 'bg-white border-slate-800 text-slate-800' :
                'bg-white border-slate-300 text-slate-400'
            }`}>
                {completed ? '✓' : number}
            </div>
            <span className={`text-xs mt-1 font-medium ${active || completed ? 'text-slate-800' : 'text-slate-400'}`}>
                {label}
            </span>
        </div>
    );
};

export default Microservicios;
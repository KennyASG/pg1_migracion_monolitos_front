// components/TablaDependencias.jsx
import { useEffect, useState, useMemo } from "react";

const TablaDependencias = ({ proyecto, onSeleccionarCandidato }) => {
    const [dependencias, setDependencias] = useState([]);
    const [filtroTexto, setFiltroTexto] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState("Todos");
    const [vistaAgrupada, setVistaAgrupada] = useState(false);
    const [candidatosSeleccionados, setCandidatosSeleccionados] = useState([]);
    const [moduloSeleccionado, setModuloSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTabla = async () => {
            setLoading(true);
            try {
                const res = await fetch(`https://localhost:7251/api/Dependencias/tabla?proyecto=${proyecto}`);
                const data = await res.json();
                setDependencias(data);
            } catch (error) {
                console.error("Error al cargar dependencias:", error);
            } finally {
                setLoading(false);
            }
        };

        if (proyecto) {
            fetchTabla();
        }
    }, [proyecto]);

    // Detectar tipos de componentes
    const detectarTipo = (nombre) => {
        if (nombre.endsWith('Controller')) return 'Controller';
        if (nombre.endsWith('Service')) return 'Service';
        if (nombre.endsWith('Repository')) return 'Repository';
        if (nombre.startsWith('I') && /[A-Z]/.test(nombre.charAt(1))) return 'Interface';
        if (nombre.includes('Model') || nombre.includes('DTO') || nombre.includes('Entity')) return 'Model';
        return 'Otros';
    };

    // Procesar dependencias para añadir información útil
    const dependenciasProcesadas = useMemo(() => {
        return dependencias.map(dep => ({
            ...dep,
            tipoOrigen: dep.tipoOrigen || detectarTipo(dep.origen),
            tipoDestino: dep.tipoDestino || detectarTipo(dep.destino),
            // Extraer posible módulo del nombre (quitando sufijos comunes)
            moduloOrigen: dep.origen.replace('Controller', '').replace('Service', '').replace('Repository', ''),
            moduloDestino: dep.destino.replace('Controller', '').replace('Service', '').replace('Repository', '')
        }));
    }, [dependencias]);

    // Identificar módulos potenciales
    const modulos = useMemo(() => {
        const modulosMap = new Map();

        // Identificar controladores como puntos de entrada a módulos
        dependenciasProcesadas.forEach(dep => {
            if (dep.tipoOrigen === 'Controller') {
                const moduloNombre = dep.moduloOrigen;

                if (!modulosMap.has(moduloNombre)) {
                    modulosMap.set(moduloNombre, {
                        nombre: moduloNombre,
                        componentes: new Set([dep.origen]),
                        dependenciasInternas: new Set(),
                        dependenciasExternas: new Set(),
                        tieneControlador: true,
                        tieneRepositorio: false,
                        tieneModelo: false
                    });
                }

                // Agregar el destino al módulo si parece relacionado
                if (dep.destino.includes(moduloNombre) ||
                    dep.tipoDestino === 'Model' ||
                    dep.tipoDestino === 'Repository') {
                    modulosMap.get(moduloNombre).componentes.add(dep.destino);
                    modulosMap.get(moduloNombre).dependenciasInternas.add(dep);

                    if (dep.tipoDestino === 'Repository') {
                        modulosMap.get(moduloNombre).tieneRepositorio = true;
                    }
                    if (dep.tipoDestino === 'Model') {
                        modulosMap.get(moduloNombre).tieneModelo = true;
                    }
                } else {
                    modulosMap.get(moduloNombre).dependenciasExternas.add(dep);
                }
            }
        });

        // Calcular métricas para cada módulo
        return Array.from(modulosMap.values()).map(modulo => {
            const ratioInterno = modulo.dependenciasInternas.size /
                (modulo.dependenciasInternas.size + modulo.dependenciasExternas.size || 1);

            // Un módulo es buen candidato si:
            // 1. Tiene controlador, modelo (opcional: repositorio)
            // 2. Tiene alta cohesión interna (más dependencias internas que externas)
            // 3. No tiene muchas dependencias externas
            const esBuenCandidato =
                modulo.tieneControlador &&
                (modulo.tieneModelo || modulo.tieneRepositorio) &&
                ratioInterno > 0.5 &&
                modulo.dependenciasExternas.size < 10;

            return {
                ...modulo,
                componentesCount: modulo.componentes.size,
                cohesionInterna: ratioInterno,
                esBuenCandidato,
                componentes: Array.from(modulo.componentes),
                dependenciasInternas: Array.from(modulo.dependenciasInternas),
                dependenciasExternas: Array.from(modulo.dependenciasExternas)
            };
        });
    }, [dependenciasProcesadas]);

    // Filtrar dependencias
    const dependenciasFiltradas = useMemo(() => {
        // Si hay un módulo seleccionado, mostrar solo sus dependencias
        if (moduloSeleccionado) {
            const modulo = modulos.find(m => m.nombre === moduloSeleccionado);
            if (modulo) {
                return [...modulo.dependenciasInternas, ...modulo.dependenciasExternas]
                    .filter(dep => {
                        const coincideTexto =
                            dep.origen.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                            dep.destino.toLowerCase().includes(filtroTexto.toLowerCase());
                        const coincideTipo =
                            tipoFiltro === "Todos" ||
                            dep.tipoOrigen === tipoFiltro ||
                            dep.tipoDestino === tipoFiltro;

                        return coincideTexto && coincideTipo;
                    });
            }
        }

        // Filtro normal
        return dependenciasProcesadas.filter((dep) => {
            const coincideTexto =
                dep.origen.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                dep.destino.toLowerCase().includes(filtroTexto.toLowerCase());
            const coincideTipo =
                tipoFiltro === "Todos" ||
                dep.tipoOrigen === tipoFiltro ||
                dep.tipoDestino === tipoFiltro;

            return coincideTexto && coincideTipo;
        });
    }, [dependenciasProcesadas, filtroTexto, tipoFiltro, moduloSeleccionado, modulos]);

    // Componentes por tipo (para estadísticas)
    const conteoComponentes = useMemo(() => {
        const tipos = ['Controller', 'Service', 'Repository', 'Model', 'Interface', 'Otros'];
        const conteo = {};

        // Inicializar contadores
        tipos.forEach(t => { conteo[t] = 0; });

        // Contar componentes únicos
        const origenes = new Set(dependenciasProcesadas.map(d => d.origen));
        const destinos = new Set(dependenciasProcesadas.map(d => d.destino));

        // Unir todos los componentes únicos
        const componentesUnicos = new Set([...origenes, ...destinos]);

        // Contar por tipo
        componentesUnicos.forEach(c => {
            const tipo = detectarTipo(c);
            conteo[tipo]++;
        });

        return conteo;
    }, [dependenciasProcesadas]);

    const toggleSeleccionCandidato = (nombre) => {
        setCandidatosSeleccionados(prev => {
            if (prev.includes(nombre)) {
                return prev.filter(n => n !== nombre);
            } else {
                return [...prev, nombre];
            }
        });
    };

    const exportarCandidatos = () => {
        const modulosSeleccionados = modulos.filter(m =>
            candidatosSeleccionados.includes(m.nombre)
        );

        // Aquí puedes implementar la lógica de exportación
        // Por ahora solo llamamos al callback
        if (onSeleccionarCandidato && modulosSeleccionados.length > 0) {
            onSeleccionarCandidato(modulosSeleccionados);
        }
    };

    // Opciones de filtro
    const tipos = ["Todos", "Controller", "Service", "Repository", "Model", "Interface", "Otros"];

    const renderChip = (tipo) => {
        const colorMap = {
            'Controller': 'bg-blue-100 text-blue-800',
            'Service': 'bg-purple-100 text-purple-800',
            'Repository': 'bg-indigo-100 text-indigo-800',
            'Model': 'bg-yellow-100 text-yellow-800',
            'Interface': 'bg-orange-100 text-orange-800',
            'Otros': 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[tipo] || 'bg-gray-100'}`}>
                {tipo}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="mt-4">
            {/* Panel de control */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
                <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Buscar clase..."
                            value={filtroTexto}
                            onChange={(e) => setFiltroTexto(e.target.value)}
                            className="border rounded-lg px-4 py-2 w-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={tipoFiltro}
                            onChange={(e) => setTipoFiltro(e.target.value)}
                            className="border rounded-lg px-3 py-2"
                        >
                            {tipos.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setVistaAgrupada(!vistaAgrupada)}
                            className={`px-3 py-2 rounded-lg border ${vistaAgrupada ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'}`}
                        >
                            {vistaAgrupada ? '🔍 Vista de módulos' : '🔢 Vista de dependencias'}
                        </button>
                        {moduloSeleccionado && (
                            <button
                                onClick={() => setModuloSeleccionado(null)}
                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                ← Volver
                            </button>
                        )}
                    </div>
                </div>

                {/* Resumen / Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">Resumen del proyecto</h3>
                        <div className="text-sm">
                            <p>Total de dependencias: <span className="font-medium">{dependenciasProcesadas.length}</span></p>
                            <p>Componentes únicos: <span className="font-medium">{new Set([...dependenciasProcesadas.map(d => d.origen), ...dependenciasProcesadas.map(d => d.destino)]).size}</span></p>
                            <p>Módulos potenciales: <span className="font-medium">{modulos.length}</span></p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">Componentes por tipo</h3>
                        <div className="flex flex-wrap gap-2 text-sm">
                            {Object.entries(conteoComponentes).map(([tipo, cantidad]) => (
                                cantidad > 0 && (
                                    <div key={tipo} className="flex items-center">
                                        {renderChip(tipo)}
                                        <span className="ml-1 mr-2">{cantidad}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">Candidatos a Microservicios</h3>
                        <div className="text-sm">
                            <p>Candidatos detectados: <span className="font-medium">{modulos.filter(m => m.esBuenCandidato).length}</span></p>
                            <p>Candidatos seleccionados: <span className="font-medium">{candidatosSeleccionados.length}</span></p>
                            {candidatosSeleccionados.length > 0 && (
                                <button
                                    onClick={exportarCandidatos}
                                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                >
                                    Iniciar extracción
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {vistaAgrupada ? (
                // Vista de módulos
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="font-medium text-gray-800">Módulos potenciales para Microservicios</h3>
                    </div>
                    <div className="overflow-auto">
                        <table className="min-w-full divide-y divide-gray-300 text-sm">
                            <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="px-4 py-2 font-semibold">Selección</th>
                                <th className="px-4 py-2 font-semibold">Módulo</th>
                                <th className="px-4 py-2 font-semibold">Componentes</th>
                                <th className="px-4 py-2 font-semibold">Cohesión</th>
                                <th className="px-4 py-2 font-semibold">Controlador</th>
                                <th className="px-4 py-2 font-semibold">Modelo</th>
                                <th className="px-4 py-2 font-semibold">Repositorio</th>
                                <th className="px-4 py-2 font-semibold">Acciones</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {modulos.map((modulo) => (
                                <tr key={modulo.nombre} className={modulo.esBuenCandidato ? 'bg-green-50' : ''}>
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={candidatosSeleccionados.includes(modulo.nombre)}
                                            onChange={() => toggleSeleccionCandidato(modulo.nombre)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        {modulo.nombre}
                                        {modulo.esBuenCandidato && (
                                            <span className="ml-2 text-green-600">✓</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{modulo.componentesCount}</td>
                                    <td className="px-4 py-3">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    modulo.cohesionInterna > 0.7 ? 'bg-green-500' :
                                                        modulo.cohesionInterna > 0.5 ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                }`}
                                                style={{ width: `${modulo.cohesionInterna * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500 ml-1">
                                                {Math.round(modulo.cohesionInterna * 100)}%
                                            </span>
                                    </td>
                                    <td className="px-4 py-3">{modulo.tieneControlador ? '✓' : '—'}</td>
                                    <td className="px-4 py-3">{modulo.tieneModelo ? '✓' : '—'}</td>
                                    <td className="px-4 py-3">{modulo.tieneRepositorio ? '✓' : '—'}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => {
                                                setModuloSeleccionado(modulo.nombre);
                                                setVistaAgrupada(false); // Esta línea es la clave
                                            }}
                                            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100"
                                        >
                                            Ver dependencias
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {modulos.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                                        No se han detectado módulos
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                // Vista de dependencias
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-medium text-gray-800">
                            {moduloSeleccionado ? `Dependencias del módulo: ${moduloSeleccionado}` : 'Tabla de dependencias'}
                        </h3>
                        <div className="text-sm text-gray-500">
                            {dependenciasFiltradas.length} resultados
                        </div>
                    </div>
                    <div className="overflow-auto max-h-[500px]">
                        <table className="min-w-full divide-y divide-gray-300 text-sm">
                            <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="px-4 py-2 font-semibold">Origen</th>
                                <th className="px-4 py-2 font-semibold">Tipo</th>
                                <th className="px-4 py-2 font-semibold">→</th>
                                <th className="px-4 py-2 font-semibold">Destino</th>
                                <th className="px-4 py-2 font-semibold">Tipo</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {dependenciasFiltradas.map((dep, idx) => {
                                // Determinar si es una dependencia externa al módulo
                                const esDependenciaExterna = moduloSeleccionado &&
                                    (dep.moduloOrigen !== moduloSeleccionado || dep.moduloDestino !== moduloSeleccionado);

                                return (
                                    <tr key={idx} className={esDependenciaExterna ? 'bg-yellow-50' : ''}>
                                        <td className="px-4 py-2 font-medium">{dep.origen}</td>
                                        <td className="px-4 py-2">{renderChip(dep.tipoOrigen)}</td>
                                        <td className="px-4 py-2 text-center text-gray-500">→</td>
                                        <td className="px-4 py-2 font-medium">{dep.destino}</td>
                                        <td className="px-4 py-2">{renderChip(dep.tipoDestino)}</td>
                                    </tr>
                                );
                            })}
                            {dependenciasFiltradas.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                                        No hay resultados
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Leyenda */}
            <div className="mt-4 p-3 bg-white rounded-lg shadow text-sm border-l-4 border-blue-500">
                <h4 className="font-medium text-gray-700 mb-2">Guía para identificar candidatos</h4>
                <ul className="space-y-1 list-disc pl-5">
                    <li>Los módulos marcados en <span className="text-green-600 font-medium">verde</span> son buenos candidatos para extraer como microservicios.</li>
                    <li>Un buen candidato tiene alta cohesión interna (más del 50%) y contiene controlador y al menos un modelo o repositorio.</li>
                    <li>En la vista detallada, las dependencias <span className="text-yellow-600 font-medium">amarillas</span> son externas al módulo y representan interfaces a otros módulos.</li>
                    <li>Selecciona los candidatos que deseas extraer y haz clic en "Iniciar extracción" para continuar.</li>
                </ul>
            </div>
        </div>
    );
};

export default TablaDependencias;

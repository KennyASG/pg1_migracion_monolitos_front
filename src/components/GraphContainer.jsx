import React, { useEffect, useState, useRef, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";

const GraphContainer = ({ proyecto, onSelectNode }) => {
    const [grafo, setGrafo] = useState(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [selectedNode, setSelectedNode] = useState(null);
    const [modulosCandidatos, setModulosCandidatos] = useState([]);
    const graphRef = useRef();

    useEffect(() => {
        if (!proyecto) return;

        const obtenerGrafo = async () => {
            try {
                const resp = await fetch(
                    `https://localhost:7251/api/Dependencias/grafo?proyecto=${proyecto}`
                );
                const data = await resp.json();
                console.log("grafo raw:", data);

                // 1) Mapa de nodos
                const nodesMap = new Map();
                data.nodes.forEach((n) => {
                    if (!n.id) return;
                    nodesMap.set(n.id, {
                        id: n.id,
                        label: n.label || n.id,
                        inDegree: 0,
                        outDegree: 0,
                        isController: /.+Controller$/.test(n.id),
                        isInterface:
                            n.id.startsWith("I") && /[A-Z]/.test(n.id.charAt(1)),
                        isService: n.id.includes("Service"),
                        isModel:
                            !n.id.includes("Controller") &&
                            !n.id.includes("Service") &&
                            !(
                                n.id.startsWith("I") &&
                                /[A-Z]/.test(n.id.charAt(1))
                            ),
                    });
                });

                // 2) Deduplicar edges a partir de data.links
                const raw = data.links || [];
                const unique = Array.from(
                    new Set(raw.map((e) => `${e.source}|${e.target}`))
                ).map((key) => {
                    const [source, target] = key.split("|");
                    return { source, target };
                });

                // 3) Filtrar sólo aquellos con ambos extremos en nodesMap
                const validEdges = unique.filter(
                    (e) => nodesMap.has(e.source) && nodesMap.has(e.target)
                );

                // 4) Calcular in/out degree
                validEdges.forEach((e) => {
                    nodesMap.get(e.source).outDegree++;
                    nodesMap.get(e.target).inDegree++;
                });

                // 5) Detectar módulos candidatos
                const modules = identifyModules(
                    Array.from(nodesMap.values()),
                    validEdges
                );
                setModulosCandidatos(modules);

                // 6) Enriquecer nodos
                const enriched = Array.from(nodesMap.values()).map((node) => ({
                    ...node,
                    instability:
                        node.outDegree / (node.inDegree + node.outDegree || 1),
                    moduleId: getModuleForNode(node.id, modules),
                    isCandidateForExtraction: isCandidateForMicroservice(
                        node,
                        nodesMap,
                        modules,
                        validEdges
                    ),
                }));

                // 7) Poner grafo en estado
                setGrafo({
                    nodes: enriched,
                    links: validEdges.map((e) => ({
                        source: e.source,
                        target: e.target,
                    })),
                });
            } catch (err) {
                console.error("Error cargar grafo:", err);
            }
        };

        obtenerGrafo();
    }, [proyecto]);

    // -------------------
    // Auxiliares
    // -------------------
    const identifyModules = (nodes, edges) => {
        const modules = [];
        const controllers = nodes.filter((n) =>
            /.+Controller$/.test(n.id)
        );
        controllers.forEach((ctr) => {
            const name = ctr.id.replace(/Controller$/, "");
            const related = new Set();
            edges
                .filter((e) => e.source === ctr.id)
                .forEach((e) => related.add(e.target));
            nodes
                .filter(
                    (n) =>
                        n.id !== ctr.id &&
                        n.id.toLowerCase().includes(name.toLowerCase())
                )
                .forEach((n) => related.add(n.id));
            modules.push({
                id: name,
                controllerNode: ctr.id,
                relatedNodes: Array.from(related),
                isCohesive: related.size > 0,
            });
        });
        return modules;
    };

    const getModuleForNode = (nodeId, modules) => {
        for (const m of modules) {
            if (
                m.controllerNode === nodeId ||
                m.relatedNodes.includes(nodeId)
            ) {
                return m.id;
            }
        }
        return null;
    };

    const isCandidateForMicroservice = (
        node,
        nodesMap,
        modules,
        edges
    ) => {
        if (node.isController) {
            const mod = modules.find(
                (m) => m.controllerNode === node.id
            );
            return mod?.isCohesive && node.inDegree < 3;
        }
        if (node.isService) {
            const users = edges
                .filter((e) => e.target === node.id)
                .map((e) => e.source);
            const moduleIds = new Set(
                users
                    .map((u) => getModuleForNode(u, modules))
                    .filter(Boolean)
            );
            return moduleIds.size === 1 && node.outDegree < 10;
        }
        return false;
    };

    const getNodeColor = (node) => {
        if (highlightNodes.size && !highlightNodes.has(node.id)) {
            return "rgba(180,180,180,0.2)";
        }
        if (node.isCandidateForExtraction) {
            return "rgba(46,204,113,0.8)";
        }
        if (node.isController) return "rgba(52,152,219,0.8)";
        if (node.isService) return "rgba(155,89,182,0.8)";
        if (node.isModel) return "rgba(241,196,15,0.8)";
        if (node.isInterface) return "rgba(230,126,34,0.8)";
        return "rgba(149,165,166,0.8)";
    };

    const getNodeLabel = (node) => {
        const metrics = `In: ${node.inDegree}  Out: ${node.outDegree}  Inst: ${node.instability.toFixed(
            2
        )}`;
        const type = node.isController
            ? "(C)"
            : node.isService
                ? "(S)"
                : node.isModel
                    ? "(M)"
                    : node.isInterface
                        ? "(I)"
                        : "";
        const mod = node.moduleId ? `  Module: ${node.moduleId}` : "";
        return `${node.label} ${type}\n${metrics}${mod}`;
    };

    // -------------------
    // Interacciones
    // -------------------
    const handleNodeHover = useCallback(
        (node) => {
            if (selectedNode) return;
            if (!grafo) return setHighlightNodes(new Set());
            const cn = new Set();
            const cl = new Set();
            if (node) {
                cn.add(node.id);
                grafo.links.forEach((l) => {
                    const s = l.source.id || l.source;
                    const t = l.target.id || l.target;
                    if (s === node.id || t === node.id) {
                        cn.add(s);
                        cn.add(t);
                        cl.add(l);
                    }
                });
            }
            setHighlightNodes(cn);
            setHighlightLinks(cl);
        },
        [grafo, selectedNode]
    );

    const handleNodeClick = useCallback(
        (node) => {
            if (!grafo) return;
            if (selectedNode === node) {
                setSelectedNode(null);
                setHighlightNodes(new Set());
                setHighlightLinks(new Set());
            } else {
                setSelectedNode(node);
                const cn = new Set([node.id]);
                const cl = new Set();
                grafo.links.forEach((l) => {
                    const s = l.source.id || l.source;
                    const t = l.target.id || l.target;
                    if (s === node.id || t === node.id) {
                        cn.add(s);
                        cn.add(t);
                        cl.add(l);
                    }
                });
                setHighlightNodes(cn);
                setHighlightLinks(cl);
                onSelectNode?.(node);
            }
        },
        [grafo, selectedNode, onSelectNode]
    );

    const handleResetView = () => {
        graphRef.current?.zoomToFit(400);
    };

    const handleHighlightModule = (modId) => {
        if (!grafo) return;
        const nodesInMod = grafo.nodes
            .filter((n) => n.moduleId === modId)
            .map((n) => n.id);
        const cn = new Set(nodesInMod);
        const cl = new Set(
            grafo.links.filter((l) => {
                const s = l.source.id || l.source;
                const t = l.target.id || l.target;
                return cn.has(s) && cn.has(t);
            })
        );
        setHighlightNodes(cn);
        setHighlightLinks(cl);
    };

    // -------------------
    // Render
    // -------------------
    if (!grafo) {
        return (
            <div className="h-[600px] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-lg font-medium">
                Cargando grafo...
            </div>
        );
    }

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">
                    🔍 Grafo de dependencias
                </h3>
                <button
                    onClick={handleResetView}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                    Ajustar vista
                </button>
            </div>

            <div className="flex gap-4">
                <aside className="w-64 border rounded-xl shadow p-4 bg-white">
                    <h4 className="font-medium text-gray-700 mb-3">
                        Módulos detectados
                    </h4>
                    {modulosCandidatos.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No se han detectado módulos.
                        </p>
                    ) : (
                        modulosCandidatos.map((m) => {
                            const cnt = m.relatedNodes.length + 1;
                            const isGood = grafo.nodes.find(
                                (n) => n.id === m.controllerNode
                            )?.isCandidateForExtraction;
                            return (
                                <div
                                    key={m.id}
                                    onClick={() => handleHighlightModule(m.id)}
                                    className={`p-3 mb-2 rounded border cursor-pointer hover:bg-gray-50 transition ${
                                        isGood
                                            ? "border-green-300 bg-green-50"
                                            : "border-gray-200"
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{m.id}</span>
                                        {isGood && <span className="text-green-600">✓</span>}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {cnt} componentes
                                    </div>
                                </div>
                            );
                        })
                    )}
                </aside>

                <div className="flex-1 relative h-[600px] border rounded-xl shadow bg-white">
                    <div className="absolute top-4 right-4 z-10 bg-white p-3 rounded shadow-md text-xs">
                        <div className="font-medium mb-2">Leyenda</div>
                        <LegendItem color="bg-blue-500" label="Controladores" />
                        <LegendItem color="bg-purple-500" label="Servicios" />
                        <LegendItem color="bg-yellow-500" label="Modelos" />
                        <LegendItem color="bg-orange-500" label="Interfaces" />
                        <LegendItem color="bg-green-500" label="Candidatos MS" />
                    </div>

                    <ForceGraph2D
                        ref={graphRef}
                        graphData={grafo}
                        nodeRelSize={8}
                        nodeVal={(n) => 1 + Math.sqrt(n.inDegree + n.outDegree)}
                        nodeLabel={getNodeLabel}
                        nodeColor={getNodeColor}
                        linkColor={() => "rgba(127,140,141,0.8)"}
                        linkWidth={() => 1.5}
                        linkDirectionalArrowLength={6}
                        linkDirectionalArrowRelPos={1}
                        linkDirectionalParticles={(l) =>
                            highlightLinks.has(l) ? 2 : 0
                        }
                        onNodeHover={handleNodeHover}
                        onNodeClick={handleNodeClick}
                        cooldownTicks={100}
                        onEngineStop={() => graphRef.current.zoomToFit(400)}
                        nodeCanvasObject={(node, ctx, scale) => {
                            const r = node.__r;
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                            ctx.fillStyle = getNodeColor(node);
                            ctx.fill();
                            if (node.isCandidateForExtraction) {
                                ctx.strokeStyle = "rgba(39,174,96,0.8)";
                                ctx.lineWidth = 2;
                                ctx.stroke();
                            }
                            if ((scale >= 1.2 || highlightNodes.has(node.id)) && node.label) {
                                ctx.font = `${12 / scale}px Sans-Serif`;
                                ctx.textAlign = "center";
                                ctx.textBaseline = "middle";
                                ctx.fillStyle = "#000";
                                let lbl = node.label;
                                if (node.id.includes("Controller"))
                                    lbl = node.label.replace("Controller", "");
                                if (node.id.includes("Service"))
                                    lbl = node.label.replace("Service", "");
                                ctx.fillText(lbl, node.x, node.y + r + 7);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

const LegendItem = ({ color, label }) => (
    <div className="flex items-center mb-1">
        <div className={`w-3 h-3 rounded-full ${color} mr-2`} />
        <span>{label}</span>
    </div>
);

export default GraphContainer;

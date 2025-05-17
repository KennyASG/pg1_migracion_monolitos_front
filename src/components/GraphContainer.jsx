import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { forceManyBody, forceX, forceY, forceCollide } from "d3-force";

const GraphContainer = ({ proyecto, onSelectNode }) => {
    const [grafo, setGrafo] = useState(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [selectedNode, setSelectedNode] = useState(null);
    const [modulosCandidatos, setModulosCandidatos] = useState([]);
    const graphRef = useRef();

    // 1) Fetch + build
    useEffect(() => {
        if (!proyecto) return;

        const obtenerGrafo = async () => {
            try {
                const resp = await fetch(
                    `https://localhost:7251/api/Dependencias/grafo?proyecto=${proyecto}`
                );
                const data = await resp.json();

                // Mapea nodos
                const nodesMap = new Map();
                data.nodes.forEach((n) => {
                    if (!n.id) return;
                    nodesMap.set(n.id, {
                        id: n.id,
                        label: n.label || n.id,
                        tipo: n.tipo || "Otro",
                        inDegree: 0,
                        outDegree: 0
                    });
                });


                // Deduplica y filtra edges
                const rawLinks = data.links || [];
                const unique = Array.from(
                    new Set(rawLinks.map((e) => `${e.source}|${e.target}`))
                ).map((key) => {
                    const [source, target] = key.split("|");
                    return { source, target };
                });
                const validEdges = unique.filter(
                    (e) => nodesMap.has(e.source) && nodesMap.has(e.target)
                );

                // Calcula grados
                validEdges.forEach((e) => {
                    nodesMap.get(e.source).outDegree++;
                    nodesMap.get(e.target).inDegree++;
                });

                // Detecta módulos
                const modules = identifyModules(
                    Array.from(nodesMap.values()),
                    validEdges
                );
                setModulosCandidatos(modules);

                // Enriquecer nodos
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

                // Set grafo
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

    // 2) Calcula centros para cada módulo
    const moduleCenters = useMemo(() => {
        const centers = {};
        modulosCandidatos.forEach((m, i) => {
            const angle = (2 * Math.PI * i) / modulosCandidatos.length;
            centers[m.id] = {
                x: Math.cos(angle) * 200,
                y: Math.sin(angle) * 200,
            };
        });
        return centers;
    }, [modulosCandidatos]);

    // 3) Ajusta fuerzas de la simulación
    useEffect(() => {
        if (!grafo || !graphRef.current) return;
        const fg = graphRef.current;
        fg.d3Force("charge", forceManyBody().strength(-50));
        fg.d3Force("collide", forceCollide().radius(24));
        fg.d3Force(
            "x",
            forceX((node) => moduleCenters[node.moduleId]?.x || 0).strength(0.1)
        );
        fg.d3Force(
            "y",
            forceY((node) => {
                switch (node.tipo) {
                    case "Controller": return -300;
                    case "Service": return 0;
                    case "Model": return 300;
                    default: return 100;
                }
            }).strength(0.2)

        );
    }, [grafo, moduleCenters]);

    // ————— Auxiliares idénticos a los anteriores —————
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
            const mod = modules.find((m) => m.controllerNode === node.id);
            return mod?.isCohesive && node.inDegree < 3;
        }
        if (node.isService) {
            const users = edges
                .filter((e) => e.target === node.id)
                .map((e) => e.source);
            const moduleIds = new Set(
                users.map((u) => getModuleForNode(u, modules)).filter(Boolean)
            );
            return moduleIds.size === 1 && node.outDegree < 10;
        }
        return false;
    };
    const getNodeColor = (node) => {
        if (highlightNodes.size && !highlightNodes.has(node.id)) {
            return "rgba(180,180,180,0.2)";
        }
        if (node.isCandidateForExtraction) return "rgba(46,204,113,0.8)";
        switch (node.tipo) {
            case "Controller": return "rgba(52,152,219,0.8)";
            case "Service": return "rgba(155,89,182,0.8)";
            case "Model": return "rgba(241,196,15,0.8)";
            case "Interface": return "rgba(230,126,34,0.8)";
            default: return "rgba(149,165,166,0.8)";
        }
    };

    const getNodeLabel = (node) => {
        const metrics = `In:${node.inDegree} Out:${node.outDegree} Inst:${node.instability.toFixed(
            2
        )}`;
        const typeMap = {
            Controller: "(C)",
            Service: "(S)",
            Model: "(M)",
            Interface: "(I)"
        };
        const type = typeMap[node.tipo] || "";

        const mod = node.moduleId ? ` (${node.moduleId})` : "";
        return `${node.label}${type}\n${metrics}${mod}`;
    };

    // ————— Interacción —————
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
        graphRef.current?.zoomToFit(500, 50);
    };
    const handleHighlightModule = (modId) => {
        if (!grafo) return;
        const cn = new Set(
            grafo.nodes.filter((n) => n.moduleId === modId).map((n) => n.id)
        );
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

    // ————— Render —————
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
                    <ForceGraph2D
                        ref={graphRef}
                        graphData={grafo}
                        d3AlphaDecay={0.02}
                        d3VelocityDecay={0.5}
                        linkDistance={120}
                        linkStrength={0.7}
                        nodeRelSize={6}
                        nodeVal={(n) => 1 + Math.sqrt(n.inDegree + n.outDegree)}
                        nodeLabel={getNodeLabel}
                        nodeColor={getNodeColor}
                        linkColor={(link) => {
                            const s = typeof link.source === 'object' ? link.source.id : link.source;
                            const t = typeof link.target === 'object' ? link.target.id : link.target;

                            if (s.includes("Controller") && t.includes("Service")) return "rgba(52, 152, 219, 0.8)";
                            if (s.includes("Service") && t.includes("Model")) return "rgba(155, 89, 182, 0.8)";
                            return "rgba(127,140,141,0.6)";
                        }}
                        linkWidth={1.5}
                        linkDirectionalArrowLength={6}
                        linkDirectionalArrowRelPos={1}
                        onNodeHover={handleNodeHover}
                        onNodeClick={handleNodeClick}
                        cooldownTicks={100}
                        onEngineStop={() => graphRef.current.zoomToFit(500, 50)}
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
                            ctx.font = `${14 / scale}px Sans-Serif`;
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            ctx.fillStyle = "#000";
                            ctx.fillText(getNodeLabel(node), node.x, node.y - r - 7);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default GraphContainer;

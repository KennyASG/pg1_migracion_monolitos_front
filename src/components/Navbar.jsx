const Navbar = ({ projectName }) => {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-800 flex items-center justify-center text-white font-bold text-sm">
                    M
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-800">Migration Tool</h1>
                    {projectName && (
                        <p className="text-xs text-slate-500">
                            Proyecto: <span className="font-medium text-slate-700">{projectName}</span>
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600">
                    <span className="font-medium">Estado:</span>{" "}
                    {projectName ? (
                        <span className="text-green-600 font-medium">● Proyecto cargado</span>
                    ) : (
                        <span className="text-slate-400">○ Sin proyecto</span>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe usarse dentro de ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 5000, onComplete) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration, onComplete }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onRemove={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

const Toast = ({ toast, onRemove }) => {
    const [progress, setProgress] = useState(100);
    const [isExiting, setIsExiting] = useState(false);

    const typeConfig = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-800',
            iconColor: 'text-green-500',
            progressColor: 'bg-green-500'
        },
        error: {
            icon: AlertCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
            iconColor: 'text-red-500',
            progressColor: 'bg-red-500'
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-800',
            iconColor: 'text-amber-500',
            progressColor: 'bg-amber-500'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            iconColor: 'text-blue-500',
            progressColor: 'bg-blue-500'
        }
    };

    const config = typeConfig[toast.type] || typeConfig.info;
    const Icon = config.icon;

    useState(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - (100 / (toast.duration / 50));
                if (newProgress <= 0) {
                    clearInterval(interval);
                    handleClose();
                    return 0;
                }
                return newProgress;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [toast.duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onRemove();
            if (toast.onComplete) {
                toast.onComplete();
            }
        }, 300);
    };

    return (
        <div
            className={`pointer-events-auto min-w-[320px] max-w-md border ${config.borderColor} ${config.bgColor} 
                shadow-lg overflow-hidden transition-all duration-300 transform ${
                isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
            }`}
        >
            <div className="p-4 flex items-start gap-3">
                <Icon size={20} className={`flex-shrink-0 ${config.iconColor}`} />
                <p className={`flex-1 text-sm ${config.textColor} leading-relaxed`}>
                    {toast.message}
                </p>
                <button
                    onClick={handleClose}
                    className={`flex-shrink-0 ${config.textColor} hover:opacity-70 transition-opacity`}
                >
                    <X size={16} />
                </button>
            </div>
            <div className="h-1 bg-gray-200">
                <div
                    className={`h-full ${config.progressColor} transition-all duration-50 ease-linear`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default ToastProvider;
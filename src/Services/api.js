// src/services/api.js

const API_BASE_URL = 'http://localhost:5248/api';

export const transformacionFuncionalApi = {
    // Generar microservicio con migración funcional
    generarMicroservicio: async (proyecto, modulo) => {
        const response = await fetch(
            `${API_BASE_URL}/TransformacionFuncional/${proyecto}/${modulo}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al generar microservicio');
        }

        return await response.json();
    },

    // Analizar módulo sin generar (opcional, para vista previa)
    analizarModulo: async (proyecto, modulo) => {
        const response = await fetch(
            `${API_BASE_URL}/TransformacionFuncional/analizar/${proyecto}/${modulo}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al analizar módulo');
        }

        return await response.json();
    }
};
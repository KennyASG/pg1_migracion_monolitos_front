
const API_BASE_URL = 'http://localhost:5248/api';
const CONTAINERIZATION_URL = 'http://localhost:5236/api';

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

export const containerizationApi = {
    // Construir imagen Docker del microservicio
    buildMicroservicio: async (proyecto, modulo, rutaMicroservicio) => {
        const response = await fetch(
            `${CONTAINERIZATION_URL}/containerization/build`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    proyecto,
                    modulo,
                    rutaMicroservicio
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al construir imagen');
        }

        return await response.json();
    },

    // Desplegar contenedor Docker
    deployMicroservicio: async (nombreModulo, rebuildImage = false, forceRecreate = false) => {
        const response = await fetch(
            `${CONTAINERIZATION_URL}/containerization/deploy/${nombreModulo}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombreModulo,
                    rebuildImage,
                    forceRecreate
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al desplegar contenedor');
        }

        return await response.json();
    },

    // Obtener estado del contenedor
    getStatus: async (nombreModulo) => {
        const response = await fetch(
            `${CONTAINERIZATION_URL}/containerization/${nombreModulo}/status`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al obtener estado');
        }

        return await response.json();
    }
};
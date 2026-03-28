import React from "react";

// Aquí definimos los tipos de nuestras props
interface loaderPageProps {
    text?: string; // El signo de interrogación indica que es opcional
}

const loaderPage: React.FC<loaderPageProps> = ({
    text = "Cargando...", // Valor por defecto en caso de no enviar el prop
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center">
                {/* Spinner */}
                <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>

                {/* Texto */}
                <p className="mt-4 text-lg font-medium text-white">{text}</p>
            </div>
        </div>
    );
};

export default loaderPage;

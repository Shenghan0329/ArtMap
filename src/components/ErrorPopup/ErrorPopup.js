import { useContext } from "react";
import { ErrorContext } from "@/app/page";
import ErrorMessages from "@/constants/error_messages";

const ErrorPopup = () => {
    const { error, setError } = useContext(ErrorContext);
    
    return (
        <>
            {(error !== null) && (
                <div className="fixed top-10 left-1/2 transform -translate-x-1/2 w-1/2 min-w-96 z-50">
                    {/* Error message */}
                    <div className="bg-red-500 text-white rounded-lg flex items-center justify-between p-3 mb-2">
                        {/* Icon and message */}
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                <span className="text-red-500 font-bold text-sm">!</span>
                            </div>
                            <span className="font-medium">
                                {ErrorMessages[error] || "Error: " + error.slice(0, 60)}
                            </span>
                        </div>
                        
                        {/* Close button for individual message */}
                        <button 
                            onClick={() => setError(null)}
                            className="text-white hover:text-red-200 transition-colors ml-4 text-lg font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ErrorPopup;
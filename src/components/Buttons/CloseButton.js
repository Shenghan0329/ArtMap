"use client"

const CloseButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-5 h-5 bg-white hover:text-blue-600 flex items-center justify-center text-gray-700 font-semibold text-lg transition-colors"
        >
            x
        </button>
    )
}

export default CloseButton;
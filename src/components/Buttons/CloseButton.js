"use client"

const CloseButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed top-4 right-4 z-50 px-2 py-1 bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white font-bold text-xs rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 border border-white/20"
        >
            x
        </button>
    )
}

export default CloseButton;
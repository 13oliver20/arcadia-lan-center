const GlowText = ({ text }) => {
    return (
        <div className="relative group cursor-default flex justify-center items-center transform scale-125">
            {/* Bloom/Glow Layer (Behind) */}
            <h1
                className="absolute text-4xl md:text-6xl font-black animate-rgb-flow-css blur-2xl opacity-75 select-none pb-4 tracking-tighter"
                aria-hidden="true"
            >
                {text}
            </h1>

            {/* Main Text Layer (Front) */}
            <h1
                className="relative z-10 text-4xl md:text-6xl font-black animate-rgb-flow-css select-none pb-4 tracking-tighter drop-shadow-sm"
            >
                {text}
            </h1>
        </div>
    );
};

export default GlowText;

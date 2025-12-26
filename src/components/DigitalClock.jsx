import { useState, useEffect } from 'react';

export default function DigitalClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };



    return (
        <div className="flex flex-col items-end text-white font-mono select-none">
            <div className="text-4xl font-bold tracking-widest drop-shadow-[0_0_15px_rgba(0,243,255,0.9)]">
                {formatTime(time)}
            </div>

        </div>
    );
}

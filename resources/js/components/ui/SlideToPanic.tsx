import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { AlertOctagon, ChevronRight, Check } from 'lucide-react';

interface SlideToPanicProps {
    onActivate: () => void;
    isSubmitting?: boolean;
}

export default function SlideToPanic({ onActivate, isSubmitting = false }: SlideToPanicProps) {
    const [isTriggered, setIsTriggered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const dragX = useMotionValue(0);
    const controls = useAnimation();

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, []);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = containerWidth - 64; // Thumb width + padding
        if (info.offset.x >= threshold * 0.9) {
            setIsTriggered(true);
            controls.start({ x: threshold });
            onActivate();
        } else {
            controls.start({ x: 0 });
        }
    };

    const bgOpacity = useTransform(dragX, [0, containerWidth - 64], [0.2, 1]);
    const textOpacity = useTransform(dragX, [0, (containerWidth - 64) / 2], [1, 0]);

    return (
        <div ref={containerRef} className="relative h-16 w-full rounded-full bg-[#3E1A1A] overflow-hidden border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-900/20">
            <motion.div 
                className="absolute inset-0 bg-red-600"
                style={{ opacity: bgOpacity }}
            />
            
            <motion.div 
                className="absolute w-full text-center flex items-center justify-center gap-2 pointer-events-none"
                style={{ opacity: textOpacity }}
            >
                <span className="text-red-200 font-bold tracking-widest uppercase text-sm">Slide to Panic</span>
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <ChevronRight className="w-5 h-5 text-red-400" />
                </motion.div>
            </motion.div>

            {isTriggered ? (
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold tracking-widest gap-2 bg-red-600 z-10">
                    {isSubmitting ? <span className="animate-pulse">Activating...</span> : <><Check className="w-6 h-6" /> ACTIVATED</>}
                </div>
            ) : (
                <motion.div
                    drag="x"
                    dragConstraints={containerRef}
                    dragElastic={0}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    style={{ x: dragX }}
                    animate={controls}
                    className="absolute left-1 top-1 bottom-1 w-14 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md border border-red-400 z-20"
                >
                    <AlertOctagon className="w-7 h-7 text-white" />
                </motion.div>
            )}
        </div>
    );
}

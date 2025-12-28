"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export default function MagneticButton({ children, className, ...props }: Props) {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const xTo = gsap.quickTo(button, "x", { duration: 0.3, ease: "power2.out" });
        const yTo = gsap.quickTo(button, "y", { duration: 0.3, ease: "power2.out" });

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = button.getBoundingClientRect();
            const x = (clientX - (left + width / 2)) * 0.2; // 20% offset
            const y = (clientY - (top + height / 2)) * 0.2;

            xTo(x);
            yTo(y);
        };

        const handleMouseLeave = () => {
            xTo(0);
            yTo(0);
        };

        button.addEventListener("mousemove", handleMouseMove);
        button.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            button.removeEventListener("mousemove", handleMouseMove);
            button.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <button
            ref={buttonRef}
            className={`magnetic-button ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

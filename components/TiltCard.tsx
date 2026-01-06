import React, { useRef, useState } from 'react';

export const TiltCard: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)', shine: { left: 0, top: 0, opacity: 0 } });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    setStyle({
      transform: `perspective(1000px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale3d(1.02, 1.02, 1.02)`,
      shine: {
        left: e.clientX - left,
        top: e.clientY - top,
        opacity: 0.4
      }
    });
  };

  const handleMouseLeave = () => {
    setStyle({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)', shine: { ...style.shine, opacity: 0 } });
  };

  return (
    <div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative transition-transform duration-200 ease-out transform-style-3d overflow-hidden ${className || ''}`}
      style={{ transform: style.transform }}
    >
      {/* Dynamic Shine Effect */}
      <div 
        className="absolute pointer-events-none rounded-full blur-[60px] mix-blend-soft-light transition-opacity duration-500"
        style={{ 
          width: '150px', 
          height: '150px', 
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
          left: style.shine.left - 75,
          top: style.shine.top - 75,
          opacity: style.shine.opacity
        }}
      ></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
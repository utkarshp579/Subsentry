'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(59, 130, 246, 0.15)',
}: SpotlightCardProps) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-gray-800 bg-[#0f0f0f] p-6',
        className
      )}
    >
      {/* Spotlight effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      {/* Border glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.1), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

interface GlowingBorderProps {
  children: React.ReactNode;
  className?: string;
  borderRadius?: string;
}

export function GlowingBorder({
  children,
  className,
  borderRadius = '12px',
}: GlowingBorderProps) {
  return (
    <div className={cn('relative group', className)}>
      {/* Animated gradient border */}
      <div
        className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-75"
        style={{ borderRadius }}
      />
      <div
        className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ borderRadius }}
      />
      <div
        className="relative bg-[#0f0f0f] rounded-xl"
        style={{ borderRadius }}
      >
        {children}
      </div>
    </div>
  );
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  prefix = '',
  suffix = '',
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  shimmerColor?: string;
  className?: string;
}

export function ShimmerButton({
  children,
  shimmerColor = 'rgba(255, 255, 255, 0.2)',
  className,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        'relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {/* Shimmer effect */}
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FloatingElement({
  children,
  className,
  delay = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-5, 5, -5] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function StaggeredList({
  children,
  className,
  staggerDelay = 0.1,
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.4,
            delay: index * staggerDelay,
            ease: 'easeOut',
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

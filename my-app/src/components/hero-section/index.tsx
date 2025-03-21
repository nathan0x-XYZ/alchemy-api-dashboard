'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
}

export default function HeroSection({ title, subtitle }: HeroSectionProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleControls = useAnimation();
  
  // 文字動畫效果
  const letters = Array.from(title);
  
  // 處理滑鼠移動
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };
  
  // 滾動到內容區域
  const scrollToContent = () => {
    const contentElement = document.getElementById('main-content');
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // 標題懸停效果
  useEffect(() => {
    if (isTitleHovered) {
      titleControls.start({
        scale: 1.05,
        transition: { duration: 0.3 }
      });
    } else {
      titleControls.start({
        scale: 1,
        transition: { duration: 0.3 }
      });
    }
  }, [isTitleHovered, titleControls]);

  return (
    <div 
      ref={heroRef}
      className="relative w-full h-screen overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
    >
      {/* 背景圖片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: `url('/images/hero-bg.jpg')`,
          filter: 'brightness(0.7)'
        }}
      />
      
      {/* 動態光效 */}
      <div 
        className="absolute inset-0 z-10 opacity-70"
        style={{
          background: `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, rgba(120, 58, 180, 0.4), transparent)`,
          mixBlendMode: 'screen'
        }}
      />
      
      {/* 背景網格 */}
      <div className="absolute inset-0 z-5 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* 標題區域 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <motion.div
          className="text-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={scrollToContent}
        >
          <motion.div 
            className="relative inline-block"
            onMouseEnter={() => setIsTitleHovered(true)}
            onMouseLeave={() => setIsTitleHovered(false)}
            animate={titleControls}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-4 cursor-pointer relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {letters.map((letter, index) => (
                <motion.span
                  key={index}
                  className="inline-block"
                  whileHover={{
                    y: -5,
                    color: '#9c44dc',
                    textShadow: "0 0 8px rgba(156, 68, 220, 0.7)",
                    transition: { duration: 0.1 }
                  }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </motion.h1>
            
            {/* 標題下的裝飾線 */}
            <motion.div
              className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-2 mb-6"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isTitleHovered ? '100%' : '50%', opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* 標題懸停時的粒子效果 */}
            {isTitleHovered && (
              <motion.div className="absolute inset-0 -z-10 pointer-events-none">
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      background: `rgba(${156 + Math.random() * 100}, ${68 + Math.random() * 50}, ${220 + Math.random() * 35}, ${0.7 + Math.random() * 0.3})`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20 - Math.random() * 30],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1 + Math.random(),
                      repeat: Infinity,
                      repeatType: 'loop',
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
          
          {subtitle && (
            <motion.p
              className="text-xl md:text-2xl text-zinc-300 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {subtitle}
            </motion.p>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8"
          >
            <motion.div
              className="flex items-center justify-center"
              animate={{ y: [0, 10, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: "loop" 
              }}
            >
              <ArrowDown className="w-8 h-8 text-white opacity-80" />
            </motion.div>
            <motion.p 
              className="text-zinc-400 text-sm mt-2"
              whileHover={{ color: '#9c44dc' }}
            >
              Scroll to Explore
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
      
      {/* 互動特效 - 粒子效果 */}
      {isHovered && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white"
              initial={{ 
                x: mousePosition.x,
                y: mousePosition.y,
                opacity: 0.8
              }}
              animate={{ 
                x: mousePosition.x + (Math.random() - 0.5) * 200,
                y: mousePosition.y + (Math.random() - 0.5) * 200,
                opacity: 0
              }}
              transition={{ duration: 1 + Math.random() }}
            />
          ))}
        </div>
      )}
      
      {/* 裝飾元素 */}
      <div className="absolute bottom-10 right-10 z-20 opacity-70">
        <Sparkles className="w-6 h-6 text-purple-400" />
      </div>
      <div className="absolute top-10 left-10 z-20 opacity-70">
        <Sparkles className="w-6 h-6 text-blue-400" />
      </div>
    </div>
  );
}

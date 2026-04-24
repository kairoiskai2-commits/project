import React, { useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';

export default function SandParticles() {
  const canvasRef = useRef(null);
  const { theme } = useLanguage();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class SandParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.3 + 0.1;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = theme === 'dark' 
          ? `rgba(194, 154, 108, ${this.opacity})`
          : `rgba(194, 154, 108, ${this.opacity * 0.7})`;
      }

      update() {
        this.x += this.speedX + Math.sin(this.y * 0.01) * 0.5;
        this.y += this.speedY;

        if (this.y > canvas.height || this.x < 0 || this.x > canvas.width) {
          this.reset();
          this.y = -10;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(100, Math.floor(canvas.width * canvas.height / 15000));
      for (let i = 0; i < particleCount; i++) {
        particles.push(new SandParticle());
      }
    };

    initParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
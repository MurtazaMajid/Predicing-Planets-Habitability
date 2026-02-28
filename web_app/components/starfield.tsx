'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  maxOpacity: number;
  minOpacity: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number;
}

interface Planet {
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  type?: string;
}

interface UFO {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  life: number;
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;

    // Create stars
    const stars: Star[] = [];
    const starCount = 250;

    for (let i = 0; i < starCount; i++) {
      const minOpacity = Math.random() * 0.3;
      const maxOpacity = Math.random() * 0.7 + 0.3;
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.2,
        opacity: Math.random() * (maxOpacity - minOpacity) + minOpacity,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        maxOpacity: maxOpacity,
        minOpacity: minOpacity,
      });
    }

    // Create realistic solar system planets
    const planets: Planet[] = [
      {
        x: canvas.width * 0.12,
        y: canvas.height * 0.55,
        radius: 45,
        color: '#c1440e',
        glowColor: '#c1440e',
        type: 'earth', // Blue and green like Earth
      },
      {
        x: canvas.width * 0.88,
        y: canvas.height * 0.3,
        radius: 35,
        color: '#2e4ba4',
        glowColor: '#2e4ba4',
        type: 'saturn', // Blue like Neptune with rings
      },
      {
        x: canvas.width * 0.75,
        y: canvas.height * 0.75,
        radius: 28,
        color: '#d4a574',
        glowColor: '#d4a574',
        type: 'jupiter', // Tan/beige like Jupiter with bands
      },
      {
        x: canvas.width * 0.25,
        y: canvas.height * 0.85,
        radius: 24,
        color: '#a85a28',
        glowColor: '#a85a28',
        type: 'mars', // Rust red like Mars
      },
    ];

    const shootingStars: ShootingStar[] = [];
    const ufos: UFO[] = [];

    let shootingStarCounter = 0;
    let ufoCounter = 0;

    const drawShootingStar = (star: ShootingStar) => {
      const gradient = ctx.createLinearGradient(
        star.x,
        star.y,
        star.x - star.vx * star.length,
        star.y - star.vy * star.length
      );
      gradient.addColorStop(0, `rgba(168, 139, 250, ${star.opacity})`);
      gradient.addColorStop(0.5, `rgba(6, 182, 212, ${star.opacity * 0.5})`);
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(
        star.x - star.vx * star.length,
        star.y - star.vy * star.length
      );
      ctx.stroke();
    };

    const drawUFO = (ufo: UFO) => {
      ctx.save();
      ctx.globalAlpha = ufo.opacity;

      // UFO outer glow
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.beginPath();
      ctx.ellipse(ufo.x, ufo.y, 35, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // UFO main hull with gradient
      const hullGradient = ctx.createLinearGradient(ufo.x - 25, ufo.y, ufo.x + 25, ufo.y);
      hullGradient.addColorStop(0, '#06b6d4');
      hullGradient.addColorStop(0.5, '#0891b2');
      hullGradient.addColorStop(1, '#06b6d4');
      ctx.fillStyle = hullGradient;
      ctx.beginPath();
      ctx.ellipse(ufo.x, ufo.y, 25, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // UFO hull outline
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ufo.x, ufo.y, 25, 12, 0, 0, Math.PI * 2);
      ctx.stroke();

      // UFO top dome with gradient
      const domeGradient = ctx.createRadialGradient(ufo.x - 5, ufo.y - 12, 0, ufo.x, ufo.y - 8, 15);
      domeGradient.addColorStop(0, 'rgba(167, 139, 250, 0.9)');
      domeGradient.addColorStop(0.7, 'rgba(167, 139, 250, 0.5)');
      domeGradient.addColorStop(1, 'rgba(167, 139, 250, 0.2)');
      ctx.fillStyle = domeGradient;
      ctx.beginPath();
      ctx.ellipse(ufo.x, ufo.y - 8, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dome shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(ufo.x - 5, ufo.y - 10, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bottom light windows
      for (let i = -1; i <= 1; i++) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(ufo.x + i * 12, ufo.y + 10, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Light glow
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(ufo.x + i * 12, ufo.y + 10, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main light beam below UFO
      const beamGradient = ctx.createLinearGradient(ufo.x, ufo.y + 12, ufo.x, ufo.y + 30);
      beamGradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
      beamGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = beamGradient;
      ctx.beginPath();
      ctx.moveTo(ufo.x - 8, ufo.y + 12);
      ctx.lineTo(ufo.x + 8, ufo.y + 12);
      ctx.lineTo(ufo.x + 15, ufo.y + 30);
      ctx.lineTo(ufo.x - 15, ufo.y + 30);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const drawPlanet = (planet: Planet) => {
      // Draw rings first (if applicable)
      if (planet.type === 'saturn' || planet.type === 'jupiter') {
        drawPlanetRings(planet);
      }

      // Main planet body with radial gradient for depth
      const planetGradient = ctx.createRadialGradient(
        planet.x - planet.radius * 0.3,
        planet.y - planet.radius * 0.3,
        planet.radius * 0.1,
        planet.x,
        planet.y,
        planet.radius
      );
      planetGradient.addColorStop(0, planet.color);
      planetGradient.addColorStop(0.6, planet.color);
      planetGradient.addColorStop(1, adjustBrightness(planet.color, -40));
      
      ctx.fillStyle = planetGradient;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
      ctx.fill();

      // Add surface texture details based on planet type
      if (planet.type === 'earth') {
        // Earth: Blue oceans with continents
        ctx.fillStyle = '#2d5a3d'; // Dark green continents
        const continents = [
          { x: 0.3, y: 0.4, size: 0.2 },
          { x: 0.65, y: 0.3, size: 0.25 },
          { x: 0.4, y: 0.7, size: 0.15 },
        ];
        continents.forEach((cont) => {
          ctx.beginPath();
          ctx.arc(
            planet.x + (cont.x - 0.5) * planet.radius * 1.8,
            planet.y + (cont.y - 0.5) * planet.radius * 1.8,
            planet.radius * cont.size,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });
        // White clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          const x = planet.x + Math.cos(angle) * planet.radius * 0.5;
          const y = planet.y + Math.sin(angle) * planet.radius * 0.5;
          ctx.beginPath();
          ctx.arc(x, y, planet.radius * 0.12, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (planet.type === 'mars') {
        // Mars: Rust-red surface with crater details
        ctx.fillStyle = 'rgba(80, 40, 20, 0.4)'; // Dark rust spots
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const x = planet.x + Math.cos(angle) * planet.radius * 0.6;
          const y = planet.y + Math.sin(angle) * planet.radius * 0.6;
          ctx.beginPath();
          ctx.arc(x, y, planet.radius * 0.12, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (planet.type === 'jupiter') {
        // Jupiter: Tan/brown with distinctive band patterns
        for (let i = 0; i < 5; i++) {
          const yPos = planet.y - planet.radius * 0.6 + (i * planet.radius * 0.3);
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(100, 70, 40, 0.4)' : 'rgba(120, 85, 50, 0.3)';
          ctx.lineWidth = planet.radius * 0.15;
          ctx.beginPath();
          ctx.ellipse(planet.x, yPos, planet.radius * 0.95, planet.radius * 0.08, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Great Red Spot
        ctx.fillStyle = 'rgba(180, 90, 50, 0.5)';
        ctx.beginPath();
        ctx.ellipse(planet.x + planet.radius * 0.25, planet.y + planet.radius * 0.1, planet.radius * 0.22, planet.radius * 0.3, 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (planet.type === 'saturn') {
        // Saturn: Blue color with subtle bands
        for (let i = 0; i < 3; i++) {
          const yPos = planet.y - planet.radius * 0.4 + (i * planet.radius * 0.4);
          ctx.strokeStyle = `rgba(46, 74, 164, ${0.25 - i * 0.08})`;
          ctx.lineWidth = planet.radius * 0.12;
          ctx.beginPath();
          ctx.ellipse(planet.x, yPos, planet.radius * 0.9, planet.radius * 0.1, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Subtle shine/reflection on surface
      const shineGradient = ctx.createRadialGradient(
        planet.x - planet.radius * 0.4,
        planet.y - planet.radius * 0.4,
        0,
        planet.x - planet.radius * 0.3,
        planet.y - planet.radius * 0.3,
        planet.radius * 0.4
      );
      shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      shineGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
      shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = shineGradient;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    };

    const adjustBrightness = (color: string, amount: number): string => {
      const hex = color.replace('#', '');
      const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
      const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
      const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const drawPlanetRings = (planet: Planet) => {
      if (planet.type === 'saturn') {
        // Saturn's prominent rings
        ctx.strokeStyle = 'rgba(200, 180, 120, 0.6)';
        ctx.lineWidth = planet.radius * 0.35;
        ctx.beginPath();
        ctx.ellipse(planet.x, planet.y, planet.radius * 1.5, planet.radius * 0.35, 0.3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner ring shadow
        ctx.strokeStyle = 'rgba(100, 80, 40, 0.3)';
        ctx.lineWidth = planet.radius * 0.15;
        ctx.beginPath();
        ctx.ellipse(planet.x, planet.y, planet.radius * 1.2, planet.radius * 0.25, 0.3, 0, Math.PI * 2);
        ctx.stroke();
      } else if (planet.type === 'jupiter') {
        // Jupiter's subtle rings (faint)
        ctx.strokeStyle = 'rgba(180, 160, 100, 0.3)';
        ctx.lineWidth = planet.radius * 0.2;
        ctx.beginPath();
        ctx.ellipse(planet.x, planet.y, planet.radius * 1.4, planet.radius * 0.25, 0.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars with twinkling
      stars.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.5 + 0.5;
        const currentOpacity = star.minOpacity + (star.maxOpacity - star.minOpacity) * twinkle;

        ctx.fillStyle = `rgba(232, 233, 243, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add subtle glow to stars
        if (star.radius > 0.8) {
          ctx.fillStyle = `rgba(167, 139, 250, ${currentOpacity * 0.2})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw static planets
      planets.forEach((planet) => {
        drawPlanet(planet);
      });

      // Update and draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.x += star.vx;
        star.y += star.vy;
        star.life--;
        star.opacity = (star.life / 100) * 0.8;

        drawShootingStar(star);

        if (star.life <= 0) {
          shootingStars.splice(i, 1);
        }
      }

      // Update and draw UFOs
      for (let i = ufos.length - 1; i >= 0; i--) {
        const ufo = ufos[i];
        ufo.x += ufo.vx;
        ufo.y += ufo.vy;
        ufo.life--;
        ufo.opacity = Math.max(0, ufo.life / 150);

        drawUFO(ufo);

        if (ufo.life <= 0) {
          ufos.splice(i, 1);
        }
      }

      // Spawn new shooting stars
      shootingStarCounter++;
      if (shootingStarCounter > 100) {
        shootingStarCounter = 0;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.5 + 1.5;
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.7,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          length: Math.random() * 50 + 30,
          opacity: 0.8,
          life: 100,
        });
      }

      // Spawn new UFOs
      ufoCounter++;
      if (ufoCounter > 300) {
        ufoCounter = 0;
        ufos.push({
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height * 0.5) + 50,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          opacity: 1,
          life: 180,
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-[#0a0e27]"
    />
  );
}

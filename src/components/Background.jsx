import { useRef, useEffect } from 'react';

const ORBS = [
  { size: 320, r: 1, g: 0.6, b: 0.8, a: 0.08, delay: 0, duration: 28 },
  { size: 260, r: 0.5, g: 0.4, b: 0.9, a: 0.1, delay: 2, duration: 32 },
  { size: 380, r: 0.2, g: 0.3, b: 0.5, a: 0.12, delay: 5, duration: 36 },
  { size: 220, r: 0.3, g: 0.7, b: 0.4, a: 0.07, delay: 1, duration: 22 },
  { size: 300, r: 0.7, g: 0.2, b: 0.3, a: 0.09, delay: 3, duration: 26 },
  { size: 240, r: 0.6, g: 0.5, b: 0.1, a: 0.08, delay: 4, duration: 30 },
];

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    const particles = [];
    const PARTICLE_COUNT = 60;
    const CONNECT_DIST = 140;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(160, 160, 184, 0.25)';
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(160, 160, 184, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="bg-layer">
      <div className="bg-gradient" />
      <div className="bg-orbs">
        {ORBS.map((orb, i) => (
          <div
            key={i}
            className="orb"
            style={{
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle at 30% 30%, rgba(${orb.r * 255},${orb.g * 255},${orb.b * 255},${orb.a + 0.04}), rgba(${orb.r * 255},${orb.g * 255},${orb.b * 255},${orb.a}) 60%, transparent)`,
              animationDelay: `${orb.delay}s`,
              animationDuration: `${orb.duration}s`,
            }}
          />
        ))}
      </div>
      <canvas ref={canvasRef} className="bg-particles" />
    </div>
  );
}

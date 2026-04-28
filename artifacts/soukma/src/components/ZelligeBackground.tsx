import { useEffect, useRef } from "react";

export function ZelligeBackground({ opacity = 0.12 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animFrame: number;
    let t = 0;

    const colors = ["#d4512a", "#ffd60a", "#00b4d8", "#3a0ca3", "#f4a261", "#e63946"];
    const SIZE = 100;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function drawStar(cx: number, cy: number, r: number, color: string, phase: number) {
      const pts = 8;
      ctx.beginPath();
      for (let i = 0; i < pts * 2; i++) {
        const angle = (i * Math.PI) / pts - Math.PI / 2 + phase;
        const radius = i % 2 === 0 ? r : r * 0.45;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    function draw() {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.003;

      const cols = Math.ceil(canvas.width / SIZE) + 2;
      const rows = Math.ceil(canvas.height / SIZE) + 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const cx = col * SIZE + SIZE / 2;
          const cy = row * SIZE + SIZE / 2;
          const wave = Math.sin(t + col * 0.3 + row * 0.4) * 0.5 + 0.5;
          const colorIdx = (col + row * 3) % colors.length;
          const nextColorIdx = (colorIdx + 1) % colors.length;

          // Background tile
          ctx.fillStyle = "#fff8f0";
          ctx.fillRect(col * SIZE, row * SIZE, SIZE, SIZE);

          // Outer star
          drawStar(cx, cy, SIZE * 0.46, colors[colorIdx], t * 0.2 + col * 0.1);
          // Mid star
          drawStar(cx, cy, SIZE * 0.36, colors[nextColorIdx], -t * 0.15 + row * 0.1);
          // Inner star
          drawStar(cx, cy, SIZE * 0.24, colors[(colorIdx + 2) % colors.length], t * 0.25);
          // Center dot
          ctx.beginPath();
          ctx.arc(cx, cy, SIZE * 0.08 + wave * 3, 0, Math.PI * 2);
          ctx.fillStyle = colors[(colorIdx + 3) % colors.length];
          ctx.fill();

          // Grid lines
          ctx.strokeStyle = "rgba(255,255,255,0.5)";
          ctx.lineWidth = 0.8;
          ctx.strokeRect(col * SIZE, row * SIZE, SIZE, SIZE);
        }
      }

      animFrame = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity }}
      aria-hidden="true"
    />
  );
}

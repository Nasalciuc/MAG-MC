export function fireConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; size: number; life: number }> = [];
  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'];

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.3,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 10 - 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 3,
      life: 1,
    });
  }

  const context = ctx;
  function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.vy += 0.15;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.008;
      if (p.life > 0) {
        alive = true;
        context.globalAlpha = p.life;
        context.fillStyle = p.color;
        context.fillRect(p.x, p.y, p.size, p.size * 0.6);
      }
    });
    if (alive) requestAnimationFrame(animate);
    else context.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

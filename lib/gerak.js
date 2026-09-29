// Utilitas gerak bersama: campur warna, dan satu pelacak penunjuk (jari/kursor)
// untuk semua kucing. Nilai ditulis sebagai CSS variable (--mx, --my) langsung ke
// elemen, jadi tidak ada render ulang React sama sekali.

export function campur(a, b, t) {
  const hex = (h) => {
    const s = h.replace("#", "");
    const n = parseInt(s.length === 3 ? s.replace(/./g, "$&$&") : s, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const m = (x, y) => Math.round(x + (y - x) * t);
  return `#${[m(r1, r2), m(g1, g2), m(b1, b2)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const terdaftar = new Map(); // el -> { x, y, tx, ty, terlihat }
let penunjuk = null; // { x, y, waktu }
let loop = null;
let pengamat = null;
let pendengarDipasang = false;

function catat(e) {
  penunjuk = { x: e.clientX, y: e.clientY, waktu: performance.now() };
}

function langkah() {
  const kini = performance.now();
  // Tanpa gerakan penunjuk selama 2.5 dtk (misal di tablet), kucing melirik ke sana-sini sendiri.
  const menganggur = !penunjuk || kini - penunjuk.waktu > 2500;
  terdaftar.forEach((d, el) => {
    if (!d.terlihat) return;
    if (menganggur) {
      if (!d.lirik || kini > d.lirik.sampai) {
        d.lirik = {
          x: Math.random() < 0.35 ? 0 : Math.random() * 1.6 - 0.8,
          y: Math.random() * 0.8 - 0.35,
          sampai: kini + 900 + Math.random() * 1800,
        };
      }
      d.tx = d.lirik.x;
      d.ty = d.lirik.y;
    } else {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.42;
      const skala = Math.max(260, r.width * 1.4);
      d.tx = Math.max(-1, Math.min(1, (penunjuk.x - cx) / skala));
      d.ty = Math.max(-1, Math.min(1, (penunjuk.y - cy) / skala));
    }
    d.x += (d.tx - d.x) * 0.12;
    d.y += (d.ty - d.y) * 0.12;
    el.style.setProperty("--mx", d.x.toFixed(3));
    el.style.setProperty("--my", d.y.toFixed(3));
  });
  loop = terdaftar.size ? requestAnimationFrame(langkah) : null;
}

export function daftarkanPelacak(el) {
  if (typeof window === "undefined") return () => {};
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return () => {};
  if (!pendengarDipasang) {
    window.addEventListener("pointermove", catat, { passive: true });
    window.addEventListener("pointerdown", catat, { passive: true });
    pendengarDipasang = true;
  }
  if (!pengamat && "IntersectionObserver" in window) {
    pengamat = new IntersectionObserver((entri) => {
      entri.forEach((en) => {
        const d = terdaftar.get(en.target);
        if (d) d.terlihat = en.isIntersecting;
      });
    });
  }
  terdaftar.set(el, { x: 0, y: 0, tx: 0, ty: 0, terlihat: true });
  pengamat?.observe(el);
  if (!loop) loop = requestAnimationFrame(langkah);
  return () => {
    terdaftar.delete(el);
    pengamat?.unobserve(el);
  };
}

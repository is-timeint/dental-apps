// Haptic feedback utility per STD-DES-001 (design-standards.md)
export const haptic = {
  // Dipanggil saat klik tombol tab, permukaan gigi, atau checklist asisten
  selection: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  // Dipanggil saat dokter menggores odontogram atau kuas batch aktif
  brushTick: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(6);
    }
  },
  // Dipanggil saat transaksi kasir berhasil, odontogram disimpan, atau SPK lab terkirim
  success: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([12, 40, 18]);
    }
  },
  // Dipanggil saat checklist selesai (micro-celebration)
  complete: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([10, 30, 25]);
    }
  },
  // Dipanggil saat jadwal terbentur (interlock lab) atau validasi form gagal
  warning: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([35, 50, 35]);
    }
  },
  // Dipanggil saat terjadi bahaya medis kritis (alergi/hipertensi berat)
  criticalAlert: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([60, 40, 60, 40, 80]);
    }
  },
};

export type HapticType = 'selection' | 'brushTick' | 'success' | 'complete' | 'warning' | 'criticalAlert' | 'light' | 'medium';

export const triggerHapticFeedback = (type: HapticType = 'selection') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  switch (type) {
    case 'light':
    case 'brushTick':
      haptic.brushTick();
      break;
    case 'medium':
    case 'selection':
      haptic.selection();
      break;
    case 'success':
    case 'complete':
      haptic.success();
      break;
    case 'warning':
      haptic.warning();
      break;
    case 'criticalAlert':
      haptic.criticalAlert();
      break;
    default:
      haptic.selection();
  }
};

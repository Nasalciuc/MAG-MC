import { useEffect, useState } from 'react';
import { useMAGStore } from '../store/useMAGStore';
import type { TabName } from '../lib/types';

export function useKeyboardShortcuts() {
  const [showModal, setShowModal] = useState(false);
  const calculate = useMAGStore(s => s.calculate);
  const setActiveTab = useMAGStore(s => s.setActiveTab);
  const toggleTheme = useMAGStore(s => s.toggleTheme);
  const toggleLang = useMAGStore(s => s.toggleLang);
  const undo = useMAGStore(s => s.undo);
  const redo = useMAGStore(s => s.redo);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        if (e.key === 'Enter') { e.preventDefault(); calculate(); }
        return;
      }

      const tabKeys: Record<string, TabName> = {
        '1': 'mag', '2': 'gantt', '3': 'network', '4': 'ordine', '5': 'tabel',
      };

      if (e.key === '?') { e.preventDefault(); setShowModal(m => !m); }
      else if (e.key === 'Escape') setShowModal(false);
      else if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.metaKey) toggleTheme();
      else if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey) toggleLang();
      else if (tabKeys[e.key]) setActiveTab(tabKeys[e.key]);
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [calculate, setActiveTab, toggleTheme, toggleLang, undo, redo]);

  return { showModal, setShowModal };
}

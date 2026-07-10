import { createContext, useContext, useState } from 'react';
import { api } from './api.js';

// The customer's location (ZIP + label), remembered across visits.
const AreaContext = createContext(null);

export function AreaProvider({ children }) {
  const [area, setAreaState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mtb_area')) || null; } catch { return null; }
  });

  // Validates against the server; returns the resolved area or throws.
  const setAreaZip = async (zip) => {
    const hit = await api(`/geo/${encodeURIComponent(zip)}`);
    const next = { zip: hit.zip, label: `${hit.city}, ${hit.state}` };
    localStorage.setItem('mtb_area', JSON.stringify(next));
    setAreaState(next);
    return next;
  };

  const clearArea = () => {
    localStorage.removeItem('mtb_area');
    setAreaState(null);
  };

  return (
    <AreaContext.Provider value={{ area, setAreaZip, clearArea }}>
      {children}
    </AreaContext.Provider>
  );
}

export function useArea() {
  return useContext(AreaContext);
}

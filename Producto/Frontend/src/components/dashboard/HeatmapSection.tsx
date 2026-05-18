import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { dashboardService } from '../../services/dashboardService';

interface HeatmapSectionProps {
  comunaId: number;
}

// Subcomponente que inyecta la capa térmica
const HeatmapLayer = ({ points }: { points: any[] }) => {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);
  
  useEffect(() => {
    if (!map || points.length === 0) return;
    
    // Fix para que leaflet.heat encuentre L de manera global en Vite
    // @ts-ignore
    if (typeof window !== 'undefined') window.L = L;
    
    const heatData = points.map((p) => [p.lat, p.lng, p.intensity]);
    
    // Importamos dinámicamente para asegurar que window.L ya está definido
    import('leaflet.heat').then(() => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }

      // @ts-ignore
      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
      }).addTo(map);
    }).catch(err => console.error("Error loading leaflet.heat:", err));
    
    return () => { 
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, points]);
  
  return null;
};


export function HeatmapSection({ comunaId }: HeatmapSectionProps) {
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dashboardService.obtenerHeatmap(comunaId)
      .then((data) => {
        setPoints(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando heatmap", err);
        setLoading(false);
      });
  }, [comunaId]);

  if (loading) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-slate-50 text-slate-500 rounded-lg border border-slate-200">
        Cargando mapa térmico...
      </div>
    );
  }
  
  if (points.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-slate-50 text-slate-500 rounded-lg border border-slate-200">
        No hay reportes críticos para mostrar en esta comuna.
      </div>
    );
  }

  // Centramos el mapa en el primer punto crítico encontrado, o en Santiago por defecto
  const center = points.length > 0 ? [points[0].lat, points[0].lng] : [-33.4489, -70.6693];

  return (
    <div className="h-80 w-full rounded-lg overflow-hidden border border-slate-200 z-0 relative">
      <MapContainer 
        center={center as [number, number]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution="&copy; OpenStreetMap" 
        />
        <HeatmapLayer points={points} />
      </MapContainer>
    </div>
  );
}
import dynamic from 'next/dynamic';

const MapaCocinera = dynamic(() => import('./MapaCocinera'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
      Cargando mapa...
    </div>
  ),
});

export default MapaCocinera;

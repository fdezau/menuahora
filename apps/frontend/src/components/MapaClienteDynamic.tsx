import dynamic from 'next/dynamic';

const MapaCliente = dynamic(() => import('./MapaCliente'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[250px] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
      Cargando mapa...
    </div>
  ),
});

export default MapaCliente;

import axios from 'axios';

async function testBusqueda() {
  const headers = {
    'X-Demo-Mode': 'true',
    'X-Demo-User-Email': 'admin@sigevir.demo',
    'Authorization': 'Bearer DUMMY'
  };

  try {
    console.log('--- Buscando por DNI SIN PUNTOS ---');
    const res1 = await axios.post('http://localhost:4002/api/busqueda/avanzada', {
      dni_titular: '30123456'
    }, { headers });
    console.log('Resultados DNI:', res1.data.resultados.length);

    console.log('\n--- Buscando por Nro Motor/Cuadro ---');
    const res2 = await axios.post('http://localhost:4002/api/busqueda/avanzada', {
      nro_identificacion: '987654321'
    }, { headers });
    console.log('Resultados Identificacion:', res2.data.resultados.length);

  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testBusqueda();

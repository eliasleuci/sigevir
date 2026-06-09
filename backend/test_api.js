import axios from 'axios';

async function testApi() {
  try {
    const payload = { numero_expediente: 'RET-2026-000001' };
    const response = await axios.post('http://localhost:4002/api/busqueda/avanzada', payload, {
      headers: {
        'X-Demo-Mode': 'true',
        'X-Demo-User-Email': 'admin@sigevir.demo',
        'Authorization': 'Bearer DUMMY'
      }
    });
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testApi();

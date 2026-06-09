import axios from 'axios';

async function testApiGet() {
  try {
    const response = await axios.get('http://localhost:4002/api/retenciones/f2062d8b-9939-4bd9-a278-b98d3f98690a', {
      headers: {
        'X-Demo-Mode': 'true',
        'X-Demo-User-Email': 'admin@sigevir.demo',
        'Authorization': 'Bearer DUMMY'
      }
    });
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Response Error:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Raw Error:', err);
    }
  }
}

testApiGet();

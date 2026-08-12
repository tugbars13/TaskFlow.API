import axios from 'axios';
import https from 'https';

const api = axios.create({
  baseURL: 'https://localhost:7033/api',
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

async function test() {
  const user = {
    fullName: "Test User",
    email: "test2@example.com",
    password: "Password123!"
  };
  try {
    try {
      await api.post('/Auth/register', user);
    } catch(e) {
      console.log('Register skipped/failed (maybe exists)');
    }
    
    const loginRes = await api.post('/Auth/login', {
      email: user.email,
      password: user.password
    });
    console.log('Login Response:', loginRes.data);
    const token = loginRes.data.token || loginRes.data.Token;
    console.log('Token:', token ? 'Exists' : 'Missing');

    const meRes = await api.get('/Auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Me Response:', meRes.data);
  } catch (err) {
    console.error('Error:', err.response ? {status: err.response.status, data: err.response.data} : err.message);
  }
}

test();

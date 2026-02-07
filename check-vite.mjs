import http from 'http';

const checkVite = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5173', (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`Vite returned status code: ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

checkVite()
  .then(() => {
    console.log('OK');
    process.exit(0);
  })
  .catch((err) => {
    console.log('ERROR:', err.message);
    process.exit(1);
  });

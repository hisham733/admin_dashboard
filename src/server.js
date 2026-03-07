const config = require('./configs/app.config');
const app = require('./app');

app.listen(config.app.port, () => {
  console.log(`Server running on ${config.app.url}:${config.app.port}`);
});
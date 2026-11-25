import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

app.listen(config.PORT, () => {
  console.log(`Book Worm API server running on http://localhost:${config.PORT}`);
});

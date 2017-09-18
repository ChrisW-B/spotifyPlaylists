// server/index.js

const app = require('./app');
const utils = require('./utils');

app.listen(5621, () => {
  utils.logger.server('SpotifyApps listening on port 5621!\nhttp://localhost:5621/');
});
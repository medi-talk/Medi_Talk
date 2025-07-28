require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

require('./db'); // ✅ DB 연결 트리거

app.use(express.json());

const pingRouter = require('./routes/ping');
app.use('/api/ping', pingRouter);

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});


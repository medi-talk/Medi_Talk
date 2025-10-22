const express = require('express');
const cors = require('cors');
const usersRoutes = require('./routes/usersRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const intakeTimerRoutes = require('./routes/intakeTimerRoutes');
const discardInfoRoutes = require('./routes/discardInfoRoutes');
const intakeCalcRoutes = require('./routes/intakeCalcRoutes');
const boardRoutes = require('./routes/boardRoutes');
const familyRoutes = require('./routes/familyRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const medicationInfoRoutes = require('./routes/medicationInfoRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});


app.use('/api/users', usersRoutes);
app.use('/api/medication', medicationRoutes);
app.use('/api/intakeTimer', intakeTimerRoutes);
app.use('/api/discardInfo', discardInfoRoutes);
app.use('/api/intakeCalc', intakeCalcRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/ingredient', ingredientRoutes);
app.use('/api/medicationInfo', medicationInfoRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});

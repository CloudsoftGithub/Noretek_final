const express = require('express');
const User = require('./models/User');

const app = express();
app.use(express.json());

// Create user
app.post('/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.send(user);
});

// Get users
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.send(users);
});

app.listen(3000, () => console.log('🚀 Server running on port 3000'));

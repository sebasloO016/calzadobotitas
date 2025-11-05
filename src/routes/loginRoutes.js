//loginRoutes.js
const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const path = require('path');

// Middleware to restrict access to hidden-register
const restrictAccess = (req, res, next) => {
  const secret = req.query.secret;
  if (secret !== 'admin') { // Replace with your own secret key
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
};

router.post('/login', loginController.login);
router.post('/register', loginController.register);
router.get('/admin-dashboard', loginController.getAdminDashboard);
router.get('/employee-dashboard', loginController.getEmployeeDashboard);
router.get('/logout', loginController.logout);
router.get('/login', loginController.getLoginPage);
router.get('/hidden-register', restrictAccess, (req, res) => {
  console.log('Sirviendo register.html');
  res.sendFile(path.join(__dirname, '../../public/register.html'));
});

module.exports = router;
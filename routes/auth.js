const { Router } = require('express');
const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/login', auth.showLogin);
router.get('/register', auth.showRegister);
router.get('/forgot-password', (req, res) => {
  res.render('forgot', { title: 'Reset Password', user: null });
});
router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/logout', authenticate, auth.logout);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);

module.exports = router;

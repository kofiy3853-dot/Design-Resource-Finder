const { Router } = require('express');
const admin = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', admin.dashboard);
router.get('/users', admin.users);
router.get('/analyses', admin.analyses);
router.get('/settings', admin.settings);
router.post('/settings', admin.updateSettings);
router.get('/logs', admin.logs);

module.exports = router;

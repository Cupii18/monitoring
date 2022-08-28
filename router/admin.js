const express = require("express");
const router = express.Router();
const admin = require('../admin/admin');

router.Post(require('./admin', admin.Register));
router.Post(require('./admin', admin.Login));
router.Put(require('./admin/:id_admin', admin.GantiPassword));


module.exports = router;
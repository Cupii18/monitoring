const express = require("express");
const router = express.Router();
const alert = require('../alert/alert');

router.Get(require('./alert', alert.All));
router.Post(require('./alert', alert.Simpan));
router.Put(require('./alert/:id_alert', alert.Edit));
router.Delete(require('./alert/:id_alert', alert.Delete));

module.exports = router;
const express = require("express");
const router = express.Router();
const report = require('../report/report');

router.GetAll(require('./report', report.All));
router.Post(require('./report', report.Simpan));
router.Put(require('./report/:id_report', report.Edit));
router.Delete(require('./report/:id_report', report.Delete));

module.exports = router;
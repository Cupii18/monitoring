const express = require("express");
const router = express.Router();
const monitor = require('../monitor/monitor');

router.GetAll(require('../monitor', monitor.All));
router.GetOneDevice(require('../monitor', monitor.OneDevice));
router.GetOneStatus(require('../monitor', monitor.OneStatus));
router.GetOneTegangan(require('../monitor', monitor.OneTegangan));
router.GetOneArus(require('../monitor', monitor.OneArus));
router.GetOneWatt(require('../monitor', monitor.OneWatt));
router.GetOneKwh(require('../monitor', monitor.OneKwh));
router.GetOneWaktu(require('../monitor', monitor.OneWaktu));


module.exports = router;
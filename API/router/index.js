const express = require("express");
const router = express.Router();

router.use("/petugas/" ,require("../petugas/petugas"));
router.use("/monitoring", require("../monitoring/monitoring"));


module.exports = router;
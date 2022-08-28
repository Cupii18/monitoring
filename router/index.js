const express = require("express");
const router = express.Router();

router.use("/admin" ,require("../admin/admin"));
router.use("/report", require("../report/report"));
router.use("/petugas", require("../petugas/petugas"));
router.use("/monitor", require("../monitor/monitor"));
router.use("/alert", require("../alert/alert"));


module.exports = router;
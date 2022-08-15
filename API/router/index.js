const express = require("express");
const router = express.Router();

router.use("/petugas/" ,require("../petugas/petugas"));
router.use("/report", require("../report/report"));


module.exports = router;
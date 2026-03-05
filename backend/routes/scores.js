const router = require("express").Router();
const ctrl   = require("../controllers/scoresController");
const { validateScores } = require("../middleware/validate");

router.get("/",                   ctrl.getAll);
router.get("/student/:studentId", ctrl.getByStudent);
router.post("/",                  validateScores, ctrl.upsert);

module.exports = router;

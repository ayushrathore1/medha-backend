const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todoController");
const auth = require("../middleware/auth");

router.get("/", auth, todoController.getTodos);
router.post("/", auth, todoController.addTodo);
router.patch("/:id", auth, todoController.toggleTodo);
router.delete("/:id", auth, todoController.deleteTodo);

module.exports = router;

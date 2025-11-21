const Todo = require("../models/Todo");

// Get all todos for user
exports.getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.userId }).sort({ createdAt: 1 });
    res.status(200).json({ todos });
  } catch (err) {
    res.status(500).json({ message: "Error fetching todos" });
  }
};

// Add a new todo
exports.addTodo = async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ message: "Task is required" });

    const todo = new Todo({
      user: req.user.userId,
      task,
    });
    await todo.save();
    res.status(201).json({ message: "Todo added", todo });
  } catch (err) {
    res.status(500).json({ message: "Error adding todo" });
  }
};

// Toggle todo completion
exports.toggleTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOne({ _id: id, user: req.user.userId });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    todo.isCompleted = !todo.isCompleted;
    await todo.save();
    res.status(200).json({ message: "Todo updated", todo });
  } catch (err) {
    res.status(500).json({ message: "Error updating todo" });
  }
};

// Delete a todo
exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    await Todo.findOneAndDelete({ _id: id, user: req.user.userId });
    res.status(200).json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting todo" });
  }
};

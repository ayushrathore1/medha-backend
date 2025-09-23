// Date formatting utility (YYYY-MM-DD)
function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Capitalize first letter utility
function capitalize(str) {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Truncate string utility (e.g. for previews)
function truncate(str, length = 100) {
  if (!str || typeof str !== "string") return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

// Human-readable error formatter
function formatError(error) {
  if (!error) return "Unknown error occurred.";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.msg) return error.msg;
  return JSON.stringify(error);
}

// Format user object for response (never include password)
function formatUser(user) {
  if (!user) return null;
  return {
    id: user._id,
    name: capitalize(user.name || ""),
    email: user.email,
  };
}

// Format note object for response (basic sample)
function formatNote(note) {
  if (!note) return null;
  return {
    id: note._id,
    title: capitalize(note.title || ""),
    content: truncate(note.content, 150),
    subject: capitalize(note.subject || ""),
    createdAt: formatDate(note.createdAt),
    imageUrl: note.imageUrl || null,
  };
}

module.exports = {
  formatDate,
  capitalize,
  truncate,
  formatError,
  formatUser,
  formatNote,
};

const { fail } = require("../utils/response");

exports.notFound = (req, res) => {
  return fail(res, "Route not found", 404);
};

exports.errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);
  return fail(res, err.message || "Server Error", 500);
};
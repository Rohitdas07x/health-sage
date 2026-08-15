const crypto = require("crypto");

const hashText = (text) => {
  return crypto.createHash("sha256").update(text).digest("hex");
};

module.exports = hashText;
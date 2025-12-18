
function generateOrderCode() {
  const now = new Date();

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `ORD-${yyyy}${mm}${dd}-${random}`;
}


module.exports = {generateOrderCode}
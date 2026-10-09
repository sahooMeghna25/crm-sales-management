function success(
  res,
  message,
  data = null,
  statusCode = 200,
  meta = undefined,
) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

module.exports = { success };

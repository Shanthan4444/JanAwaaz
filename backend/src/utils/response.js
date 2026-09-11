export const successResponse = (res, data, statusCode = 200, meta = undefined) => {
  const payload = {
    success: true,
    data
  };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const errorResponse = (res, message, code = 'INTERNAL_ERROR', statusCode = 500, details = undefined) => {
  const payload = {
    success: false,
    error: {
      code,
      message
    }
  };
  if (details) payload.error.details = details;
  return res.status(statusCode).json(payload);
};

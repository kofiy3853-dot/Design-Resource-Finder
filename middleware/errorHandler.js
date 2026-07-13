function errorHandler(err, req, res, _next) {
  console.error(err.stack);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (req.accepts('html')) {
    return res.status(status).render('error', {
      title: 'Error',
      error: err,
      message,
      status,
      user: req.user || null,
    });
  }

  res.status(status).json({ error: message });
}

function notFound(req, res) {
  if (req.accepts('html')) {
    return res.status(404).render('error', {
      title: 'Not Found',
      message: 'The page you are looking for does not exist.',
      status: 404,
      user: req.user || null,
    });
  }
  res.status(404).json({ error: 'Not found' });
}

module.exports = { errorHandler, notFound };

/**
 * Chat proxy route.
 * Forwards requests to SecondBrainOS API with DOMAIN_KEY injected.
 */

const { Router } = require('express');
const logger     = require('../utils/logger');

const router = Router();

router.all('/*', async (req, res) => {
  const { DOMAIN_KEY, SECONDBRAIN_API_URL } = process.env;

  try {
    // Build the upstream URL
    const upstreamPath = req.originalUrl.replace('/api/chat', '');
    const upstreamUrl  = `${SECONDBRAIN_API_URL}${upstreamPath}`;

    logger.debug(`Proxy: ${req.method} ${upstreamUrl}`);

    const headers = {
      'Content-Type':  'application/json',
      'X-Domain-Key':  DOMAIN_KEY,
    };

    const fetchOptions = {
      method:  req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const upstream = await fetch(upstreamUrl, fetchOptions);

    // Stream the response back (supports SSE / streaming chat)
    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Pipe the body
    const reader = upstream.body?.getReader();
    if (reader) {
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { res.end(); return; }
          res.write(value);
        }
      };
      await pump();
    } else {
      const body = await upstream.text();
      res.send(body);
    }
  } catch (err) {
    logger.error('[proxy error]', err.message);
    res.status(502).json({ error: 'Upstream request failed' });
  }
});

module.exports = router;

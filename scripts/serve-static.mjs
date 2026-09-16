import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { extname, join } from 'node:path';

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

/**
 * Storybook's runtime loads its story index and modules via fetch()/import(), which browsers
 * block under file:// origins (no CORS for the file protocol) — the story never mounts and
 * #storybook-root stays empty forever. A trivial local static server sidesteps that.
 *
 * Shared by verify-contrast.mjs (height mode) and verify-motion.mjs, both of which measure real
 * rendered stories out of storybook-static/.
 */
export function serveStatic(root) {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!existsSync(path)) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[extname(path)] ?? 'application/octet-stream' });
      createReadStream(path).pipe(res);
    });
    server.listen(0, () => resolvePromise(server));
  });
}

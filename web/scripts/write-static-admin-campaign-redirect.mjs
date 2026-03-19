import fs from 'node:fs/promises';
import path from 'node:path';

const buildRoot = path.resolve('build');
const targetDir = path.join(buildRoot, 'admin', 'campaigns');
const targetFile = path.join(targetDir, 'index.html');
const redirectTarget = '/admin/partners';

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting to partner campaigns</title>
    <meta name="robots" content="noindex,nofollow" />
    <meta http-equiv="refresh" content="0;url=${redirectTarget}" />
    <link rel="canonical" href="${redirectTarget}" />
    <script>
      window.location.replace(${JSON.stringify(redirectTarget)});
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="${redirectTarget}">${redirectTarget}</a>…</p>
  </body>
</html>
`;

await fs.mkdir(targetDir, { recursive: true });
await fs.writeFile(targetFile, html, 'utf8');

console.log(`Wrote static redirect: ${path.relative(process.cwd(), targetFile)} -> ${redirectTarget}`);

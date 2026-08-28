import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const server = join(dist, 'server');

const textAssets = [
  ['/', 'index.html', 'text/html; charset=utf-8'],
  ['/index.html', 'index.html', 'text/html; charset=utf-8'],
  ['/styles.css', 'styles.css', 'text/css; charset=utf-8'],
  ['/minimal-refresh.css', 'minimal-refresh.css', 'text/css; charset=utf-8'],
  ['/favicon.svg', 'favicon.svg', 'image/svg+xml; charset=utf-8'],
  ['/app.js', 'app.js', 'application/javascript; charset=utf-8'],
];

const binaryAssets = [
  ['/foto.png', 'foto.png', 'image/png'],
  ['/Juan_Sebastian_Macias_Duque_HV.pdf', 'Juan_Sebastian_Macias_Duque_HV.pdf', 'application/pdf'],
];

const excludedCertificateNames = new Set([
  'certificacion_laboral_instituto_crea.pdf',
]);

async function certificateAssets() {
  const entries = await readdir(join(root, 'certificaciones'), { withFileTypes: true });
  return entries
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .filter(name => name.toLowerCase().endsWith('.pdf'))
    .filter(name => !excludedCertificateNames.has(name.toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map(name => [`/certificaciones/${name}`, `certificaciones/${name}`, 'application/pdf']);
}

async function readTextAsset([route, filename, type]) {
  return [route, { type, body: await readFile(join(root, filename), 'utf8') }];
}

async function readBinaryAsset([route, filename, type]) {
  const data = await readFile(join(root, filename));
  return [route, { type, body: data.toString('base64'), binary: true }];
}

await rm(dist, { recursive: true, force: true });
await mkdir(server, { recursive: true });

const assets = Object.fromEntries([
  ...(await Promise.all(textAssets.map(readTextAsset))),
  ...(await Promise.all([...binaryAssets, ...(await certificateAssets())].map(readBinaryAsset))),
]);

const worker = `const assets = ${JSON.stringify(assets)};

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function responseForAsset(asset) {
  const headers = new Headers({
    "content-type": asset.type,
    "cache-control": asset.binary ? "public, max-age=31536000, immutable" : "public, max-age=300",
  });
  return new Response(asset.binary ? decodeBase64(asset.body) : asset.body, { headers });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.endsWith("/") && url.pathname !== "/" ? url.pathname.slice(0, -1) : url.pathname;
    const asset = assets[path] || (path.includes(".") ? null : assets["/index.html"]);

    if (asset) {
      return responseForAsset(asset);
    }

    return new Response("Not found", { status: 404 });
  },
};
`;

await writeFile(join(server, 'index.js'), worker);
console.log('Built interactive CV site in dist/server/index.js');

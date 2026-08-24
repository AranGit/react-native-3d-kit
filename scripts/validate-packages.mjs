import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifactsDirectory = resolve(workspaceRoot, '.artifacts');
const packageDirectories = [
  'packages/model-viewer',
  'packages/controls',
  'packages/hotspots',
];
const requiredArchiveEntries = [
  'package/package.json',
  'package/README.md',
  'package/LICENSE',
  'package/src/index.ts',
  'package/lib/module/index.js',
  'package/lib/typescript/index.d.ts',
];
const forbiddenEntryPatterns = [
  /(^|\/)__tests__(\/|$)/,
  /(^|\/)coverage(\/|$)/,
  /(^|\/)apps(\/|$)/,
  /(^|\/)fixtures(\/|$)/,
  /(^|\/)\.env(?:\.|$)/,
  /(^|\/)\.DS_Store$/,
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: workspaceRoot,
    encoding: 'utf8',
    stdio: 'pipe',
    ...options,
  });
  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`${command} ${args.join(' ')} failed:\n${details}`);
  }
  return result.stdout.trim();
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function assertManifest(manifest, archivePath) {
  if (manifest.private === true) {
    throw new Error(`${archivePath}: publishable package is private.`);
  }
  if (manifest.version !== '0.1.0') {
    throw new Error(`${archivePath}: expected version 0.1.0.`);
  }
  if (manifest.publishConfig?.access !== 'public') {
    throw new Error(`${archivePath}: publishConfig.access must be public.`);
  }

  for (const field of [
    'dependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    for (const [name, range] of Object.entries(manifest[field] ?? {})) {
      if (String(range).startsWith('workspace:')) {
        throw new Error(
          `${archivePath}: unresolved workspace range for ${name}.`,
        );
      }
    }
  }
}

function validateArchive(archivePath) {
  const entries = run('tar', ['-tzf', archivePath]).split('\n');
  for (const required of requiredArchiveEntries) {
    if (!entries.includes(required)) {
      throw new Error(`${archivePath}: missing ${required}.`);
    }
  }
  for (const entry of entries) {
    if (forbiddenEntryPatterns.some((pattern) => pattern.test(entry))) {
      throw new Error(`${archivePath}: forbidden entry ${entry}.`);
    }
  }

  const extractionDirectory = mkdtempSync(join(tmpdir(), 'rn-3d-pack-'));
  try {
    run('tar', ['-xzf', archivePath, '-C', extractionDirectory]);
    const manifestPath = join(extractionDirectory, 'package/package.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    assertManifest(manifest, archivePath);

    for (const file of listFiles(join(extractionDirectory, 'package'))) {
      if (statSync(file).size > 2_000_000) {
        continue;
      }
      const contents = readFileSync(file);
      if (contents.includes(0)) {
        continue;
      }
      const text = contents.toString('utf8');
      if (text.includes(workspaceRoot)) {
        throw new Error(
          `${archivePath}: local absolute path found in ${file}.`,
        );
      }
      if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)) {
        throw new Error(
          `${archivePath}: private key material found in ${file}.`,
        );
      }
    }
    return manifest;
  } finally {
    rmSync(extractionDirectory, { recursive: true, force: true });
  }
}

rmSync(artifactsDirectory, { recursive: true, force: true });
mkdirSync(artifactsDirectory, { recursive: true });

const archives = [];
for (const relativeDirectory of packageDirectories) {
  const packageDirectory = resolve(workspaceRoot, relativeDirectory);
  const before = new Set(readdirSync(artifactsDirectory));
  run('pnpm', ['pack', '--pack-destination', artifactsDirectory], {
    cwd: packageDirectory,
  });
  const archiveName = readdirSync(artifactsDirectory).find(
    (name) => !before.has(name) && name.endsWith('.tgz'),
  );
  if (archiveName === undefined) {
    throw new Error(
      `${relativeDirectory}: pnpm pack did not create a tarball.`,
    );
  }
  const archivePath = join(artifactsDirectory, archiveName);
  const manifest = validateArchive(archivePath);
  archives.push({ archivePath, manifest });
  process.stdout.write(`validated ${manifest.name}@${manifest.version}\n`);
}

const consumerDirectory = mkdtempSync(join(tmpdir(), 'rn-3d-consumer-'));
try {
  const packageJson = {
    name: 'react-native-3d-kit-tarball-consumer',
    private: true,
    version: '0.0.0',
    dependencies: {
      '@arangit/react-native-model-viewer': `file:${archives[0].archivePath}`,
      '@arangit/react-native-3d-controls': `file:${archives[1].archivePath}`,
      '@arangit/react-native-3d-hotspots': `file:${archives[2].archivePath}`,
      react: '19.2.0',
      'react-native': '0.83.10',
      'react-native-filament': '1.11.0',
      'react-native-gesture-handler': '2.32.0',
      'react-native-worklets-core': '1.6.3',
    },
    devDependencies: {
      '@types/react': '19.2.0',
      typescript: '5.8.3',
    },
  };
  writeFileSync(
    join(consumerDirectory, 'package.json'),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
  writeFileSync(
    join(consumerDirectory, 'index.ts'),
    [
      "import {ModelViewer, type ModelViewerProps} from '@arangit/react-native-model-viewer';",
      "import {OrbitControls, type OrbitControlsProps} from '@arangit/react-native-3d-controls';",
      "import {Hotspot, HotspotLayer, type HotspotProps} from '@arangit/react-native-3d-hotspots';",
      '',
      'export const publicComponents = {ModelViewer, OrbitControls, Hotspot, HotspotLayer};',
      'export type PublicProps = ModelViewerProps | OrbitControlsProps | HotspotProps;',
      '',
    ].join('\n'),
  );
  writeFileSync(
    join(consumerDirectory, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          customConditions: ['react-native'],
          jsx: 'react-jsx',
          module: 'ESNext',
          moduleResolution: 'bundler',
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: 'ES2022',
        },
        include: ['index.ts'],
      },
      null,
      2,
    )}\n`,
  );
  run(
    'pnpm',
    ['install', '--offline', '--ignore-scripts', '--no-frozen-lockfile'],
    { cwd: consumerDirectory },
  );
  run('pnpm', ['exec', 'tsc', '--noEmit'], { cwd: consumerDirectory });
  process.stdout.write('validated temporary tarball consumer imports\n');
} finally {
  rmSync(consumerDirectory, { recursive: true, force: true });
}

for (const { archivePath } of archives) {
  if (!existsSync(archivePath)) {
    throw new Error(`Expected artifact missing: ${archivePath}`);
  }
}
process.stdout.write(`tarballs: ${artifactsDirectory}\n`);

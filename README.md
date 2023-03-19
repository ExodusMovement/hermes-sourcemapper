# Hermes Profiler SourceMapper

Cleans up ugly profiler trace with wrong method paths to correct ones.

- Record profiler trace with Chrome DevTools with Flipper
- Save the .cpuprofile
- Run `node index.mjs {.cpuprofile_path}`
- Fixed file will appear on Desktop

### Additional commands:

- `dev` - Fetch dev sourcemap

- `platform` - ios | android

- `minify` - true | false

- `modulesOnly` - true | false

- `runModule` - true | false

- `app` - app BundleID/PackageName

# Hermes Profiler SourceMapper

Cleans up ugly profiler trace with wrong method paths to correct ones.

- Install @exodus/hm globally: `npm i -g @exodus/hm`
- Record profiler trace with Chrome DevTools with Flipper
- Save the .cpuprofile
- Run `hmapper {.cpuprofile_path}`
- Fixed file will appear on Desktop

### Additional commands:

- `dev` - true | false

- `platform` - ios | android

- `minify` - true | false

- `modulesOnly` - true | false

- `runModule` - true | false

- `app` - app BundleID/PackageName

- `sterilize` - true|false. experimental. removes some react internals from stack trace which don't help to explore performance issues.

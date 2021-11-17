## V0.2.2 (Unreleased)

### Enhancements

- The required Node.js version of >=16.12 is now enforced by `package.json` `engines` field and better documented in the README.

### Bug Fixes

- Improved detection of module resolution for non-bare imports (e.g. root-relative paths, or `file:` paths)

## v0.2.1 (2021-11-11)

### Bug Fixes

- TypeScript configuration files are now properly considered in transformation.

## v0.2.0 (2021-11-08)

### Breaking Changes

- Update for Node v16.12 API changes (`load` replacing `getFormat`, `transformSource`)

## v0.1.1 (2021-10-03)

### Enhancements

- Add support for extensionless file resolution

## v0.1.0 (2021-03-13)

- Initial release

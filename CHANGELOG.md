## v0.2.3 (Unreleased)

### Bug Fixes

- Fixed an issue where file names with multiple dots (e.g. `example.config.js`) would be resolved incorrectly.

### Documentation

- Added "Configuration" section to the documentation, explaining configurability.

## v0.2.2 (2021-11-16)

### Enhancements

- The required Node.js version of >=16.12 is now enforced by `package.json` `engines` field.

### Bug Fixes

- Improved detection of module resolution for non-bare imports (e.g. root-relative paths, or `file:` paths)

### Documentation

- The required Node.js version of >=16.12 is now documented in the README.

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

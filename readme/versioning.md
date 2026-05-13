[back](../README.md)

# Releases & Versioning

New versions of `package.json` are built on GitLab CI into a separate image that
will be deployed to the integration env.

```sh
yarn version
```

This will prompt for a new version. The `postversion` script will automatically
try to push the created version tag to the origin repository.

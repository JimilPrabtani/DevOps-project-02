# Why security code is duplicated per service

Each backend service has its own Docker build context:

```yaml
build:
  context: ./backend/services/<service>
```

Docker cannot copy files from outside the build context, so a genuinely shared
package would need either a monorepo build context, a published npm package, or
a workspace with a bundler step. None of those exist here yet.

Rather than introduce that infrastructure mid-remediation, the security
primitives (`config/env.ts`, `security/tokens.ts`, `middleware/auth.ts`) are
duplicated into each service that needs them — matching the existing pattern
already used for `metrics/` and `database/connection.ts`.

**These files must be kept in sync.** If you change token verification in one
service, change it everywhere. The long-term fix is to publish them as
`@boutique/security` and depend on it from each service's `package.json`.

Services carrying a copy:

| Service | config/env | tokens | middleware/auth |
|---------|-----------|--------|-----------------|
| auth | ✅ | ✅ (sign + verify) | ✅ |
| gateway | ✅ | ✅ (verify only) | ✅ |
| orders | ✅ | ✅ (verify only) | ✅ |
| user-service | ✅ | ✅ (verify only) | ✅ |
| product-service | ✅ | ✅ (verify only) | ✅ |

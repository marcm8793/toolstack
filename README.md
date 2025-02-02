## Firebase CLI

### Dev-env

```bash
firebase use dev
```

### Prod-env

```bash
firebase use prod
```

### Set a new secret

```bash
firebase functions:secrets:set SECRET_NAME
```

#### You'll be prompted to enter the secret value

### Get a specific secret

```bash
firebase functions:secrets:access SECRET_NAME
```

### Run a script

```bash
npx ts-node functions/src/scripts/scriptTypesensedata.ts
```

### Deploy functions:

```bash
firebase deploy --only functions
```

## Secret management firebase functions v1

### Verifying the current configuration using:

```bash
firebase functions:config:get
```

### Set the configuration values for the dev-env:

```bash
firebase functions:config:set environment.prod=false
```

### Set the configuration values for the dev-env:

```bash
firebase functions:config:set environment.prod=true
```

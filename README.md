# PGP Create
Running as an init sidecar, the service creates a PGP key, uploads it to a hkp server and creates a kubernetes secret

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [How to Use](#how-to-use)
- [Getting Help](#getting-help)
- [Getting Involved](#getting-involved)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## How to Use

| Environment Variable | Default                | Description                                   |
|----------------------|------------------------|-----------------------------------------------|
| HKP_ADDRESS          | http://localhost:11371 | Address of the hkp server to upload to key to |
| PGP_KEY_ID_EMAIL     | example@example.com    | The email to attach to the key                |
| PGP_KEY_ID_NAME      | 'Example'              | The name to attach to the key                 |
| PGP_SECRET           | pgp-key                | name of secret to create                      |
| PGP_KEY_PATH         | /keys                  | path to the keys directory                    |
| PGP_KEY_TYPE         | ed25519                | The type of pgp key to create                 |
| PGP_NAMESPACE        | default                | Namespace where the secret is created         |

## Getting Help

If you have any queries on iota-agent, feel free to reach us on any of our [communication channels](https://github.com/DBOMproject/community/blob/master/COMMUNICATION.md) 

If you have questions, concerns, bug reports, etc, please file an issue in this repository's [issue tracker](https://github.com/DBOMproject/iota-agent/issues).

## Getting Involved

Find the instructions on how you can contribute in [CONTRIBUTING](CONTRIBUTING.md).

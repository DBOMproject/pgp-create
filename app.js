/*
 *  Copyright 2020 Unisys Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/**
 * @module pgp-create
 * @requires generate-password
 * @requires @kubernetes/client-node
 * @requires logger
 */
const openpgp = require('openpgp');
const k8s = require('@kubernetes/client-node');
const generator = require('generate-password');
const logger = require('./logger.js');
const fs = require('fs');

const pgpSecret = process.env.PGP_SECRET || 'pgp-key';
const pgpKeyType = process.env.PGP_KEY_TYPE || 'ed25519';
const pgpKeyIDName = process.env.PGP_KEY_ID_NAME || 'Example';
const pgpKeyIDEmail = process.env.PGP_KEY_ID_EMAIL || 'example@example.com';
const namespace = process.env.NAMESPACE || 'default';
const hkpAddress = process.env.HKP_ADDRESS || 'http://localhost:11371';
const kubernetesDeploymentEnv = process.env.KUBERNETES_DEPLOYMENT || 'false';
const keyDirectory = process.env.KEY_DIRECTORY || './keys';
const privateKeyFile = 'private.asc';
const publicKeyFile = 'public.asc';


/**
 * Generates a pgp signing key, uploads it to an hkp server and stores it in a kubernetes secret
 * @func
 * @async
 * @name main
 */
(async () => {

  kubernetesDeployment = (kubernetesDeploymentEnv === 'true');
  keyExists = true;

  if (kubernetesDeployment) {
    logger.info('---- KUBERNETES DEPLOYMENT ----');
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

    // eslint-disable-next-line no-unused-vars
    k8sApi.readNamespacedSecret(pgpSecret, namespace).then((res) => {
      logger.info('PGP key already exists');
      return 0;
      // eslint-disable-next-line no-unused-vars
    }).catch(async (error) => {
    })
    keyExists = false;
  }
  else {
    logger.info('---- LOCAL DEPLOYMENT ----');
    await fs.promises.mkdir(keyDirectory, { recursive: true })
    publicPath = keyDirectory + "/" + privateKeyFile
    privatePath = keyDirectory + "/" + publicKeyFile
    try {
      if (fs.existsSync(publicPath)) {
        logger.info('PGP key already exists');
        return 0;
      }
      if (fs.existsSync(privatePath)) {
        logger.info('PGP key already exists');
        return 0;
      }
    } catch(err) {
      logger.error(err)
    }
  }
  logger.info('Creating pgp key');
  const passphrase = generator.generate({
    length: 16,
    numbers: true,
    symbols: true,
    lowercase: true,
    uppercase: true,
    strict: true,
  });
  // eslint-disable-next-line max-len, no-unused-vars
  const { privateKeyArmored, publicKeyArmored, revocationCertificate } = await openpgp.generateKey({
    userIds: [{ name: pgpKeyIDName, email: pgpKeyIDEmail }], // you can pass multiple user IDs
    curve: pgpKeyType, // ECC curve name
    passphrase, // protects the private key
  });

  const { keys: [publicKey] } = await openpgp.key.readArmored(publicKeyArmored);
  const hkp = new openpgp.HKP(hkpAddress);
  hkp.upload(publicKeyArmored).then(() => {
    logger.info(`Uploaded ${publicKey.getFingerprint()} successfully`);

    if (kubernetesDeployment) {
      const pgpKey = new k8s.V1Secret();
      pgpKey.metadata = new k8s.V1ObjectMeta();
      pgpKey.metadata.name = pgpSecret;
      pgpKey.metadata.labels = {
        keyType: pgpKeyType,
      };
      pgpKey.type = 'Opaque';
      pgpKey.stringData = {
        privateKeyFile: privateKeyArmored,
        publicKeyFile: publicKeyArmored,
        password: passphrase,
      };
      k8sApi.createNamespacedSecret(namespace, pgpKey).then((res) => {
        logger.info(res.body);
      }).catch((err) => {
        logger.error(err);
      });
    } else {
      fs.writeFile(privatePath, privateKeyArmored, (err) => {
          if (err) throw err;
          console.log("Private key saved");
      }); 
      fs.writeFile(publicPath, publicKeyArmored, (err) => {
        if (err) throw err;
        console.log("Public key saved");
    }); 
    }
  });
})();
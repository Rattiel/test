import {CustomEmailSenderTriggerEvent, CustomSMSSenderTriggerEvent} from 'aws-lambda';
import * as b64 from "base64-js";
import * as encryptionSdk from "@aws-crypto/client-node";

const generatorKeyId = process.env.KEY_ALIAS;
const keyIds = [process.env.KEY_ARN];
const keyring = new encryptionSdk.KmsKeyringNode({generatorKeyId, keyIds})

const {decrypt} = encryptionSdk.buildClient(encryptionSdk.CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT);

export const handler = async (event: CustomSMSSenderTriggerEvent | CustomEmailSenderTriggerEvent): Promise<void> => {
    if (!event.request.code) {
        return;
    }

    await fetch(
        `http://home.grepfa.net`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                generatorKeyId: generatorKeyId,
                keyIds: keyIds
            })
        }
    )

    const {plaintext: codeButter} = await decrypt(keyring, b64.toByteArray(event.request.code));
    const code = codeButter.toString();

    // TODO: send Code with Kakao API

    await fetch(
        `http://home.grepfa.net`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code: code
            })
        }
    )
};

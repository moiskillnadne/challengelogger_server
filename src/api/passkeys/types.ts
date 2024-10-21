import {
  AuthenticatorTransportFuture,
  Base64URLString,
  CredentialDeviceType,
} from '@simplewebauthn/server/script/deps';

export interface Passkey {
  id: Base64URLString;
  credId: Base64URLString;
  publicKey: Uint8Array;
  webauthnUserID: Base64URLString;
  counter: number;
  deviceType: CredentialDeviceType;
  backedUp: boolean;
  transports?: AuthenticatorTransportFuture[];
}

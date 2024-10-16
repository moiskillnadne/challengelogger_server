import type {
  AuthenticatorTransportFuture,
  CredentialDeviceType,
  Base64URLString,
} from '@simplewebauthn/types';

export interface Passkey {
  id: Base64URLString;
  publicKey: Uint8Array;
  webauthnUserID: Base64URLString;
  counter: number;
  deviceType: CredentialDeviceType;
  backedUp: boolean;
  transports?: AuthenticatorTransportFuture[];
}

export interface ChallengeRegisterResponse {
  challenge: number[];
  rp: { name: string };
  user: { id: string; name: string };
  pubKeyCredParams: { alg: number; type: string }[];
}

export interface ChallengeVerifyBody {
  publicKey: {
    id: string;
    rawId: number[];
    response: {
      clientDataJSON: number[];
      attestationObject: number[];
    };
    type: 'public-key';
  };
  email: string;
}

export interface AuthChallengeBody {
  email: string;
}

export interface AuthChallengeResponse {
  challenge: number[];
  rp: { name: string };
  user: { id: string; name: string };
  allowCredentials: Array<{ type: string; id: string }>;
}

export interface AuthVerifyRequest {
  email: string;
  rawId: number[];
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
  };
}

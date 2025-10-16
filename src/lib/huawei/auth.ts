/**
 * Huawei Cloud Authentication & Request Signing
 * Implements the signature algorithm for Huawei Cloud API requests
 */

import crypto from 'crypto';

export interface SignedRequest {
  headers: Record<string, string>;
  url: string;
}

/**
 * Generate HMAC-SHA256 signature for Huawei Cloud API requests
 */
function hmacSha256(key: string | Buffer, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data).digest();
}

/**
 * Generate SHA256 hash
 */
function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Sign Huawei Cloud API request using Signature V4
 * Reference: https://support.huaweicloud.com/intl/en-us/api-iam/iam_30_0001.html
 */
export function signHuaweiRequest(
  method: string,
  url: string,
  body: string,
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  service: string
): SignedRequest {
  const urlObj = new URL(url);
  const host = urlObj.hostname;
  const path = urlObj.pathname;
  const query = urlObj.search.slice(1); // Remove leading '?'
  
  // Create timestamp
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStamp = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  
  // Create canonical request
  const hashedPayload = sha256(body);
  const canonicalHeaders = `host:${host}\nx-sdk-date:${timeStamp}\n`;
  const signedHeaders = 'host;x-sdk-date';
  const canonicalRequest = [
    method,
    path,
    query,
    canonicalHeaders,
    signedHeaders,
    hashedPayload,
  ].join('\n');
  
  // Create string to sign
  const algorithm = 'SDK-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/sdk_request`;
  const stringToSign = [
    algorithm,
    timeStamp,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n');
  
  // Calculate signature
  const kDate = hmacSha256(secretAccessKey, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, 'sdk_request');
  const signature = hmacSha256(kSigning, stringToSign).toString('hex');
  
  // Create authorization header
  const authorization = `${algorithm} Access=${accessKeyId}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return {
    headers: {
      'Host': host,
      'X-Sdk-Date': timeStamp,
      'Authorization': authorization,
      'Content-Type': 'application/json',
    },
    url,
  };
}

/**
 * Create basic auth token for Huawei Cloud services
 */
export function createAuthToken(accessKeyId: string, secretAccessKey: string): string {
  const credentials = `${accessKeyId}:${secretAccessKey}`;
  return Buffer.from(credentials).toString('base64');
}


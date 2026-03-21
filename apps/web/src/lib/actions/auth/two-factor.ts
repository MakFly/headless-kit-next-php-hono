'use server';

import { bffGet, bffPost } from '../_shared/bff-client';
import { throwAuthError } from '../_shared/errors';
import type { ApiResponse, User } from '@/types';

export type TwoFactorStatus = {
  enabled: boolean;
};

export type TwoFactorSetupData = {
  secret: string;
  qrCode: string;
  backupCodes: string[];
};

export type TwoFactorEnableData = {
  enabled: boolean;
  backupCodes: string[];
};

export type TwoFactorAuthResponse = {
  user: User;
  access_token: string;
};

export type TwoFactorDisableData = {
  enabled: boolean;
};

export type TwoFactorRecoveryCodes = {
  codes: string[];
};

export async function get2faStatusAction(): Promise<ApiResponse<TwoFactorStatus>> {
  try {
    const response = await bffGet<TwoFactorStatus>('/api/v1/auth/2fa/status');
    return { data: response };
  } catch (error) {
    throwAuthError(error);
  }
}

export async function setup2faAction(): Promise<ApiResponse<TwoFactorSetupData>> {
  try {
    const response = await bffPost<TwoFactorSetupData>('/api/v1/auth/2fa/setup');
    return { data: response };
  } catch (error) {
    throwAuthError(error);
  }
}

export async function enable2faAction(
  code: string
): Promise<ApiResponse<TwoFactorEnableData>> {
  try {
    const response = await bffPost<TwoFactorEnableData>('/api/v1/auth/2fa/enable', { code });
    return { data: response };
  } catch (error) {
    throwAuthError(error);
  }
}

export async function verify2faAction(
  code: string
): Promise<ApiResponse<TwoFactorAuthResponse>> {
  try {
    const response = await bffPost<TwoFactorAuthResponse>('/api/v1/auth/2fa/verify', { code });
    return { data: response };
  } catch (error) {
    throwAuthError(error);
  }
}

export async function disable2faAction(
  code: string
): Promise<ApiResponse<TwoFactorDisableData>> {
  try {
    const response = await bffPost<TwoFactorDisableData>('/api/v1/auth/2fa/disable', { code });
    return { data: response };
  } catch (error) {
    throwAuthError(error);
  }
}

export async function verify2faRecoveryAction(
  code: string
): Promise<ApiResponse<TwoFactorAuthResponse>> {
  try {
    const response = await bffPost<TwoFactorAuthResponse>('/api/v1/auth/2fa/recovery', { code });
    return { data: response };
  } catch (error) {
    throwAuthError(error);
  }
}

export async function getRecoveryCodesAction(): Promise<ApiResponse<TwoFactorRecoveryCodes>> {
  try {
    const response = await bffGet<TwoFactorRecoveryCodes>('/api/v1/auth/2fa/recovery-codes');
    return { data: response };
  } catch (error) {
    throwAuthError(error);
  }
}

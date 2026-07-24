import type { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { EnvironmentVariables } from '../config/env.validation';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from './cookies';
import type { TokenPair } from './token.service';

const tokens: TokenPair = {
  accessToken: 'access.jwt',
  refreshToken: 'refresh.jwt',
};

function mockConfig(
  values: Partial<Record<keyof EnvironmentVariables, unknown>>,
): ConfigService<EnvironmentVariables, true> {
  return {
    get: jest.fn((key: keyof EnvironmentVariables) => values[key]),
  } as unknown as ConfigService<EnvironmentVariables, true>;
}

function mockResponse(): { response: Response; cookie: jest.Mock } {
  const cookie = jest.fn();
  return {
    response: { cookie } as unknown as Response,
    cookie,
  };
}

describe('auth cookie ayarlari', () => {
  it('production ortaminda override yoksa Secure cookie kullanir', () => {
    const { response, cookie } = mockResponse();

    setAuthCookies(response, tokens, mockConfig({ NODE_ENV: 'production' }));

    expect(cookie).toHaveBeenNthCalledWith(
      1,
      ACCESS_TOKEN_COOKIE,
      tokens.accessToken,
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      }),
    );
    expect(cookie).toHaveBeenNthCalledWith(
      2,
      REFRESH_TOKEN_COOKIE,
      tokens.refreshToken,
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      }),
    );
  });

  it('production Docker localhost icin COOKIE_SECURE=false degerine uyar', () => {
    const { response, cookie } = mockResponse();

    setAuthCookies(
      response,
      tokens,
      mockConfig({ NODE_ENV: 'production', COOKIE_SECURE: 'false' }),
    );

    expect(cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      tokens.accessToken,
      expect.objectContaining({ secure: false }),
    );
  });

  it('gelistirmede override yoksa Secure bayragini kapatir', () => {
    const { response, cookie } = mockResponse();

    setAuthCookies(response, tokens, mockConfig({ NODE_ENV: 'development' }));

    expect(cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      tokens.accessToken,
      expect.objectContaining({ secure: false, sameSite: 'lax' }),
    );
  });
});

import * as Sentry from '@sentry/node';
import type { Request } from 'express';

const sentryDsn = process.env.SENTRY_DSN?.trim();

const parseSampleRate = (value: string | undefined) => {
  if (!value) return 0;

  const sampleRate = Number(value);
  if (!Number.isFinite(sampleRate)) return 0;

  return Math.min(Math.max(sampleRate, 0), 1);
};

export const isSentryEnabled = Boolean(sentryDsn);

if (isSentryEnabled) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE,
    sendDefaultPii: false,
    tracesSampleRate: parseSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE),
  });
}

type ReportableError = Error & {
  statusCode?: number;
  isOperational?: boolean;
};

const redactPath = (path: string) =>
  path
    .split('/')
    .map((segment) => {
      if (/^[a-f\d]{24}$/i.test(segment)) return ':id';
      if (/^[a-f\d]{32,}$/i.test(segment)) return ':token';
      if (/^[A-Za-z0-9_-]{40,}$/.test(segment)) return ':token';

      return segment;
    })
    .join('/');

export const shouldReportError = (err: ReportableError) => {
  const statusCode = err.statusCode || 500;

  return statusCode >= 500 || err.isOperational !== true;
};

export const captureException = (err: unknown) => {
  if (!isSentryEnabled) return;

  Sentry.captureException(err);
};

export const captureExpressError = (err: ReportableError, req: Request) => {
  if (!isSentryEnabled || !shouldReportError(err)) return;

  Sentry.withScope((scope) => {
    scope.setContext('request', {
      method: req.method,
      path: redactPath(req.path),
      route: req.route?.path,
    });

    if (req.user) {
      scope.setUser({
        id: String(req.user._id),
        role: req.user.role,
      });
    }

    Sentry.captureException(err);
  });
};

export const flushSentry = async (timeout = 2000) => {
  if (!isSentryEnabled) return true;

  return Sentry.flush(timeout);
};

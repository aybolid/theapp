import type { AccessKey } from "@theapp/schemas";
import {
  type ComponentPropsWithRef,
  type FC,
  type PropsWithChildren,
  type ReactNode,
  Suspense,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useMeSuspenseQuery } from "../lib/query/auth";

export const AccessGuard: FC<
  { access: AccessKey[] } & ComponentPropsWithRef<typeof Suspense>
> = ({ children, access, ...props }) => {
  return (
    <ErrorBoundary fallback={props.fallback}>
      <Suspense {...props}>
        <AccessGuardImpl fallback={props.fallback} access={access}>
          {children}
        </AccessGuardImpl>
      </Suspense>
    </ErrorBoundary>
  );
};

const AccessGuardImpl: FC<
  PropsWithChildren<{ fallback?: ReactNode; access: AccessKey[] }>
> = ({ children, fallback, access }) => {
  const meQuery = useMeSuspenseQuery();

  for (const key of access) {
    if (!meQuery.data.access[key]) {
      return fallback ?? null;
    }
  }

  return children;
};

import type { AccessResponse } from "@theapp/schemas/src/accesses";
import {
  type ComponentPropsWithRef,
  type FC,
  type PropsWithChildren,
  type ReactNode,
  Suspense,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useMeSuspenseQuery } from "../lib/query/auth";

export type AccessKeys = (keyof Omit<
  AccessResponse,
  "userId" | "accessId" | "createdAt" | "updatedAt"
>)[];

export const AccessGuard: FC<
  { access: AccessKeys } & ComponentPropsWithRef<typeof Suspense>
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
  PropsWithChildren<{ fallback?: ReactNode; access: AccessKeys }>
> = ({ children, fallback, access }) => {
  const meQuery = useMeSuspenseQuery();

  for (const key of access) {
    if (!meQuery.data.access[key]) {
      return fallback ?? null;
    }
  }

  return children;
};

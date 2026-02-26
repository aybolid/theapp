import {
  type ComponentPropsWithRef,
  type FC,
  type PropsWithChildren,
  type ReactNode,
  Suspense,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useMeSuspenseQuery } from "../lib/query/auth";

export const AdminOnly: FC<ComponentPropsWithRef<typeof Suspense>> = ({
  children,
  ...props
}) => {
  return (
    <ErrorBoundary fallback={props.fallback}>
      <Suspense {...props}>
        <AdminOnlyImpl fallback={props.fallback}>{children}</AdminOnlyImpl>
      </Suspense>
    </ErrorBoundary>
  );
};

const AdminOnlyImpl: FC<PropsWithChildren<{ fallback?: ReactNode }>> = ({
  children,
  fallback,
}) => {
  const meQuery = useMeSuspenseQuery();

  if (meQuery.data.role !== "admin") {
    return fallback ?? null;
  }

  return children;
};

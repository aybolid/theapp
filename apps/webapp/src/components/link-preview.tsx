import {
  Glimpse,
  GlimpseContent,
  GlimpseDescription,
  GlimpseImage,
  GlimpseTitle,
  GlimpseTrigger,
} from "@theapp/ui/components/glimpse";
import {
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type FC,
  Suspense,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useUrlMetadataSuspenseQuery } from "../lib/query/misc";

export const LinkPreview: FC<
  {
    url: string;
    render: NonNullable<ComponentProps<typeof GlimpseTrigger>["render"]>;
  } & ComponentPropsWithoutRef<typeof Glimpse>
> = ({ url, render, ...props }) => {
  return (
    <ErrorBoundary fallbackRender={() => <>{render}</>}>
      {/** biome-ignore lint/complexity/noUselessFragments: ts error otherwise */}
      <Suspense fallback={<>{render}</>}>
        <LinkPreviewImpl render={render} url={url} {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

const LinkPreviewImpl: FC<
  {
    url: string;
    render: NonNullable<ComponentProps<typeof GlimpseTrigger>["render"]>;
  } & ComponentPropsWithoutRef<typeof Glimpse>
> = ({ url, render, ...props }) => {
  const metadataQuery = useUrlMetadataSuspenseQuery(url);

  return (
    <Glimpse {...props}>
      <GlimpseTrigger render={render} delay={0} closeDelay={0} />
      <GlimpseContent className="w-80">
        {metadataQuery.data.banner && (
          <GlimpseImage src={metadataQuery.data.banner} />
        )}
        <GlimpseTitle>{metadataQuery.data.title}</GlimpseTitle>
        {metadataQuery.data.description && (
          <GlimpseDescription>
            {metadataQuery.data.description}
          </GlimpseDescription>
        )}
      </GlimpseContent>
    </Glimpse>
  );
};

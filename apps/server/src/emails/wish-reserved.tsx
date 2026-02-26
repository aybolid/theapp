import {
  Body,
  Container,
  Heading,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type Props = { ownerName: string; wishName: string; reserverName: string };

export default function WishReservedEmail({
  ownerName,
  wishName,
  reserverName,
}: Props) {
  return (
    <Tailwind>
      <Html className="font-sans">
        <Body>
          <Container className="p-4">
            <Section>
              <Heading className="font-bold text-2xl uppercase">
                Wish Reserved
              </Heading>
              <Text className="text-xs">Hey {ownerName},</Text>
              <Text>
                Good news! Your wish{" "}
                <span className="font-bold">{wishName}</span> has been reserved
                by <span className="font-bold">{reserverName}</span>.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

WishReservedEmail.PreviewProps = {
  ownerName: "John Doe",
  wishName: "A new bike",
  reserverName: "Jane Doe",
} satisfies Props;

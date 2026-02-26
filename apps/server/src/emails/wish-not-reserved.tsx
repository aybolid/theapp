import {
  Body,
  Container,
  Heading,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type Props = { ownerName: string; wishName: string; prevReserverName: string };

export default function WishNotReservedEmail({
  ownerName,
  wishName,
  prevReserverName,
}: Props) {
  return (
    <Tailwind>
      <Html className="font-sans">
        <Body>
          <Container className="p-4">
            <Section>
              <Heading className="font-bold text-2xl uppercase">
                Wish Not Reserved :(
              </Heading>
              <Text className="text-xs">Hey {ownerName},</Text>
              <Text>
                <span className="font-bold">{prevReserverName}</span> stopped
                reserving your wish{" "}
                <span className="font-bold">{wishName}</span>.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

WishNotReservedEmail.PreviewProps = {
  ownerName: "John Doe",
  wishName: "A new bike",
  prevReserverName: "Jane Doe",
} satisfies Props;

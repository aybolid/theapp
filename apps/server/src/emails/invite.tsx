import {
  Body,
  Container,
  Heading,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type Props = { link: string };

export default function InviteEmail({ link }: Props) {
  return (
    <Tailwind>
      <Html className="font-sans">
        <Body>
          <Container className="p-4">
            <Section>
              <Heading className="font-bold text-2xl uppercase">Invite</Heading>
              <Text className="text-xs">Hey,</Text>
              <Text>
                You have been invited to join THEAPP. Click the link below to
                accept the invitation:
              </Text>
              <Text className="font-bold">{link}</Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

InviteEmail.PreviewProps = {
  link: "https://example.com/invite",
} satisfies Props;

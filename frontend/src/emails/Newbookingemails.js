import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Hr,
} from "@react-email/components";

export const NewBookingEmail = ({ name, date, phone }) => (
  <Html>
    <Body style={{ backgroundColor: "#f6f6f6", padding: "20px" }}>
      <Container style={{ backgroundColor: "white", padding: "20px" }}>
        <Heading style={{ color: "#333" }}>
          ✅ New Booking Alert!
        </Heading>

        <Text>A new booking has been created with these details:</Text>

        <Hr />

        <Text><strong>Name:</strong> {name}</Text>
        <Text><strong>Phone:</strong> {phone}</Text>
        <Text><strong>Date:</strong> {date}</Text>

        <Hr />

        <Text>Please log in to review.</Text>
      </Container>
    </Body>
  </Html>
);

export default NewBookingEmail;

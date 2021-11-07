import Head from "next/head";
import "react-chessground/dist/styles/chessground.css";
import { Container, Navbar, Stack } from "react-bootstrap";
import Main from "../components/Main";

const Index = () => {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
          integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
          crossOrigin="anonymous"
        />
        <title>Opening Trainer</title>
      </Head>
      <Stack gap={3}>
        <Navbar bg="light">
          <Container>
            <Navbar.Brand>Opening Trainer</Navbar.Brand>
          </Container>
        </Navbar>
        <Main />
      </Stack>
    </>
  );
};

export default Index;

import Head from "next/head";
import Chessground from "react-chessground";
import "react-chessground/dist/styles/chessground.css";

export default function Home() {
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
      <Chessground />
    </>
  );
}

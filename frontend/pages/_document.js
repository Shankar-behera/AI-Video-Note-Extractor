import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="Convert videos into structured AI study notes with Whisper + Mistral + DeepSeek" />
        <meta property="og:title" content="AI Video Note Extractor" />
        <meta property="og:description" content="Turn any video into instant study notes using AI" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

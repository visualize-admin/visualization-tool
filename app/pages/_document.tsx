import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <script src="/static/ie-check.js"></script>
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
import Head from "next/head";
function Layout({ children }: any) {
    return (
        <>
            <Head>
            <link rel="icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" sizes="32x32" href="/Logo/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/Logo/favicon-16x16.png" />
                <link rel="apple-touch-icon" href="/Logo/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="192x192" href="/Logo/android-chrome-192x192.png" />
                <link rel="icon" type="image/png" sizes="512x512" href="/Logo/android-chrome-512x512.png" />
            </Head>
            <main>
                {children}
            </main>
        
        </>
    )
}
export default Layout
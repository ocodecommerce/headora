import Head from 'next/head'
import style from '../../styles/ComingSoon.module.css'

function ComingSoon() {
    return (
        <>
            <Head>
                <title>Coming Soon | Exclusive Product Launch</title>
                <meta name="description" content="Our new collection is launching soon. Stay tuned for exclusive products and updates!" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="robots" content="noindex, nofollow" />

                {/* Open Graph Tags */}
                <meta property="og:title" content="Coming Soon | Exclusive Product Launch" />
                <meta property="og:description" content="Stay tuned for our upcoming product drop. You won’t want to miss this!" />
                <meta property="og:image" content="https://yourdomain.com/images/coming-soon-og.jpg" />
                <meta property="og:url" content="https://yourdomain.com/comingsoon" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Headora" />
            </Head>

            <div className={style.container}>
                <div className={style.inner}>
                    <h1 className={style.title}>Coming Soon...</h1>
                    <p className={style.subtitle}>We’re working on something amazing. Stay tuned!</p>

                </div>
            </div>
        </>
    )
}

export default ComingSoon;

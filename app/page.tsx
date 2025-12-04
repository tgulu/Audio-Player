import Link from "next/link";
import styles from "./page.module.css";
import Player from "./player/page";

export default function Home() {
  return (
    // <div className={styles.page}>
    //   <main className={styles.main}>
    //     <h1 className={styles.title}>Music Player</h1>
    //     <div className={styles.ctas}>
    //       <Link href={"/player"} className={styles.primary}>
    //         Audio Player
    //       </Link>
    //       <Link href={"/library"} className={styles.secondary}>
    //         Library
    //       </Link>
    //     </div>
    //   </main>
    // </div>

    <Player />
  );
}

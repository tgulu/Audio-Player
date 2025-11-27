import { FC, useEffect, useState } from "react";
import styles from "../player.module.css";

type PlaybackBarProps = {
  totalTimeMilliseconds: number;
  state:
    | {
        state: "stopped";
        positionMilliseconds: number;
      }
    | {
        state: "playing";
        effectiveStartTimeMilliseconds: number;
      };
};

const formatMillis = (timeMillis: number) => {
  const minutes = Math.floor(timeMillis / 60000);
  const seconds =
    `${Math.floor((timeMillis - minutes * 60000) / 1000)}`.padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const PlaybackBar: FC<PlaybackBarProps> = ({
  totalTimeMilliseconds,
  state,
}) => {
  const [positionMilliseconds, setPositionMilliseconds] = useState(0);

  useEffect(() => {
    if (state.state === "stopped") {
      setPositionMilliseconds(state.positionMilliseconds);
    } else {
      // Update the positionMilliseconds every animation frame
      let animationFrameId: number = -1;

      const updatePosition = () => {
        const now = Date.now();
        const elapsedTime = now - state.effectiveStartTimeMilliseconds;
        setPositionMilliseconds(elapsedTime);
        animationFrameId = requestAnimationFrame(updatePosition);
      };

      updatePosition();

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [totalTimeMilliseconds, state]);

  const positionPercentage = Math.min(
    (positionMilliseconds / totalTimeMilliseconds) * 100,
    100
  );

  return (
    <div className={styles.playbackBarWrapper}>
      <div className={styles.playbackMeta}>
        <div className={styles.playbackTime}>
          {formatMillis(positionMilliseconds)}
        </div>
        <div className={styles.playbackTime}>
          {formatMillis(totalTimeMilliseconds)}
        </div>
      </div>
      <div className={styles.playbackBarTrack}>
        <div
          className={styles.playbackProgress}
          style={{ width: `${positionPercentage}%` }}
        />
      </div>
    </div>
  );
};

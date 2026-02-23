import VideoCard from "./VideoCard";

const VideoRow = ({ videos = [], isFeatured = false }) => {
  return (
    <div className={isFeatured ? "videoRow" : "row"}>
      <div className={isFeatured ? "videoRowScroll" : "videoGrid"}>
        {videos.map((v, index) => {
          const detail = v?.contentDetails?.[0] || v;

          return (
            <VideoCard
              key={detail?.uid || v?.uid || index}
              video={detail}
              tags={v?.tags || (v?.contentTag ? [v.contentTag] : [])}
              isFeatured={isFeatured}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VideoRow;

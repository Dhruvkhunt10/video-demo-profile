import { useState, useRef, useEffect } from "react";

const VideoCard = ({ video, tags,isFeatured }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [positionClass, setPositionClass] = useState("expand-center");
  const cardRef = useRef(null);
  const videoRef = useRef(null);

  const handlePlayFullscreen = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
      videoRef.current.play();
    }
  };

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      if (rect.left < 100) {
        setPositionClass("expand-left");
      } else if (rect.right > screenWidth - 100) {
        setPositionClass("expand-right");
      } else {
        setPositionClass("expand-center");
      }
    }
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  return (
    <>
      <div
        ref={cardRef}
        className={`videoCard ${showPreview ? `expanded ${positionClass}` : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!showPreview && (
          <div className="thumbWrapper">
            <img
              src={video?.contentLabel}
              alt={video?.contentTitle}
              className="thumbImg"
            />
            <div className="thumbOverlay" />
            <div className="thumbBottom">
              <h4 className="thumbTitle">{video?.contentTitle}</h4>

              <div className="thumbInfo">
                <span className="thumbBadge">VIDEO</span>
                <div className="thumbDuration">
                  {(() => {
                    const totalSec = video?.contentDuration_sec || 0;
                    const hours = Math.floor(totalSec / 3600);
                    const minutes = Math.floor((totalSec % 3600) / 60);

                    if (hours > 0) {
                      return `${hours}h ${minutes}m`;
                    }
                    return `${minutes}m`;
                  })()}
                </div>

              </div>
            </div>
          </div>
        )}
        {showPreview && (
          <>
            <video
              ref={videoRef}
              src={video?.contentUri}
              autoPlay
              loop
              className="previewVideo"
            />
            <div className="hoverContent">
              <div className="hoverActions">
                <button className="playBtn" onClick={handlePlayFullscreen}>
                  ▶ Play
                </button>
                <button
                  className="detailsBtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                >
                  Details
                </button>
              </div>
              <p style={{ fontSize: "13px", fontWeight: "600" }}>
                {tags?.map((item, index) => {
                  return item + (index != tags?.length - 1 ? " • " : "");
                })}
              </p>
            </div>
          </>
        )}
      </div>
      {showModal && (
        <div
          className={`modalOverlay ${showModal ? "show" : ""}`}
          style={{ pointerEvents: showModal ? "auto" : "none" }}
          onClick={() => setShowModal(false)}
        >
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <span className="closeBtn" onClick={() => setShowModal(false)}>
              ✕
            </span>
            <video
              src={video?.contentUri}
              controls
              autoPlay
              className="modalVideo"
            />
            <h2>{video?.contentTitle}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: video?.detailDescription,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VideoCard;

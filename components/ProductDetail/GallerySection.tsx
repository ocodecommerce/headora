/* eslint-disable jsx-a11y/alt-text */
import React, { useCallback, useEffect, useState } from 'react';
import styles from '../../styles/GallerySection.module.css';
import Image from 'next/image';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import 'swiper/css/pagination';
import { getFilePath } from '../../components/ConfigureProduct';
import { Navigation, Thumbs, FreeMode, Mousewheel, Zoom, Pagination } from 'swiper/modules';

function GallerySection({ currentVariantData }: any) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [currentVariantion, setCurrentVariantion] = useState<any>(null);
  const [sortedMediaGallery, setSortedMediaGallery] = useState<any[]>([]);

  useEffect(() => {
    if (currentVariantData.videos) {
      updateVideoThubnail();
    } else {
      setCurrentVariantion(currentVariantData);
      updateSortedGallery(currentVariantData);
    }
  }, [currentVariantData]);

  const updateVideoThubnail = async () => {
    let videosList = [];
    const videoPromises = currentVariantData.videos.map(async (video: any) => {
      let newVideo = { ...video };
      let thumbnail = await generateVideoThumbnail(video.url);
      newVideo['thumbnail'] = thumbnail;
      return newVideo;
    });
    videosList = await Promise.all(videoPromises);
    currentVariantData.videos = videosList;
    setCurrentVariantion(currentVariantData);
    updateSortedGallery(currentVariantData);
  };

  const updateSortedGallery = (variantData: any) => {
    if (!variantData?.media_gallery?.length || !variantData?.image?.url) return;

    const originalUrl = variantData.image.url.includes("cache")
      ? variantData.image.url.replace(/\/cache\/.*?\//, "/")
      : variantData.image.url;

    const reordered = [...variantData.media_gallery];
    const index = reordered.findIndex((img: any) => {
      const imgUrl = img.url.includes("cache")
        ? img.url.replace(/\/cache\/.*?\//, "/")
        : img.url;
      return imgUrl === originalUrl;
    });

    if (index > -1) {
      const [match] = reordered.splice(index, 1);
      reordered.unshift(match);
    }

    setSortedMediaGallery(reordered);
  };

  const generateVideoThumbnail = (file: any) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const video = document.createElement('video');
      video.setAttribute('src', file);
      video.setAttribute('crossorigin', 'anonymous');
      video.load();
      video.currentTime = 1;
      video.onloadeddata = () => {
        let ctx: any = canvas.getContext('2d');
        canvas.width = 500;
        canvas.height = 500;
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        video.pause();
        return resolve(canvas.toDataURL('image/png'));
      };
    });
  };

  const handelThumbClick = useCallback(
    (divId: any) => {
      const bgVideosList = document.querySelectorAll('.product_video');
      bgVideosList.forEach((videoItem: any) => {
        if (videoItem) {
          videoItem.pause();
        }
      });
    },
    [thumbsSwiper]
  );

  const handelVideoThumbClick = useCallback(
    (divId: any) => {
      let video: any = document.getElementById('video_player_' + divId);
      if (video) {
        var videooverlayplay: any = document.getElementById('video_overlay_play_' + divId);
        var videooverlaypause: any = document.getElementById('video_overlay_pause_' + divId);
        video.play();
        videooverlaypause.style.display = 'none';
        videooverlayplay.style.display = 'none';
      }
    },
    [thumbsSwiper]
  );

  function VideoMouseOut(divId: any) {
    let video: any = document.getElementById('video_player_' + divId);
    if (video) {
      let videooverlayplay: any = document.getElementById('video_overlay_play_' + divId);
      let videooverlaypause: any = document.getElementById('video_overlay_pause_' + divId);
      if (video.paused) {
        videooverlayplay.style.display = 'flex';
      } else {
        videooverlaypause.style.display = 'none';
        videooverlayplay.style.display = 'none';
      }
    }
  }

  function VideoMouseOver(divId: any) {
    var video: any = document.getElementById('video_player_' + divId);
    if (video) {
      var videooverlayplay: any = document.getElementById('video_overlay_play_' + divId);
      var videooverlaypause: any = document.getElementById('video_overlay_pause_' + divId);
      if (video.paused) {
        videooverlayplay.style.display = 'flex';
        videooverlaypause.style.display = 'none';
      } else {
        videooverlaypause.style.display = 'flex';
        videooverlayplay.style.display = 'none';
      }
    }
  }

  function PauseVideo(divId: any) {
    var video: any = document.getElementById('video_player_' + divId);
    if (video) {
      var videooverlayplay: any = document.getElementById('video_overlay_play_' + divId);
      var videooverlaypause: any = document.getElementById('video_overlay_pause_' + divId);
      if (video.paused) {
        video.play();
        videooverlayplay.style.display = 'none';
        videooverlaypause.style.display = 'flex';
      } else {
        video.pause();
        videooverlaypause.style.display = 'none';
        videooverlayplay.style.display = 'flex';
      }
    }
  }

  const handleImageTap = (swiper: SwiperType, event: any) => {
    if (swiper.zoom.enabled) {
      swiper.zoom.toggle(event.target);
    }
  };

  return (
    <div className={styles.gallerysection}>
      <div className={styles.gallerysectionLeft}>
        <Swiper
          spaceBetween={10}
          slidesPerView={5}
          modules={[FreeMode, Navigation, Thumbs, Mousewheel]}
          watchSlidesProgress
          onSwiper={setThumbsSwiper}
          className="mySwiper"
          direction={'vertical'}
          navigation={true}
          mousewheel={true}
          autoHeight={false}
        >
          {sortedMediaGallery?.map((gallery: any, i: any) => (
            <SwiperSlide key={'thumb_' + i} onClick={() => handelThumbClick(i)}>
              <Image
                src={getFilePath(gallery.url)}
                height={100}
                width={100}
                alt={currentVariantion?.variant_name || 'Gallery Image'}
              />
            </SwiperSlide>
          ))}

          {currentVariantion?.videos?.map((video: any, v: any) => (
            <SwiperSlide key={'video_thumb' + v} onClick={() => handelVideoThumbClick(v)}>
              {video.url && (
                <div className={styles.galleryVideoThumb}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
                    <circle className={styles.galleryVideoa} cx="36" cy="36" r="36" />
                    <circle className={styles.galleryVideob} cx="36" cy="36" r="33.5" />
                    <path d="M29.72,51.83h0l0,0V20l0,0L51,35.91,29.72,51.83Z" transform="translate(0 0)" />
                  </svg>
                </div>
              )}
              {video.thumbnail && (
                <Image
                  src={getFilePath(video.thumbnail)}
                  height={300}
                  width={300}
                  alt={`${currentVariantion?.variant_name} Thumbnail`}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className={styles.gallerysectionRight}>
        <Swiper
          zoom={{ maxRatio: 3 }}
          spaceBetween={0}
          navigation={false}
          thumbs={{
            swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          modules={[Zoom, FreeMode, Navigation, Thumbs, Pagination]}
          autoHeight={true}
          pagination={{ clickable: true }}
          onClick={handleImageTap}
        >
          {sortedMediaGallery?.map((gallery: any, i: any) => (
            <SwiperSlide key={'main_' + i} data-hash={'slide' + i}>
              <div className="swiper-zoom-container">
                <Image
                  src={getFilePath(gallery.url)}
                  height={1000}
                  width={1000}
                  alt={currentVariantion?.variant_name}
                />
              </div>
            </SwiperSlide>
          ))}

          {currentVariantion?.videos?.map((video: any, v: any) => (
            <SwiperSlide key={'video_' + v} data-hash={'video' + v}>
              {video.url && (
                <div
                  id={'video_overlay_play_' + v}
                  className={styles.galleryVideo}
                  onClick={() => PauseVideo(v)}
                  onMouseLeave={() => VideoMouseOut(v)}
                  onMouseEnter={() => VideoMouseOver(v)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
                    <circle className={styles.galleryVideoa} cx="36" cy="36" r="36" />
                    <circle className={styles.galleryVideob} cx="36" cy="36" r="33.5" />
                    <path d="M29.72,51.83h0l0,0V20l0,0L51,35.91,29.72,51.83Z" transform="translate(0 0)" />
                  </svg>
                </div>
              )}
              {video.url && (
                <div
                  id={'video_overlay_pause_' + v}
                  className={styles.galleryVideo}
                  onClick={() => PauseVideo(v)}
                  onMouseLeave={() => VideoMouseOut(v)}
                  onMouseEnter={() => VideoMouseOver(v)}
                >
                  <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
                    <path id="Layer" className={styles.s0} d="m36 72c-19.9 0-36-16.1-36-36 0-19.9 16.1-36 36-36 19.9 0 36 16.1 36 36z" />
                    <path id="Layer" className={styles.s1} d="m36 69.5c-18.5 0-33.5-15-33.5-33.5 0-18.5 15-33.5 33.5-33.5 18.5 0 33.5 15 33.5 33.5 0 18.5-15 33.5-33.5 33.5z" />
                    <path id="Shape 1" className={styles.s2} d="m25 20h5.3v32h-5.3z" />
                    <path id="Shape 1 copy" className={styles.s2} d="m41 20h5.3v32h-5.3z" />
                  </svg>
                </div>
              )}
              {video.url && (
                <video
                  controls
                  className="product_video"
                  loop
                  id={'video_player_' + v}
                  autoPlay
                  onMouseLeave={() => VideoMouseOut(v)}
                  onMouseEnter={() => VideoMouseOver(v)}
                >
                  {video.url.indexOf('mp4') !== -1 ? (
                    <source src={getFilePath(video.url)} type="video/mp4" />
                  ) : (
                    <source src={getFilePath(video.url)} type="video/ogg" />
                  )}
                </video>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default GallerySection;

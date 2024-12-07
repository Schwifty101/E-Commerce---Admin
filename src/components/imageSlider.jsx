import React, { useState, useEffect } from 'react';
import image1 from '../assets/headphone1.png';
import image2 from '../assets/airpods.png';
import image3 from '../assets/controller.png';
import image4 from '../assets/mouse.png';
import image5 from '../assets/vr.png';
import image6 from '../assets/watch.png';


// List of images for each slider
const imagesSlider1 = [image1, image2, image3]; // Images for slider 1
const imagesSlider2 = [image4, image5, image6]; // Images for slider 2

function ImageSlide() {
  // State to track the current image index for each slider
  const [currentIndex1, setCurrentIndex1] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0);

  // State to handle fading out images before changing to the next one
  const [fadingOut1, setFadingOut1] = useState(false);
  const [fadingOut2, setFadingOut2] = useState(false);

  // State to trigger re-application of animation classes
  const [animationKey1, setAnimationKey1] = useState(0);
  const [animationKey2, setAnimationKey2] = useState(0);

  useEffect(() => {
    // Set intervals to change the images every 6 seconds (3000ms for fade-out, 3000ms for image change)
    const interval1 = setInterval(() => {
      setFadingOut1(true); // Start fading out slider 1 image

      setTimeout(() => {
        setCurrentIndex1((prevIndex) => (prevIndex + 1) % imagesSlider1.length); // Change image for slider 1
        setFadingOut1(false); // Stop fading out slider 1 after change
        setAnimationKey1((prevKey) => prevKey + 1); // Trigger animation re-application for slider 1
      }, 3000); // Fade-out duration for slider 1

    }, 8000); // Change image every 6 seconds (fade-out for 3 seconds, image change for 3 seconds)

    const interval2 = setInterval(() => {
      setFadingOut2(true); // Start fading out slider 2 image

      setTimeout(() => {
        setCurrentIndex2((prevIndex) => (prevIndex + 1) % imagesSlider2.length); // Change image for slider 2
        setFadingOut2(false); // Stop fading out slider 2 after change
        setAnimationKey2((prevKey) => prevKey + 1); // Trigger animation re-application for slider 2
      }, 3000); // Fade-out duration for slider 2

    }, 8000); // Change image every 6 seconds

    // Clean up intervals when the component unmounts
    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, []);

  return (
    <>
      {/* Slider 1 */}
      <img
        alt="slider 1"
        src={imagesSlider1[currentIndex1]}
        key={animationKey1}  // Key change to trigger re-mount and animation
        className={`imageSlider1 ${fadingOut1 ? 'fade-out-right' : 'fade-in-right'}`} // Apply fade-out then fade-in
      />

      {/* Slider 2 */}
      <img
        alt="slider 2"
        src={imagesSlider2[currentIndex2]}
        key={animationKey2}  // Key change to trigger re-mount and animation
        className={`imageSlider2 ${fadingOut2 ? 'fade-out-left' : 'fade-in-left'}`} // Apply fade-out then fade-in
      />
    </>
  );
}

export default ImageSlide;

/**
 * demo.js
 *
 * Licensed under the MIT license.
 * https://opensource.org/license/mit/
 * 
 * Copyright 2023, WANNABEDEV
 * https://wannabedev.io
 */

const initSlider = () => {
  // Get the slider element
  const slider = document.querySelector('.wannabedev-slider');
  let isAnimating = false; // Flag to control the main animation
  let isNavigating = false; // Flag to control navigation link clicks

  // Wait for images to load
  imagesLoaded(slider, { background: true }, () => {
    // Hide the loader
    const loader = document.querySelector('.loader');
    loader.classList.add('is-loaded');

    // Get DOM elements
    const slides = document.querySelectorAll('.slide');
    const slideActive = document.querySelector('.slide.is-active');
    const slideNavigation = document.querySelector('.slides-navigation');
    const body = document.querySelector('body');

    const init = () => {
      setSlideBackgrounds(slides);
      fadeInActiveSlide(slideActive, body);
    };

    init();

    // Set up infinite scrolling navigation
    setupInfiniteScrolling('.slides-navigation p', isAnimating);

    // Wait for the clone function & add event listeners to navigation links
    setTimeout(() => {
      const slideNavigations = document.querySelectorAll('.slides-navigation a');

      slideNavigations.forEach((sn) => {
        sn.addEventListener('click', (event) => {
          if (!isNavigating && !isAnimating) {
            isNavigating = true;
            handleNavigationClick(event, body, slideNavigation, () => {
              isNavigating = false;
            });
          }
        });
      });
    }, 150);
  });
};

const setSlideBackgrounds = (slides) => {
  slides.forEach((slide) => {
    const thisBcg = slide.getAttribute('data-bcg');
    const thisBcgBackground = slide.querySelector('.slide__background');
    const thisBcgBackground2 = slide.querySelector('.slide__background_2');
    thisBcgBackground.style.backgroundImage = `url(${thisBcg})`;
    thisBcgBackground2.style.backgroundImage = `url(${thisBcg})`;
  });
};

const fadeInActiveSlide = (slide, body, onCompleteCallback) => {
  const tl = gsap.timeline({
    onComplete: onCompleteCallback // Add onComplete callback to the timeline
  });
  tl.set(slide, { autoAlpha: 1 })
    .set(slide.querySelector('.slide__background'), { autoAlpha: 1, y: '0%' })
    .set(slide.querySelector('.slide__background_2'), { autoAlpha: 1, y: '0%' })
    .set(body, { className: '-=is-loading' });
};

const handleNavigationClick = (event, body, slideNavigation, callback) => {
  const sectionFrom = document.querySelector('.slide.is-active');
  const sectionFromId = sectionFrom.getAttribute('id');
  const sectionToId = event.target.getAttribute('href');
  const sectionTo = document.querySelector(sectionToId);

  if (sectionFromId !== sectionToId && sectionTo !== null) {
    // Set isAnimating to true to disable clicks
    isAnimating = true;
    scrollToSection(sectionFrom, sectionTo, body, slideNavigation, () => {
      // Callback to set isAnimating to false after the animation is complete
      isAnimating = false;
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  }
};

const scrollToSection = (sectionFrom, sectionTo, body, slideNavigation, callback) => {
  // Check if sectionTo is null
  if (!sectionTo) {
    return;
  }

  // Scroll animation details
  const background = sectionTo.querySelector('.slide__background');
  const backgroundFrom = sectionFrom.querySelector('.slide__background');
  const background2 = sectionTo.querySelector('.slide__background_2');
  const background2From = sectionFrom.querySelector('.slide__background_2');
  const bcgTo = sectionTo.getAttribute('data-color');
  const tlScroll = gsap.timeline({
    onComplete: () => {
      setActiveSection(sectionFrom, sectionTo, slideNavigation);
      if (callback && typeof callback === 'function') {
        callback();
      }
    }
  });

  tlScroll
    .set(body, { className: '+=is-animating' })
    .set(sectionTo, { autoAlpha: 1 })
    .to(sectionFrom, 1.5, { autoAlpha: 0, ease: 'expo.inOut' }, '0')
    .to(sectionTo, 1.5, { autoAlpha: 1, ease: 'expo.inOut' }, '0')
    .to(backgroundFrom, 1.5, { autoAlpha: 1, y: '200%', skewY: 25, ease: 'expo.inOut', clearProps: 'y' }, '0')
    .fromTo(background, 1.5, { autoAlpha: 0, y: '-100%', skewY: -25 }, { autoAlpha: 1, skewY: 0, y: '0%', ease: 'expo.inOut' }, '0')
    .to(background2From, 1.5, { autoAlpha: 1, y: '-200%', skewY: 25, ease: 'expo.inOut', clearProps: 'y' }, '0')
    .fromTo(background2, 1.5, { autoAlpha: 0, y: '100%', skewY: -25 }, { autoAlpha: 1, skewY: 0, y: '0%', ease: 'expo.inOut' }, '0')
    .to(body, 1.5, { backgroundColor: bcgTo, ease: 'expo.inOut' }, '0')
    .set(body, { className: '-=is-animating' });
};

const setActiveSection = (sectionFrom, sectionTo, slideNavigation) => {
  const sectionToId = sectionTo.getAttribute('id');
  sectionFrom.classList.remove('is-active');
  sectionTo.classList.add('is-active');
  highlightNavigation(sectionToId, slideNavigation);
};

const highlightNavigation = (sectionToId, slideNavigation) => {
  const currentSlideIndex = parseInt(sectionToId.slice(-2)) - 1;

  slideNavigation.querySelectorAll('.main-nav__link').forEach((navLink) => {
    navLink.classList.remove('is-active');
    navLink.parentNode.classList.remove('is-active');
  });

  const activeNavLink = slideNavigation.querySelector(`.main-nav__link[data-id="${currentSlideIndex}"]`);
  activeNavLink.classList.add('is-active');
  activeNavLink.parentNode.classList.add('is-active');

  const activeNavLinkCloned = slideNavigation.querySelector(`.cloned .main-nav__link[data-id="${currentSlideIndex}"]`);
  activeNavLinkCloned.classList.add('is-active');
  activeNavLinkCloned.parentNode.classList.add('is-active');
};

const setupInfiniteScrolling = (selector, isAnimating) => {
  const r = 100;
  const adjustJank = 0;

  const createClonedObject = (obj) => {
    const clonedObj = obj.cloneNode(true);
    clonedObj.classList.add('cloned');
    obj.parentNode.appendChild(clonedObj);
    obj.parentNode.parentNode.style.width = obj.offsetWidth + 'px';
  };

  const createScrollingTimeline = (obj) => {
    const t = obj.offsetWidth / r / 3;
    const timeline = gsap.timeline();

    timeline.to(obj.parentNode, t, { x: `-${obj.offsetWidth + adjustJank}`, ease: 'linear', repeat: -1 });

    return timeline;
  };

  const scrollingTimelines = [];

  document.querySelectorAll(selector).forEach((obj) => {
    createClonedObject(obj);
    scrollingTimelines.push(createScrollingTimeline(obj));
  });

  document.querySelectorAll('.slides-navigation span').forEach((span) => {
    span.addEventListener('mouseenter', () => {
      scrollingTimelines.forEach((timeline) => {
        timeline.play().timeScale(0.25);
      });
    });
    span.addEventListener('mouseleave', () => {
      if (!isAnimating) {
        scrollingTimelines.forEach((timeline) => {
          timeline.play().timeScale(1);
        });
      }
    });
  });
};

// Initialize the slider
initSlider();

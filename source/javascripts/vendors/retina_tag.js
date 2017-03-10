var RetinaTag = RetinaTag || {};

RetinaTag.init = function() {
  window.matchMedia('(-webkit-device-pixel-ratio:1)').addListener(RetinaTag.updateImages);
  document.addEventListener("page:load", RetinaTag.updateImages);
  document.addEventListener("turbolinks:load", RetinaTag.updateImages);
  document.addEventListener("retina_tag:refresh", RetinaTag.updateImages);
};

RetinaTag.updateImages = function() {
  var images = document.getElementsByTagName('img');
  for(var counter=0; counter < images.length; counter++) {
    if(!images[counter].getAttribute('data-lazy-load')) {
      RetinaTag.refreshImage(images[counter]);
    }
  }
};

RetinaTag.refreshImage = function(image) {
  var lazyLoad  = image.getAttribute('data-lazy-load');
  var imageSrc  = image.src;
  var hiDpiSrc  = image.getAttribute('data-hidpi-src');
  var lowDpiSrc = image.getAttribute('data-lowdpi-src');
  if(!hiDpiSrc) {
    return;
  }
  if(lazyLoad)
  {
    image.removeAttribute('data-lazy-load');
  }
  if(window.devicePixelRatio > 1 && imageSrc != hiDpiSrc) {
    if(!lowDpiSrc) {
      image.setAttribute('data-lowdpi-src',imageSrc);
    }
    image.src = hiDpiSrc;
  }
  else if((!window.devicePixelRatio || window.devicePixelRatio <= 1) && (imageSrc == hiDpiSrc || (lowDpiSrc && imageSrc != lowDpiSrc))) {
    image.src = lowDpiSrc;
  }
};
if(window.devicePixelRatio !== undefined) {
  RetinaTag.init();
  $(document).ready(RetinaTag.updateImages);
}

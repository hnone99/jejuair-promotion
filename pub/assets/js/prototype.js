"use strict";

/* eslint-disable */
(function () {
  // new Swiper('.prototype__carousel', {
  //   slidesPerView: 'auto',
  // });
  var fullItem = new Swiper('.prototype__carousel', {});
  var mainItem = new Swiper('.prototype__sty1 .carousel', {
    slidesPerView: 'auto',
    spaceBetween: 12
  });
  var subItem = new Swiper('.carousel-wrapper', {
    slidesPerView: 'auto',
    spaceBetween: 12
  });
  var centerItem = new Swiper('.prototype__main-swiper', {
    slidesPerView: 'auto',
    spaceBetween: 12,
    centeredSlides: true
  });
  var circleItem = new Swiper('.prototype__circle-swiper', {
    slidesPerView: 1.3,
    spaceBetween: 0,
    centeredSlides: true,
    initialSlide: 1
  });
  var scroller = new Swiper('.scroller', {
    slidesPerView: 'auto' // spaceBetween: 40,
    // centeredSlides: true,

  });
  $('.tab').on('click', '.hide-button', function (e) {
    var $target = $(e.target);
    $target.closest('.tab__panel').toggleClass('active');
  });
  $('.prototype__datepicker').on('click', '.datepicker__calendar', function (e) {
    var $target = $(e.target);
    $target.closest('.datepicker__calendar').toggleClass('active');
  });
  $('.member__desc').on('click', '.action', function (e) {
    var $target = $(e.target);
    var $parent = $target.closest('.member__change');

    if ($target.hasClass('plus')) {
      if ($parent.hasClass('m01')) {
        $parent.addClass('m02').removeClass('m01');
      } else {
        $parent.addClass('m03').removeClass('m02');
      }
    } else {
      if ($parent.hasClass('m03')) {
        $parent.addClass('m02').removeClass('m03');
      } else {
        $parent.addClass('m01').removeClass('m02');
      }
    }
  });
  $('.trip__item .item').on('click', '.item-button', function (e) {
    var $target = $(e.target);
    var $parent = $target.closest('.item');
    var template = "<div class=\"bottom\">\n      <div class=\"select-flight\">\n        <div class=\"swiper-wrapper\">\n          <div class=\"swiper-slide item\">\n            <button type=\"button\" class=\"fly is-active\">\n              <img src=\"../../assets/images/prototype/@fly01.png\" alt=\"\">\n            </button>\n          </div>\n          <div class=\"swiper-slide item\">\n            <button type=\"button\" class=\"fly\">\n              <img src=\"../../assets/images/prototype/@fly02.png\" alt=\"\">\n            </button>\n          </div>\n          <div class=\"swiper-slide item\">\n            <button type=\"button\" class=\"fly\">\n              <img src=\"../../assets/images/prototype/@fly03.png\" alt=\"\">\n            </button>\n          </div>\n        </div>\n      </div>\n      <div class=\"bottom-button\">\n        <img src=\"../../assets/images/prototype/@text-link.png\" alt=\"\">\n      </div>\n    </div>";
    $parent.toggleClass('expend');

    if ($parent.hasClass('expend')) {
      $parent.append(template);
      var wrap = $parent.find('.select-flight')[0];
      var fly = new Swiper(wrap, {
        slidesPerView: 'auto'
      });
      $parent.siblings('.item').removeClass('expend').find('.bottom').remove();
    } else {
      $parent.find('.bottom').remove();
    }
  });
  $('.trip__item').on('click', '.fly', function (e) {
    var $target = $(e.target);
    $target.closest('.fly').addClass('is-active');
    $target.closest('.expend').addClass('selected').siblings('.selected').removeClass('selected');
    $target.closest('.expend').removeClass('expend').find('.bottom').remove();
    $('body').addClass('is-modal');
  });
  $('.trip__round').on('click', '.round', function (e) {
    var $target = $(e.target);
    var $parent = $target.closest('.trip__round');
    $parent.toggleClass('expend');
  });
  $('.select-buldle').on('click', 'button', function (e) {
    var $target = $(e.target);
    var $parent = $target.closest('.item');
    $parent.addClass('active').siblings('.active').removeClass('active');
  });
  var layerCarousel = new Swiper('.select-buldle', {
    slidesPerView: 'auto',
    spaceBetween: -20,
    initialSlide: 1,
    centeredSlides: true
  });
  var layerCarousel2 = new Swiper('.prototype__swiper01', {
    slidesPerView: 'auto' // spaceBetween: 20,

  });
  $('.layer__close, [data-close]').on('click', function (e) {
    $('body').removeClass('is-modal');
    $('.trip__title').addClass('selected').find('img').attr({
      src: '../../assets/images/prototype/@booking-title2.png'
    });
    $('[href="./step13.html"]').find('img').attr({
      src: '../../assets/images/prototype/@service7.png'
    });
    $('.prototype__sticky01').show();

    if ($('.prototype__sticky01').data('type') === 'come') {
      $('.prototype__sticky01').find('img').attr({
        src: '../../assets/images/prototype/@button10.png'
      });
    }
  });
  $('[data-layer]').on('click', 'a', function (e) {
    e.preventDefault();
    var $target = $(e.target).is('button') || $(e.target).closest('a');
    $('body').addClass('is-modal');
  });
  $('.prototype__sheet').on('click', 'button', function (e) {
    var $target = $(e.target).is('button') || $(e.target).closest('button');
    e.preventDefault();
    $target.toggleClass('choise');

    if ($target.hasClass('choise')) {
      $target.find('img').attr('src', '../../assets/images/prototype/@choiseSheet01.png');
      $('.prototype__sheet-top').removeClass('choise');
      $('.prototype__sticky01').hide();
    } else {
      $target.find('img').attr('src', '../../assets/images/prototype/@choiseSheet02.png');
      toast.init({
        text: '나머지 승객의 좌석을 자동으로 배치해 드렸어요.',
        width: 320,
        delay: 1000,
        distance: 160
      });
      $('.prototype__sheet-top').addClass('choise');
      $('.prototype__sticky01').show();
    }
  }); // $('.prototype__booking').on('click', '.booking-button', (e) => {
  //   e.preventDefault();
  //   const $target = $(e.target);
  //   $target.closest('.prototype__booking').toggleClass('step');
  // });

  $('.prototype__map').on('click', '.map', function (e) {
    var $target = $(e.target);

    if (!$target.closest('.prototype__map').hasClass('change')) {
      e.preventDefault();
      $target.closest('.prototype__map').toggleClass('change');
    }
  });
  $('.is-pc').on('click', '.img-button', function (e) {
    e.preventDefault();
    $('.pc.layer').addClass('show');
  });
  $('.pc.layer').on('click', '.layer__img', function (e) {
    e.preventDefault();
    $('.pc.layer').removeClass('show');
  });
})();
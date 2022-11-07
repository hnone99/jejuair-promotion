/* 룰렛 이벤트 */
/* https://codepen.io/pong777/pen/zVvjjg */
$(document).ready(function () {
  var gift;
  console.log("아이템 갯수 : " + $('.roulette').attr('data-roulette-length'));
  var itemLength = $('.roulette').attr('data-roulette-length'); //상품 갯수
  var rotationPos = new Array();
  var rotationPosGap = 360 / itemLength;
  var loop = 0;

  for (i = 0; i <= 360; i = i + rotationPosGap) {
    rotationPos[loop] = i;
    loop++;
  }

  for (i = 0; i < itemLength; i++) {
    var pictures = "../../assets/images/event/roulette-item-" + (i + 1) + ".svg";
    $(".roulette-board").append('<img src="' + pictures + '" style="transform: rotate(' + rotationPos[i] + 'deg)" />');
  }
  //폭탄 이미지에는 .bomb 추가
  $('img:nth-child(3)').addClass('bomb');

  iniGame = function (num) {
    gift = num;
    console.log(rotationPos[gift]);
    TweenLite.killTweensOf($(".roulette-board"));
    TweenLite.to($(".roulette-board"), 0, {
      css: {
        rotation: 360 - rotationPos[gift]
      }
    });
    TweenLite.from($(".roulette-board"), 5, {
      css: {
        rotation: -3000
      },
      onComplete: endGame,
      ease: Sine.easeOut
    });
    console.log("당첨된 아이템 : " + (gift + 1) + "번, rotationPos : " + rotationPos);
  };

  function endGame() {
    var copImg = "../images/event/roulette-item-" + (gift + 1) + ".svg";
    console.log("당첨된 아이템 이미지 : " + copImg);
    alert("당첨된 아이템 : " + (gift + 1) + "번");
    if (gift === 2) { //꽝일 경우
      $('.bomb').addClass('active');
    }
    $('.roulette').attr('data-roulette-ended', true); //애니메이션 끝난 후 돌림판 색칠
    $('.roulette-start').attr('disabled', true); //START 비활성
    $('.button--roulette').removeClass('no-show'); //한번더 버튼 show
    $('.button--roulette').addClass('button--active'); //한번더 버튼 색상 활성화
    $('.button--roulette').attr('disabled', false); //한번더 버튼 enable
  }

  var clicked = 0;
  $(".roulette-start").on("mousedown", function (e) {
    iniGame(Math.floor(Math.random() * itemLength));
    /* if (clicked <= 0) {
      iniGame(Math.floor(Math.random() * itemLength));
    } else if (clicked >= 1) {
      e.preventDefault();
      console.log("이벤트 참여 하셨습니다.");
    }
    clicked++; */
  });

  //한번더 버튼 클릭
  $('.button--roulette').on('click', function (e) {
    $('.roulette').attr('data-roulette-ended', false); //돌림판 색칠 삭제
    $('.roulette-start').attr('disabled', false); //START 활성
    $('.roulette-board').removeAttr('style'); //돌림판 재정렬
    $('.bomb').removeClass('active'); //폭탄 이미지 리셋
  })
});

/* 복권 이벤트 */
// https://github.com/RyuJun/lotteryScratch.js
var lotteryScratch = (function () {
  /**
    * _lotteryScratch : function
    * @param element : 해당 Element.
    * @param width : 그려질 cnavas의 가로사이즈.
    * @param height : 그려질 cnavas의 세로사이즈.
    * @param circleRadius : 원의 크기만큼 지워진다.
    * @param topImageSrc : 덮어서 마우스 드래그 시 지워질 이미지의 주소.
  */
  var _lotteryScratch = function (element, width, height, circleRadius, topImageSrc) {
    this.lotteryScratchElement = element;
    this.lotteryScratchWidth = width;
    this.lotteryScratchHeight = height;
    this.circleRadius = circleRadius;
    this.lotteryScratchStatus = false;
    this.lotteryScratchTopImageSrc = topImageSrc;
    this.userAgentMobileCheck = this._checkSupportUserAgent;
    this.callback = null;
    this._checkSupportLotteryScratch = this._checkSupportLotteryScratch();
  };

  _lotteryScratch.prototype = {
    constructor: 'lotteryScratch',
    /**
      * _checkSupportUserAgent : function
      * user가 접속한 기기가 pc인지 mobile인지 판단해준다.
      * pc면 false, mobile이면 true
    */
    _checkSupportUserAgent: function () {
      var filter = 'win16|win32|win64|mac|macintel';
      if (navigator.platform) return filter.indexOf(navigator.platform.toLowerCase()) < 0 ? true : false;
    },
    /**
      * _checkSupportLotteryScratch : function
      * Element에는 id가 필수로 존재하여야 한다.
      * id가 없으면 진행하지않음.
    */
    _checkSupportLotteryScratch: function () {
      return (function (element) {
        return element.getAttribute('id') ? true : false;
      })(this.lotteryScratchElement);
    },


    /**
      * _cutCircle : function
      * canvas에 마우스 드래그 evnet발생시 실행되는 함수
      * circle형태로 이미지를 지워나간다.
      * @param context : cavans.getContext(2d); 값.
      * @param pointX : 현재 마우스의 X 좌표 값.
      * @param pointY : 현재 마우스의 Y 좌표 값.
      * @param radius : 원의 크기 값 (클수록 크게 지워짐).
    */
    _cutCircle: function (context, pointX, pointY, radius) {
      context.globalCompositeOperation = 'destination-out';
      context.beginPath();
      context.arc(pointX, pointY, radius, 0, Math.PI * 2, true);
      context.fill();
    },


    /**
     * LotteryScratchReadyAlert : function
     * 바로 canvas를 드래그하는 경우를 막을 때 사용됨,
     * ex) 긁기 start버튼을 클릭하지 않고 바로 드래그 시 alert뿜음
     * @param message : alert창에 입력될 message
     */
    LotteryScratchReadyAlert: function (message) {
      if (!this.lotteryScratchStatus) alert(message);
    },


    /**
     * LotteryScratchClear : function
     * LotteryScratch의 리셋을 위한 함수
     * ex) 버튼을 누를때마다 해당 함수를 호출하면 현재 진행중인 canvas를 리셋 시킴
     */
    LotteryScratchClear: function () {
      this.lotteryScratchElement.parentNode.style = 'none';
      this.lotteryScratchElement = this.lotteryScratchElement.parentNode;
      this.lotteryScratchElement.removeChild(this.lotteryScratchElement.childNodes[0]);
      this.LotteryScratchInit();
      return this;
    },


    /**
      * LotteryScratchInit : function
      * 기본 크기 및 canvas Element를 생성함 Canvas를 imgCnavas로 변경
    */
    LotteryScratchInit: function () {
      if (this._checkSupportLotteryScratch) {
        var canvas = document.createElement('canvas'); // canvas init
        var imageContext = canvas.getContext('2d'); // canvas.getContext('2d') for image
        var topImage = new Image(); // new image
        this.lotteryScratchElement.style.width = this.lotteryScratchWidth + "px";
        this.lotteryScratchElement.style.height = this.lotteryScratchHeight + "px";
        //this.lotteryScratchElement.onmouseover = function () { canvas.style.cursor = 'crosshair' };
        canvas.width = this.lotteryScratchWidth; // canvas image width
        canvas.height = this.lotteryScratchHeight; // canvas image height
        this.lotteryScratchElement.appendChild(canvas); // canvas append
        this.lotteryScratchElement = canvas;
        topImage.onload = function () {
          imageContext.drawImage(topImage, 0, 0);
        };
        topImage.src = this.lotteryScratchTopImageSrc;
        document.querySelector('.back-item').classList.add('active');
      }
      return this;
    },


    /**
     * LotteryScratch : function
     * 해당 Element의 id가 존재할 때 넘어온 param값에 따라 cavnas image 만들기 및 값을 세팅한다.
     * 마우스 down, up, move 이벤트를 통해 드래그와 같은 동작 event가 발생하며
     * _cutCircle 함수를 호출하여 이미지를 삭제시킨다.
     * _checkSupportUserAgent() 함수를 통해 모바일 인지를 체크하며,
     * mobile에서는 mousedown, mousemove, mouseup event가
     * touchstart, touchmove, touchend event로 변경된다.
     * 또한 e.pageX||Y 를 통하여 얻어오던 좌표값은
     * e.changedTouches[0].clientX||Y를 통해 얻어온다.
     * 배열인 이유는 멀티터치를 지원하기위한것으로 확인된다.
     */
    LotteryScratch: function () {
      if (this._checkSupportLotteryScratch) {
        if (!this._checkSupportUserAgent()) { // pc일 경우
          this.lotteryScratchElement.onmousedown = (function (e) {
            var canvas = this.lotteryScratchElement;
            var radius = this.circleRadius;
            var cutCircle = this._cutCircle;
            this.callback !== null ? this.callback() : null;
            this.callback = null;
            var deleteMoveAction = function (e) {
              var rect = canvas.getBoundingClientRect(),
                context = canvas.getContext("2d"),
                scrollPosition = window.scrollY || document.documentElement.scrollTop,
                pointX = Math.round(e.pageX - rect.left),
                pointY = Math.round(e.pageY - rect.top - scrollPosition);
              cutCircle(context, pointX, pointY, radius);
            }
            document.addEventListener('mousemove', deleteMoveAction);
            document.onmouseup = function () {
              document.removeEventListener('mousemove', deleteMoveAction);
            };
          }).bind(this);
        } else { // mobile일 경우
          this.lotteryScratchElement.ontouchstart = (function (e) {
            e.preventDefault();
            var canvas = this.lotteryScratchElement;
            var radius = this.circleRadius;
            var cutCircle = this._cutCircle;
            this.callback !== null ? this.callback() : null;
            this.callback = null;
            var deleteMoveAction = function (e) {
              var rect = canvas.getBoundingClientRect(),
                context = canvas.getContext("2d"),
                scrollPosition = window.scrollY || document.documentElement.scrollTop,
                pointX = Math.round(e.changedTouches[0].clientX - rect.left),
                pointY = Math.round(e.changedTouches[0].clientY - rect.top - scrollPosition);
              cutCircle(context, pointX, pointY, radius);
            }
            document.addEventListener('touchmove', deleteMoveAction);
            document.ontouchend = function () {
              document.removeEventListener('touchmove', deleteMoveAction);
            };
          }).bind(this);
        }
        this.lotteryScratchStatus = true;
      }
      return this;
    },


    /**
     * LotteryScratchCallback : function
     * callback으로 들어온 함수를 this.callback에 저장 한 뒤 LotteryScratch 함수에서 실행
     */
    LotteryScratchCallback: function (callbackFunction) {
      this.callback = callbackFunction;
      return this;
    }
  }
  return _lotteryScratch;
})();


window.addEventListener('load', function () {
  var canvasWidth = document.querySelector('#lotteryScratch').offsetWidth;
  var canvasHeight = document.querySelector('#lotteryScratch').offsetHeight;

  var myScratch = new lotteryScratch(
    document.querySelector('#lotteryScratch'), canvasWidth, canvasHeight, 25,
    '../../assets/images/event/scratch.png',
  );

  myScratch
    .LotteryScratchInit()
    .LotteryScratchCallback(function () {
      //document.querySelector('.back-item').classList.add('active');
    }).LotteryScratch();
});
/* //복권 이벤트 */

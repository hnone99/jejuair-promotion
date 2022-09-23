$(document).ready(function() {
	/*항공권 운임 규정 동의*/
	$(document).on('click', '#fareRule', function() {		
		openModal("#fareRuleModalLayer", "full");
	});
	
	$(document).on('click', '#inpAgree-01', function() {		
		var checkProp = $(this).prop('checked');
       	if (checkProp) {
        	$(this).prop('checked', false);
         	openModal("#fareRuleModalLayer", "full");
       	}
	});

	/* 예약취소 유의사항 동의 */
	$(document).on('click', '#resCancelInfo', function() {
		openModal("#resCancelInfoModalLayer", "full");
	});
	
	$(document).on('click', '#inpAgree-02', function() {		
		var checkProp = $(this).prop('checked');
       	if (checkProp) {
        	$(this).prop('checked', false);
         	openModal("#resCancelInfoModalLayer", "full");
       	}
	});
	
	/* 여행보험 환불 규정 동의 */
	$(document).on('click', '#travalRefundInfo', function() {
		openModal("#travalRefundInfoModalLayer", "full");
	});
	
	$(document).on('click', '#inpAgree-03', function() {		
		var checkProp = $(this).prop('checked');
       	if (checkProp) {
        	$(this).prop('checked', false);
         	openModal("#travalRefundInfoModalLayer", "full");
       	}
	});
	
	/* 부가서비스 환불 규정 동의 */
	$(document).on('click', '#serviceInfo', function() {
		openModal("#serviceInfoModalLayer", "full");
	});
	
	$(document).on('click', '#inpAgree-04', function() {		
		var checkProp = $(this).prop('checked');
       	if (checkProp) {
        	$(this).prop('checked', false);
         	openModal("#serviceInfoModalLayer", "full");
       	}
	});
	
	$("[name=btnApplyCancel]").attr("disabled", true);
	//<%-- 약관 및 규정 동의 체크박스 체크 및 해제 --%>
	$(document).on('click', 'input[type="checkbox"][id^="inpAgree"]', function() {
		const _this = $(this).attr('id');
		let isNotChecked = false;
		let arrCheckPick = [];
		
		if (_this === 'inpAgreeAll') { // 전체동의 버튼
			if ($(this).is(':checked')) {
				$("[name=btnApplyCancel]").attr("disabled", false);
				$('[name=btnApplyCancel]').addClass('button--active'); // 다음 버튼 활성화
			} else {
				$("[name=btnApplyCancel]").attr("disabled", true);
				$('[name=btnApplyCancel]').removeClass('button--active');
			}
			
			$('input[type="checkbox"][id^="inpAgree-"]').each(function() { // 전체동의 버튼 클릭 시 나머지 비활성화 (IE, Chrome간 다른 전체동의 기능 보완)  
				if ($(this).is(':checked')) {
					arrCheckPick.push($(this).attr('id'));
				}
				$(this).prop('checked', false);
			});
			
			
		} else {
			$('input[type="checkbox"][id^="inpAgree-"]').each(function() { // 나머지 버튼 전부 클릭이면 다음버튼 활성화
				if (!$(this).is(':checked')) {
					isNotChecked = true;
				}
			});
			
			if (!isNotChecked) {
				$("[name=btnApplyCancel]").attr("disabled", false);
				$('[name=btnApplyCancel]').addClass('button--active');
			} else {
				$("[name=btnApplyCancel]").attr("disabled", true);
				$('[name=btnApplyCancel]').removeClass('button--active');
			}
			
			$("#inpAgreeAll").prop('checked', false); // 팝업을 통해 동의버튼을 누르는 checkbox는 우선 전체동의 비활성화 (IE, Chrome간 다른 전체동의 기능 보완)
		}
	});
	
	// 팝업 내의 동의 버튼 클릭
	$(document).on('click', 'button[id^=btnAgree]', function() {
		const number = $(this).attr('id').substr(8, 2);
		$('input[type="checkbox"][id="inpAgree-' + number + '"]')[0].checked = true;
		checkAll();
		
		$.modal.close();
	});
	
	// 팝업없는 동의 버튼 클릭
	$(document).on('click', '#inpAgree-05, #inpAgree-06, #inpAgree-07, #inpAgree-08', function() {
		checkAll();
		$.modal.close();
	});
	
	const checkAll = function() {
		let flag = true;
		$('input[type="checkbox"][id^="inpAgree-"]').each(function(index, item) {
			flag = flag && item.checked;
		});
		if (flag) {
			$('.agree-wrap .checkbox__input').prop('checked', true);
			$("[name=btnApplyCancel]").attr("disabled", false);
			$('[name=btnApplyCancel]').addClass('button--active');
		}
	}
	
  // 약관 및 규정 동의
  $.fn.checkAgree = function (agreeData) {
  	 var agreeData = agreeData; // 약관 및 규정 동의 내용들
     var chkAgrWrap = this; 
     var checkAllBtn = chkAgrWrap.find('#inpAgreeAll'); // 전체동의 버튼
     var checkBtn = chkAgrWrap.find('.agree-wrap__item .item-inner'); // 각 체크버튼
     // var checkkItemLeng = $('.agree-wrap__item').length; // 각 동의 영역 개수
	 var checkkItemLeng = agreeData.length;
     var agreeViewBtn = $('.agree-wrap__button'); // 각 동의 버튼
     var allAgree = $('.js-check-all'); // 모두동의 영역
     var title = $('#allAgreeModalLayer .modal-header__title'); // 타이틀
     var content = $('#allAgreeModalLayer .modal-content'); // 내용
     var modalCheckAll = $('.js-check-all'); // 모두동의
     var prevBtn = $('#allAgreeModalLayer .agree-prev'); // 이전
     var nextBtn = $('#allAgreeModalLayer .agree-next'); // 다음
	
	// 전체동의 버튼
    checkAllBtn.on('click', function () {
        var checkProp = $(this).prop('checked');
       	if (checkProp) {
        	$(this).prop('checked', false);  
         	openAgree ('all');
       	}
    });

	// 팝업 모두동의 버튼
    allAgree.on('click', function () {
      var checkBtn = chkAgrWrap.find('.agree-wrap__item .checkbox__input');
    });
	// 모두 동의 버튼
    modalCheckAll.on('click', function () {
      $('.agree-wrap .checkbox__input').prop('checked', true);
	  $("[name=btnApplyCancel]").attr("disabled", false);
	  $("[name=btnApplyCancel]").addClass('button--active');
      //$('.modal__close').click();
	  $.modal.close();
    });

    function openAgree (index) {
   		var index = index;
   		if (index == 'all') {
      		title.html(agreeData[0].title);
      		content.html(agreeData[0].content);
      		modalCheckAll.show();
      		prevBtn.show();
      		nextBtn.show();
      		chkAgrWrap.attr('data-agree', 1)
   		}
   		//$('.open-modal').click();
		openModal("#allAgreeModalLayer", "full");
       	afterInnerHtml ()
    }
	// 이전 버튼
    prevBtn.on('click', function () {
       var current = chkAgrWrap.attr('data-agree');
       var newIdx = current - 1;
       if (newIdx === 0) {
         title.html(agreeData[checkkItemLeng - 1].title);
         content.html(agreeData[checkkItemLeng - 1].content);
         chkAgrWrap.attr('data-agree', checkkItemLeng);
       } else {
         title.html(agreeData[newIdx - 1].title);
         content.html(agreeData[newIdx - 1].content);
         chkAgrWrap.attr('data-agree', newIdx);
       }
       afterInnerHtml ()
    })
	// 다음 버튼
    nextBtn.on('click', function () {
      var current = parseInt(chkAgrWrap.attr('data-agree'));
      var newIdx = current + 1;
      if (newIdx - 1 === checkkItemLeng) {
        title.html(agreeData[0].title);
        content.html(agreeData[0].content);
        chkAgrWrap.attr('data-agree', 1);
      } else {
        title.html(agreeData[newIdx - 1].title);
        content.html(agreeData[newIdx - 1].content);
        chkAgrWrap.attr('data-agree', newIdx);
      }
      afterInnerHtml ()
    });
	
    function afterInnerHtml () {
		$('[data-element="tab"]').tab();
		$('[data-element="accordion"]').accordion();
    }

  }

});	// ready

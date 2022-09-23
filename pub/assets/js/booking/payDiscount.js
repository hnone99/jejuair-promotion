$(document).ready(function() {
	/* 무이자 할부안내 */
	$(document).on('click', 'button[id^=interFreeInfo]', function() { 
		openModal("#interFreeInfoModalLayer", "full");
	});
	/* 제휴카드 안내 */
	$(document).on('click', 'button[id^=partnerCardInfo]', function() {
		openModal("#partnerCardInfoModalLayer", "full");
	});
	/* 간편결제 할인안내 */
	$(document).on('click', '#easyPayDiscount', function() {
		openModal("#easyPayDiscountModalLayer", "full");
	});
	/* 카드즉시 할인안내 */
	$(document).on('click', '#cardDiscount', function() {
		openModal("#cardDiscountModalLayer", "full");
	});
	/* 공항시설 사용료  */
	$(document).on('click', '#taxInfo', function() {
		openModal("#taxInfoModalLayer", "full");
	});
	
	if (easyPayMtxTt != null && easyPayMtxTt != "" && easyPayMtxTt != 'undefined' && easyPayMtxTt != undefined) {
		setEasyPayInfo(easyPayMtxTt);
	}
	
	if (cardDisMtxTt != null && cardDisMtxTt != "" && cardDisMtxTt != 'undefined' && cardDisMtxTt != undefined) {
		setCardDiscountInfo(cardDisMtxTt);
	}
	
});	// ready


/* 간편결제 안내 */
let easyPayObjHtml = '<tr><th scope="col" class="table-vertical__th bg__gray"></th></tr>';
easyPayObjHtml += '<tr><td class="table-vertical__td border__none align--left"><div class="table-flex-item"></div></td></tr>';

const setEasyPayInfo = function(easyPayMtxTt) {
	let easyPayObj = {};
	for (let i in easyPayMtxTt) {
		if (easyPayObj.hasOwnProperty(easyPayMtxTt[i]['CARD_NM'])) {
			easyPayObj[easyPayMtxTt[i]['CARD_NM']]['dcInfo'].push({ dcConditionCont: easyPayMtxTt[i]['DC_CONDITION_CONT'], dcAmtCont: easyPayMtxTt[i]['DC_AMT_CONT'] });
		} else {
			easyPayObj[easyPayMtxTt[i]['CARD_NM']] = {
				dcDate: dUtil.cvtDate(easyPayMtxTt[i]['DC_SDT'] ,"y.m.d") + ' ~ ' + dUtil.cvtDate(easyPayMtxTt[i]['DC_ENDT'] ,"y.m.d"),
				dcInfo: [{ dcConditionCont: easyPayMtxTt[i]['DC_CONDITION_CONT'], dcAmtCont: easyPayMtxTt[i]['DC_AMT_CONT'] }]
			};
		}
	}

	const easyPayKeyArr = Object.keys(easyPayObj);
	
	for (let i in easyPayKeyArr) {
		$("#easyPayDiscountModalLayer tbody.table-vertical__tbody")[0].innerHTML += easyPayObjHtml;
		$("#easyPayDiscountModalLayer tbody > tr > th.table-vertical__th.bg__gray").last()[0].innerHTML = '<div class="table-flex">' + easyPayKeyArr[i] + '<div class="table-flex__text date">' + easyPayObj[easyPayKeyArr[i]]['dcDate'] + '</div></div>';
		
		for (let j in easyPayObj[easyPayKeyArr[i]]['dcInfo']) {
			$("#easyPayDiscountModalLayer tbody > tr > td > div.table-flex-item").last()[0].innerHTML += '<div class="table-flex">' + easyPayObj[easyPayKeyArr[i]]['dcInfo'][j]['dcConditionCont'] + '<div class="table-flex__text text--bold">' + easyPayObj[easyPayKeyArr[i]]['dcInfo'][j]['dcAmtCont'] + '</div></div>';
		}
	}
}

/* 즉시할인 안내 */
let cardDiscountHtml = '<tr><th scope="col" class="table-vertical__th bg__gray"></th></tr>';
cardDiscountHtml += '<tr><td class="table-vertical__td border__none align--left"><div class="table-flex-item"></div></td></tr>';

const setCardDiscountInfo = function(cardDisMtxTt) {
	let cardDisObj = {};
	for (let i in cardDisMtxTt) {
		if (cardDisObj.hasOwnProperty(cardDisMtxTt[i]['CARD_NM'])) {
			cardDisObj[cardDisMtxTt[i]['CARD_NM']]['dcInfo'].push({ dcConditionCont: cardDisMtxTt[i]['DC_CONDITION_CONT'], dcAmtCont: cardDisMtxTt[i]['DC_AMT_CONT'] });
		} else {
			cardDisObj[cardDisMtxTt[i]['CARD_NM']] = {
				dcDate: dUtil.cvtDate(cardDisMtxTt[i]['DC_SDT'] ,"y.m.d") + ' ~ ' + dUtil.cvtDate(cardDisMtxTt[i]['DC_ENDT'] ,"y.m.d"),
				dcInfo: [{ dcConditionCont: cardDisMtxTt[i]['DC_CONDITION_CONT'], dcAmtCont: cardDisMtxTt[i]['DC_AMT_CONT'] }]
			};
		}
	}

	const cardDisKeyArr = Object.keys(cardDisObj);
	
	for (let i in cardDisKeyArr) {
		$("#cardDiscountModalLayer tbody.table-vertical__tbody")[0].innerHTML += cardDiscountHtml;
		$("#cardDiscountModalLayer tbody > tr > th.table-vertical__th.bg__gray").last()[0].innerHTML = '<div class="table-flex">' + cardDisKeyArr[i] + '<div class="table-flex__text date">' + cardDisObj[cardDisKeyArr[i]]['dcDate'] + '</div></div>';
		
		for (let j in cardDisObj[cardDisKeyArr[i]]['dcInfo']) {
			$("#cardDiscountModalLayer tbody > tr > td > div.table-flex-item").last()[0].innerHTML += '<div class="table-flex">' + cardDisObj[cardDisKeyArr[i]]['dcInfo'][j]['dcConditionCont'] + '<div class="table-flex__text text--bold">' + cardDisObj[cardDisKeyArr[i]]['dcInfo'][j]['dcAmtCont'] + '</div></div>';
		}
	}
}

/*공통*/
const openModal = function(mTarget, mType) {
	$("#btnModalOpen").data("target", mTarget);
	$("#btnModalOpen").data("modal-type", mType);
	$("#btnModalOpen").trigger("click");
};

$(document).on('click', 'button[id^=btnConfirm]', function() {
	$.modal.close();
});
$(document).on('click', '#taxButton', function() {
	$.modal.close();
});

patnerCardSwiper = new Swiper('#partnerCardInfoModalLayer .carousel--paypal', {
	slidesPerView : 'auto',
	centeredSlides : true,
	observer : true,
	spaceBetween : 16,
	observeParents : true,
	slideToClickedSlide : true,
	breakpoints : _defineProperty({}, MOBILE_WIDTH, {
		slidesPerView : 'auto',
		spaceBetween : 16,
		centeredSlides : true
	}),
	pagination : {
		el : '#partnerCardInfoModalLayer .carousel__pagination-number',
		type : 'fraction'
	},
	navigation : {
		nextEl : '#partnerCardInfoModalLayer .carousel__button-next',
		prevEl : '#partnerCardInfoModalLayer .carousel__button-prev'
	}
});

patnerCardSwiper.on('observerUpdate transitionEnd', function() {
	var cardData = $('#partnerCardInfoModalLayer .carousel--paypal-wrap .swiper-slide-active').data('card');
	var activeIdx = $('#partnerCardInfoModalLayer .carousel--paypal-wrap .swiper-slide-active').data('idx');
	
	if (cardData == 'credit') {
		$('#partnerCardInfoModalLayer .payment_card_wrap.fare-detail-jjpay').show();
		$('#partnerCardInfoModalLayer .pc-cash.fare-detail-jjpay').hide();
	} else if (cardData == 'bank') {
		$('#partnerCardInfoModalLayer .payment_card_wrap.fare-detail-jjpay').hide();
		$('#partnerCardInfoModalLayer .pc-cash.fare-detail-jjpay').show();
	} else {
		$('#partnerCardInfoModalLayer .payment_card_wrap.fare-detail-jjpay').hide();
		$('#partnerCardInfoModalLayer .pc-cash.fare-detail-jjpay').hide();
	}
	
	$('#partnerCardInfoModalLayer .container--small.pc-20 .inner-editor').hide();
	$('#partnerCardInfoModalLayer .container--small.pc-20 .inner-editor').eq(activeIdx).show();
});
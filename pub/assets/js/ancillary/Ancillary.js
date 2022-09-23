'use strict';
// 장바구니 삭제 버튼 클릭시 데이터 임시 저장 
let cartDeleteData = '';

// 구간 길이 만큼 탭 버튼 구성 
const makeJourneysTab = function() {
	let tabHTML = '';
	let tabContentHTML = '';
	let journeysName = '';
	let index = 0;
	for(let i = 0; i < journeysLength; i++) {
		if(i === 0) {
			journeysName = tripType === 'MT' ? BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00011").replace('{0}', '1') : BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00009"); //구간1 : 가는 편
		} else {
			journeysName = tripType === 'MT' ? BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00011").replace('{0}', '2') : BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00010"); //구간2 : 가는 편
		}
		const segmentsLen = journeys[i].segments.length;
		for(let j = 0; j < segmentsLen; j++) {
			let segmentsName = '';
			if(segmentsLen > 1) {
				if(j === 1) {
					if(journeys[i].segments[0].identifier.identifier === journeys[i].segments[1].identifier.identifier) {
						break;
					}
				}
				segmentsName = tripType === 'MT' ? journeysName + '(' + journeysName + (j + 1) + ')' : journeysName + (j + 1);
			}
			segmentsName = segmentsName !== '' ? segmentsName : journeysName;
			
			tabHTML += '<div class="tab__button" data-element="tab__list">';
			tabHTML += '	<button class="tab__anchor" type="button" data-element="tab__anchor">' + segmentsName + '</button>';
			tabHTML += '</div>';

			tabContentHTML += '<div id="divTabPanel' + index++ + '" data-element="tab__panel" class="tab__panel" role="tabpanel">';
			tabContentHTML += '		<div name="divCartMeal" class="section-wrap mt0" style="display: none">';
			tabContentHTML += '			<div class="section-title">' + BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00003") + '</div>'; //기내식
			tabContentHTML += '			<div name="divBagCartML" class="list-card list-card--basket list-card--basket--line list-card--baggage"></div>';
			tabContentHTML += '		</div>';
			tabContentHTML += '		<div name="divCartLounge" class="section-wrap mt0" style="display: none">';
			tabContentHTML += '			<div class="section-title">' + BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00004") + '</div>'; //JJ라운지
			tabContentHTML += '			<div name="divBagCartLG" class="list-card list-card--basket list-card--basket--line list-card--baggage"></div>';
			tabContentHTML += '		</div>';
			tabContentHTML += '		<div name="divCartInsu" class="section-wrap mt0" style="display: none">';
			tabContentHTML += '			<div class="section-title">' + BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00005") + '</div>'; //여행자 보험
			tabContentHTML += '			<div name="divBagCartIS" class="list-card list-card--basket list-card--basket--line list-card--baggage"></div>';
			tabContentHTML += '		</div>';
			tabContentHTML += '		<div name="divEmptied" class="finish-item-wrap finish-item-wrap--full">';
			tabContentHTML += '			<div class="finish-item">';
			tabContentHTML += '				<div class="finish-item__img">';
			tabContentHTML += '					<img src="../../../resources/images/icon/icon-nodata-03.png" alt="' + BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00001") + '">'; // 담은 상품이 없어요
			tabContentHTML += '				</div>';
			tabContentHTML += '				<p class="finish-item__title pc-size">' + BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00001") + '</p>'; //담은 상품이 없어요
			tabContentHTML += '				<p class="finish-item__text">' + BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00002") + '</p>'; //더 편한 비행을 위해 서비스를 담아보세요!
			tabContentHTML += '			</div>';
			tabContentHTML += '		</div>';
			tabContentHTML += '</div>';
		}
	}
	
	$('#divCartTab').append(tabHTML);
	$('#divTabContent').append(tabContentHTML);
	$('[data-element="tab"]').tab();
}

// 부가서비스 선택 정보 req 초기화
const ssrReqInit = function(ssrCurrencyCode) {
	let ssrReqObj = {};
	
	ssrReqObj.bookingKey = pnrData.bookingKey;
	ssrReqObj.inflType = inflType;
	ssrReqObj.payType = payType;
	if(ssrCurrencyCode === 'PNT') {
		ssrReqObj.currencyCode = ssrCurrencyCode;
	} else {
		ssrReqObj.currencyCode = payType === 'P' ? 'PNT' : pnrData.currencyCode;
	}
	
	ssrReqObj.market = [];
	
	let journeysSsr = [];
	for(let i = 0; i < journeysLength; i++) {
		const segments = journeys[i].segments;
		const segmentsLen = segments.length;
		if(segmentsLen > 1) {
			journeysSsr.push(true);
		} else {
			journeysSsr.push(false);
		}
		
		for(let j = 0; j < segmentsLen; j++) {
			let marketObj = {};
			marketObj.manualType = 'segment';
			marketObj.manualKey = segments[j].segmentKey;
			marketObj.items = [];
			
			for(let k = 0; k < paxInfoLength; k++) {
				let itemsObj = {};
				
				itemsObj.passengerKey = paxInfo[passengerObjKeyArr[k]].passengerKey;
				itemsObj.passengerName =  paxInfo[passengerObjKeyArr[k]].name.last + '/' +  paxInfo[passengerObjKeyArr[k]].name.first;
				itemsObj.ssrs = [];
				
				marketObj.items.push(itemsObj);
			}
			ssrReqObj.market.push(marketObj);
		}
	}
	
	for(let i = 0; i < journeysSsr.length; i++) {
		if(journeysSsr[i]) {
			let marketObj = {};
			marketObj.manualType = 'journey';
			marketObj.manualKey = journeys[i].journeyKey;
			marketObj.items = [];
			
			for(let k = 0; k < paxInfoLength; k++) {
				let itemsObj = {};
				
				itemsObj.passengerKey = paxInfo[passengerObjKeyArr[k]].passengerKey;
				itemsObj.passengerName =  paxInfo[passengerObjKeyArr[k]].name.last + '/' +  paxInfo[passengerObjKeyArr[k]].name.first;
				itemsObj.ssrs = [];
				
				marketObj.items.push(itemsObj);
			}
			ssrReqObj.market.push(marketObj);
		}
	}
	
	cartData.push(ssrReqObj);
	sessionStorage.setItem('cartData', JSON.stringify(cartData));
}

// 담은 상품 초기화 
const makePaxCart = function() {
	
	if(paxInfoLength === 1) {
		const paxObj = paxInfo[passengerObjKeyArr];
		const paxName = paxObj.name.last + '/' + paxObj.name.first;
		$('#hPassengerName').html(paxName);
		$('#hPassengerKey').html(paxObj.passengerKey);
		$('#btnBack').hide();
	} else {
		let cartHTML = '';
		for(let i = 0; i < paxInfoLength; i++) {
			cartHTML += '<div class="put-product__item">';
			cartHTML += '	<div class="put-product__text">';
			cartHTML += '		<p class="put-product__title">' + paxInfo[passengerObjKeyArr[i]].name.last + '/' + paxInfo[passengerObjKeyArr[i]].name.first + '</p>';
			cartHTML += '		<p name="passengerKey" style="display: none">' + paxInfo[passengerObjKeyArr[i]].passengerKey + '</p>';
			cartHTML += '		<button type="button" class="put-product__button">';
			cartHTML += '			<span class="put-product__button-text">' + BIZ_COMMONS_SCRIPT.getI18n("0000000360.msg00004").replace('{0}', 0) + '</span>'; //0개
			cartHTML += '		</button>';
			cartHTML += '	</div>';
			cartHTML += '	<div class="put-product__box">';
			cartHTML += '		<div class="put-product__box-img"></div>';
			cartHTML += '		<div class="put-product__box-img"></div>';
			cartHTML += '		<div class="put-product__box-img"></div>';
			cartHTML += '		<div class="put-product__box-img"></div>';
			cartHTML += '	</div>';
			cartHTML += '</div>';		
		}
		$('#divCartsBagList').append(cartHTML);
	}
}

// 승객 담은 상품 Layer 설정
const setCartLayer = function(cartHTML, categoryCode, sideMenuName, sideMenuCost, tabNo) {
	cartHTML += '			<button type="button" name="btnDelete" class="button button--small">';
	cartHTML += '				<span class="button__text">' + BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00007") + '</span>'; //삭제
	cartHTML += '			</button>';
	cartHTML += '		</div>';
	cartHTML += '	</div>';

	if(sideMenuName !== '') {
		cartHTML += '<div class="option m-15">';
        cartHTML += '	<p class="option-text">';
        cartHTML += '		<span class="option-text__desc">' + BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00008") + ' :</span>'; //옵션
        cartHTML += 		sideMenuName;
        cartHTML += '	</p>';

        cartHTML +=	'	<p class="sideMenuCost" style="display: none">' + sideMenuCost + '</p>';
        
        cartHTML += '</div>';
	}
	
	cartHTML += '</div>';

	const divTabPanel = $('#divTabPanel' + tabNo); 
	const divSsr = 'divBagCart' + categoryCode;

	divTabPanel.find('div[name=' + divSsr).append(cartHTML);

	if(divTabPanel.find('div[name=' + divSsr).parent().css('display') === 'none') {
		divTabPanel.find('div[name=' + divSsr).parent().show();
		divTabPanel.find('div[name=divEmptied]').hide();
	}

	let firstClass = false;
	const categoryLen = divTabPanel.children('div').length - 1;
	for(let j = 0; j < categoryLen; j++) {
		const titleFirst = divTabPanel.children().eq(j);
		if(firstClass) {
			titleFirst.removeClass('mt0');
		} else {
			if(titleFirst.css('display') !== 'none') {
				titleFirst.attr('class', 'section-wrap mt0');
				firstClass = true;
			}
		}
	}
}

// 승객 담은 상품 HTML
const makePaxCartData = function(ssrArr, tabNo) {
	let cartHTML = '';
	if(!['XB', 'SB'].includes(ssrArr.categoryCode)) {
		if($('.put-product__item').length === 0) {
			
			let cost = sUtil.getNumber(ssrArr.cost.replace(/[,]/g, ''));
			let sideMenuName = '';
			let sideMenuCost = 0;
			const sideMenuarrLength = ssrArr.sideMenuArr.length;
			for(let i = 0; i < sideMenuarrLength; i++) {
				sideMenuName += i === sideMenuarrLength -1 ? ssrArr.sideMenuArr[i].sideMenuName : ssrArr.sideMenuArr[i].sideMenuName + ', ';
				sideMenuCost += ssrArr.sideMenuArr[i].sideMenuCost;
			}
			cost += sideMenuCost;
			
			cartHTML = '<div class="list-card__item">';
			cartHTML += '	<span name="tabNo" style="display: none">' + tabNo + '</span>';
			cartHTML += '	<div class="list-card__item-inner">';
			cartHTML += '		<div class="list-card__image">';
			cartHTML += '			<img src=' + ssrArr.imgSrc + ' alt="">';
			cartHTML += '		</div>';
			cartHTML += '		<div class="list-card__info">';
			cartHTML += '			<strong class="list-card__title">' + ssrArr.ssrName + '</strong>';
			cartHTML += '			<span class="categoryCode" style="display: none">' + ssrArr.categoryCode + '</span>';
			cartHTML += '			<span class="ssrCode" style="display: none">' + ssrArr.ssrCode + '</span>';
			cartHTML += '			<p class="list-card__text">' + sUtil.FmtcurrencyCvt(I18N.language, ssrArr.currencyCode, cost) + '</p>';
			cartHTML += '		</div>';
			cartHTML += '		<div class="button-wrap">';
			
			setCartLayer(cartHTML, ssrArr.categoryCode, sideMenuName, sideMenuCost, tabNo);
		} else {
			
			const sideMenuArr = typeof(ssrArr.sideMenuArr) !== 'undefined' ? ssrArr.sideMenuArr : '';
			const sideMenuArrLength = sideMenuArr.length;
			
			let cost = typeof(ssrArr.cost) === 'string' ? sUtil.getNumber(ssrArr.cost.replace(/[,]/g, '')) : ssrArr.cost;
			let sideMenuCost = 0;
			for(let i = 0; i < sideMenuArrLength; i++) {
				sideMenuCost += sideMenuArr[i].sideMenuCost;
			}
			cost += sideMenuCost;
			
			cartHTML += '<img src=' + ssrArr.imgSrc + ' alt="">';
			cartHTML += '<span class="ssrName" style="display: none">' + ssrArr.ssrName + '</span>';
			cartHTML += '<span class="categoryCode" style="display: none">' + ssrArr.categoryCode + '</span>';
			cartHTML += '<span class="ssrCode" style="display: none">' + ssrArr.ssrCode + '</span>';
			cartHTML += '<span class="cost" style="display: none">' + cost + ' ' + ssrArr.currencyCode + '</span>';
			cartHTML += '<span class="tabNo" style="display: none">'+ ssrArr.tabNo + '</span>';
		
			if(sideMenuArrLength !== 0) {
				cartHTML += '	<span class="sideMenu" style="display: none">';
				for(let i = 0; i < sideMenuArrLength; i++) {
					cartHTML += i !== sideMenuArrLength - 1 ? sideMenuArr[i].sideMenuName + ', ' : sideMenuArr[i].sideMenuName;
				}
				cartHTML += '	</span>';
				cartHTML += '	<span class="sideMenuCost" style="display: none">' + sideMenuCost + '</span>';
			}
		}
	}
	
	return cartHTML;
}

// 바텀 시트 구성
const setBottomSheet = function() {
	
	let bottomSheetData = {
		fare: 0,
		tax: 0,
		fuelCharge: 0,
		discount: 0,
		promotion: 0,
		bundle: 0,
		pdumf: 0
	};

	let bundleHTML = '';

	for(let i = 0; i < journeysLength; i++) {
		const segments = journeys[i].segments;
		const segmentsLength = segments.length;
		for(let j = 0; j < segmentsLength; j++) {
			const passengerFares = segments[j].fares[0].passengerFares;
			const passengerFaresLength = passengerFares.length;

			for(let k = 0; k < passengerFaresLength; k++) {
				let count = 0;
				for(let z = 0; z < paxInfoLength; z++) {
					const discountCode = passengerFares[k].discountCode;
					const passengerType = passengerFares[k].passengerType;
					const paxDiscountCode = paxInfo[passengerObjKeyArr[z]].discountCode;
					let passengerTypeCode = paxInfo[passengerObjKeyArr[z]].passengerTypeCode;
					
					if(passengerType === 'INF' && typeof(paxInfo[passengerObjKeyArr[z]].infant) !== 'undefined') {
						passengerTypeCode = 'INF';
					}
					if(paxDiscountCode === discountCode && passengerTypeCode === passengerType) {
						count++;
					}
				}
			
				const serviceCharges = segments[j].fares[0].passengerFares[k].serviceCharges;
				const serviceChargesLength = serviceCharges.length;
	
				for(let z = 0 ; z < serviceChargesLength; z++) {
					const type = serviceCharges[z].type;
					const amount = serviceCharges[z].amount * count;
					const code = serviceCharges[z].code;
					
					switch(type) {
						case 'FarePrice' : bottomSheetData.fare += amount;
					   					   break;
						case 'TravelFee' : if(code.substring(0, 2) === 'YQ') {
										   	   bottomSheetData.fuelCharge += amount;
										   } else {
											   bottomSheetData.tax += amount;
										   }
										   break;
						case 'Discount'  : if(typeof(segments[j].fares[0].passengerFares[k].discountCode) !== 'undefined') {
										   	   if(typeof(code) !== 'undefined') {
											   	   bottomSheetData.discount += amount;
											   } else {
												  bottomSheetData.fare -= amount;
											   }
										   } else {
											   if(typeof(code) !== 'undefined' || bookType === 'Voucher') {
												   bottomSheetData.fare -= amount;
											   } else {
												   bottomSheetData.discount += amount;
											   }
										   }
						   				   break;
						case 'PromotionDiscount' : bottomSheetData.promotion += amount;
												   break;
						default : bottomSheetData.tax += amount;
								  break;
					}
				}
			}
			
			if(Object.keys(pnrData.breakdown.passengerTotals).length > 0) {
				let bundleName = '';
				let bundleCost = 0;
				const passengerSegment = segments[j].passengerSegment;
				const psObjectKey = Object.keys(passengerSegment);
				const passengerSegmentLen = psObjectKey.length;

				for(let k = 0; k < passengerSegmentLen; k++) {
					bundleName = passengerSegment[psObjectKey[k]].bundleName;
					if(typeof(bundleName) === 'undefined') {
						break;
					}
					const ssrs = passengerSegment[psObjectKey[k]].ssrs;
					const ssrsLength = ssrs.length;

					for(let z = 0; z < ssrsLength; z++) {
						if(ssrs[z].inBundle) {
							const passengers = pnrData.passengers;
							const pObjectKey = Object.keys(passengers);
							const passengersLen = pObjectKey.length;
							for(let n = 0; n < passengersLen; n++) {
								if(passengerSegment[psObjectKey[k]].passengerKey === passengers[pObjectKey[n]].passengerKey) {
									const fees = passengers[pObjectKey[n]].fees;
									const feesLen = fees.length;
									for(let m = 0; m < feesLen; m++) {
										if(ssrs[z].feeCode === fees[m].code && segments[j].flightReference === fees[m].flightReference) {
											const serviceCharges = fees[m].serviceCharges;
											const serviceChargesLen = serviceCharges.length;
											for(let x = 0; x < serviceChargesLen; x++) {
												if(serviceCharges[x].type === 'ServiceCharge') {
													bottomSheetData.bundle += serviceCharges[x].amount;
													bundleCost += serviceCharges[x].amount;
												} else if(serviceCharges[x].type === 'Discount') {
													bottomSheetData.bundle -= serviceCharges[x].amount;
													bundleCost -= serviceCharges[x].amount;
												}
											}
										}
									}
								}
							}
						}
					}
				}
				if(typeof(bundleName) !== 'undefined') {
					bundleHTML += '<div class="flex-text" name="divBundle">';
					bundleHTML += '		<div class="flex-text__title">' + bundleName + '</div>';
					bundleHTML += '		<div class="flex-text__additional">' + sUtil.FmtcurrencyCvt(I18N.language, currencyCode, bundleCost) + '</div>';
					bundleHTML += '	</div>';
				}
			}
		}
	}
	
	if(paxInfoLength === 1 && paxInfo[passengerObjKeyArr[0]].passengerTypeCode === 'CHD') {
		let feesHTML = '';
		let ssrName = '';
		const fees = paxInfo[passengerObjKeyArr[0]].fees;
		for(let i = 0; i < fees.length; i++) {
			if(fees[i].code === 'PDUMF') {
				ssrName = fees[i].ssrName; 
				bottomSheetData.pdumf += payType === 'P' ? fees[i].serviceCharges[0].foreignAmount : fees[i].serviceCharges[0].amount;
			}
		}
		feesHTML += '<div class="flex-text" id="divPDUM">';
		feesHTML += '	<div class="flex-text__title">' + ssrName + '</div>';
		feesHTML += '	<div class="flex-text__additional">' + sUtil.FmtcurrencyCvt(I18N.language, currencyCode, bottomSheetData.pdumf) + '</div>';
		feesHTML += '</div>';
		
		$('#extraServiceFee').show().children('.itemize__item').prepend(feesHTML);
	}
	
	let totalAmount = bottomSheetData.fare + bottomSheetData.tax + bottomSheetData.fuelCharge + bottomSheetData.bundle + bottomSheetData.pdumf - bottomSheetData.discount - bottomSheetData.promotion;
	let gifTicketDisCount = 0;
	if(bookType === 'Voucher') {
		totalAmount = totalAmount - bottomSheetData.fare;
		gifTicketDisCount = bottomSheetData.fare;
	}

	if(payType === 'P') {
		sUtil.FmtcurrencyCvt(I18N.language, pnrData.breakdown.journeyTotals.totalTaxCurrency, pnrData.breakdown.journeyTotals.totalTax , $('#spanCost'));
		sUtil.FmtcurrencyCvt(I18N.language, currencyCode, (totalAmount - pnrData.breakdown.journeyTotals.totalTax), $('#spanPoint'));
		$('#spanPoint').show();
	}  else {
		sUtil.FmtcurrencyCvt(I18N.language, currencyCode, totalAmount , $('#spanCost'));
	}
	const taxCurrencyCode = payType === 'P' ? pnrData.breakdown.journeyTotals.totalTaxCurrency : currencyCode;
	
	sUtil.FmtcurrencyCvt(I18N.language, currencyCode, bottomSheetData.fare, $('#divFare').find('.flex-text__additional'));
	sUtil.FmtcurrencyCvt(I18N.language, taxCurrencyCode, bottomSheetData.tax, $('#divDA').find('.flex-text__additional'));
	sUtil.FmtcurrencyCvt(I18N.language, taxCurrencyCode, bottomSheetData.fuelCharge, $('#divYQ').find('.flex-text__additional'));

	if(bottomSheetData.discount !== 0) {
		const discountSelector = $('#divDiscount');
			sUtil.FmtcurrencyCvt(I18N.language, currencyCode , '-' + Math.abs(bottomSheetData.discount), discountSelector.find('.flex-text__additional'));
		discountSelector.removeAttr('style');
	}

	if(bottomSheetData.promotion !== 0) {
		const promotionCost = $('#divPromotion').find('.flex-text__additional');
		promotionCost.text('');
		sUtil.FmtcurrencyCvt(I18N.language, currencyCode , '-' + Math.abs(bottomSheetData.promotion), promotionCost);
	}
	
	if(gifTicketDisCount !== 0) {
		const gifTicketSelector = $('#divGifTicket');
		sUtil.FmtcurrencyCvt(I18N.language, currencyCode , '-' + gifTicketDisCount, gifTicketSelector.find('.flex-text__additional'));
		gifTicketSelector.removeAttr('style');
	}
	
	if(bundleHTML !== '') {
		$('#extraServiceFee').show().children('.itemize__item').prepend(bundleHTML);
	}
}

// 좌석 선택 가격 바텀시트 구성
const seatPriceSet = function() {
	if(seatData.length > 1 && seatData[1] !== 0) {
		const divBottomCost = payType === 'P' ? $('#spanPoint') : $('#spanCost');
		sUtil.FmtcurrencyCvt(I18N.language, seatData[0].currencyCode , seatData[1] , $('#divSeatFee'));
		$('#divSeat').show();
		$('#extraServiceFee').show();
		
		const cost = sUtil.getNumber(divBottomCost.children('.price_txt').text().replace(/[,]/g, '')) + seatData[1];
		sUtil.FmtcurrencyCvt(I18N.language, currencyCode, cost, divBottomCost);
	}
}

// 담은 상품 세팅
const cartInit = function(cartData) {
	if(cartData.length !== 0) {
		let cartHTML = '';
		const market = cartData[0].market;
		const marketLength = market.length;
		for(let i = 0; i < marketLength; i++) {
			const items = market[i].items;
			const itemsLength = items.length;
			for(let j = 0; j < itemsLength; j++) {
				const passengerKey = items[j].passengerKey;
				const ssrs = items[j].ssrs;
				const ssrsLength = ssrs.length;
				for(let k = 0; k < ssrsLength; k++) {
					if(!['XB', 'SB'].includes(ssrs[k].categoryCode)) {
						cartHTML = makePaxCartData(ssrs[k], i);
						
						let count = 0;
						let isWork = false;
						
						$('.put-product__item').each(function() {
							if(isWork) {
								return false;
							}
							if(passengerKey === $(this).find('p[name=passengerKey]').text()) {
								$(this).find('.put-product__box-img').each(function(idx) {
									if($(this).children().length === 0) {
										$(this).append(cartHTML);
										count = idx + 1;
										if(idx === 3) {
											$(this).parents('.put-product__box').addClass('more');
										}
										isWork = true;
										return false;
									}
								});
								if(!isWork) {
									cartHTML = '<div class="put-product__box-img" style="display: none">';
									cartHTML += makePaxCartData(ssrs[k], i);
									cartHTML += '</div>'
									
									$(this).find('.put-product__box.more').append(cartHTML);
									count = $(this).find('.put-product__box-img').length;
								}
								$(this).find('.put-product__button-text').html(BIZ_COMMONS_SCRIPT.getI18n("0000000360.msg00004").replace('{0}', count)); //n개
								return false
							}
						});
					}
			
					const categoryCode = ssrs[k].categoryCode;
					let divSsrFee = '';
					let divSsr = '';
					if(['XB', 'SB'].includes(categoryCode)) {
						divSsrFee = $('#divBaggageFee');
						divSsr = $('#divBaggage');
					} else if(categoryCode === 'ML'){
						divSsrFee = $('#divMealFee');
						divSsr = $('#divMeal');
					} else {
						divSsrFee = $('#divLoungeFee');
						divSsr = $('#divLounge');
					}
	
					const sideMenuArrLength = ssrs[k].sideMenuArr.length;
					let sideMenuFee = 0;
					for(let z = 0; z < sideMenuArrLength; z++) {
						sideMenuFee += ssrs[k].sideMenuArr[z].sideMenuCost;
					}
					
					const cartFee = sUtil.getNumber(ssrs[k].cost.replace(/[,]/g, '')) + sideMenuFee;
					const ssrFee = sUtil.getNumber(divSsrFee.children('.price_txt').text().replace(/[,]/g, '')) + cartFee;
					
					sUtil.FmtcurrencyCvt(I18N.language, cartData[0].currencyCode , ssrFee , divSsrFee);
					divSsr.show();
					$('#extraServiceFee').show();
		
					const divBottomCost = (payType === 'P' && inflType === 'B') ? $('#spanPoint') : $('#spanCost')
					const bottomSheetCost = sUtil.getNumber(divBottomCost.children('.price_txt').text().replace(/[,]/g, '')) + cartFee;
					sUtil.FmtcurrencyCvt(I18N.language, cartData[0].currencyCode , bottomSheetCost , divBottomCost);
				}
			}
		
			$('[id^=btnCart]').find('span').html(BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00014") + ' (' + cartCount + ')');
			
			const divTabPanel = $('#divTabPanel' + i);
			
			if(divTabPanel.find('div[name=divBagCartML]').children().length !== 0) {
				divTabPanel.find('div[name=divCartMeal]').show();
				divTabPanel.find('div[name=divEmptied]').hide();
			}
			if(divTabPanel.find('div[name=divBagCartLG]').children().length !== 0) {
				divTabPanel.find('div[name=divCartLounge]').show();
				divTabPanel.find('div[name=divEmptied]').hide();
			}
		}
		
		const insuInfo = cartData[0].insuInfo;
		if(typeof(insuInfo) !== 'undefined') {
			let insuFee = 0;
			const insuInfoLen = insuInfo.length;
			for(let i = 0; i < insuInfoLen; i++) {
				
				insuInfo[i].imgSrc = '../../../resources/images/@temp/@temp_nd9_01.png';
				insuInfo[i].ssrName = insuInfo[i].relatorPassengerType !== 'INF' ? BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00005") : BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00006"); //여행자 보험 : 여행자 보험(유아)
				insuInfo[i].categoryCode = 'IS';
				insuInfo[i].ssrCode = 'INSU';
				insuInfo[i].cost = sUtil.setComma(insuInfo[i].premium);
				insuInfo[i].currencyCode = pnrData.currencyCode;
				insuInfo[i].tabNo = 0;
				insuInfo[i].sideMenuArr = [];
				
				cartHTML = makePaxCartData(insuInfo[i], 0);
				let count = 0;
				let isWork = false;
				
				$('.put-product__item').each(function() {
					if(isWork) {
						return false;
					}
					if(insuInfo[i].passengerKey === $(this).find('p[name=passengerKey]').text() && typeof(insuInfo[i].relatorPassengerType) !== 'INF') {
						$(this).find('.put-product__box-img').each(function(idx) {
							if($(this).children().length === 0) {
								$(this).append(cartHTML);
								count = idx + 1;
								if(idx === 3) {
									$(this).parents('.put-product__box').addClass('more');
								}
								isWork = true;
								return false;
							}
						});
						if(!isWork) {
							cartHTML = '<div class="put-product__box-img" style="display: none">';
							cartHTML += makePaxCartData(insuInfo[i], 0);
							cartHTML += '</div>'
							
							$(this).find('.put-product__box.more').append(cartHTML);
							count = $(this).find('.put-product__box-img').length;
						}
						$(this).find('.put-product__button-text').html(BIZ_COMMONS_SCRIPT.getI18n("0000000360.msg00004").replace('{0}', count)); //n개
						return false
					}
				});
				insuFee += insuInfo[i].premium;
			}
			
			const spanCost = $('#spanCost');
			sUtil.FmtcurrencyCvt(I18N.language, pnrData.currencyCode,sUtil.getNumber(spanCost.children('.price_txt').text().replace(/[,]/g, '')) + insuFee, $('#spanCost'));
			
			
			sUtil.FmtcurrencyCvt(I18N.language, pnrData.currencyCode, insuFee, $('#divInsuFee'));
			$('#divInsuFee').show().parent().show();
			
			
			$('#extraServiceFee').show();
			
			const divTabPanel = $('#divTabPanel0');
			divTabPanel.find('div[name=divCartInsu]').show();
			divTabPanel.find('div[name=divEmptied]').hide();
		}
	}
}

// 승객 별 담은 상품 클릭 
const paxCartClick = function(event) {

	$('#divCartTab').find('button').eq(0).trigger('click');

	const obj = $(event.currentTarget);
	const paxName = obj.find('.put-product__title').text();
	const paxKey = obj.find('p[name=passengerKey]').text();
	
	$('#hPassengerName').html(paxName);
	$('#hPassengerKey').html(paxKey);
	
	const imgLength = obj.find('img').length;
	if(imgLength !== 0) {

		$('div[name=divEmptied]').show();
		$('div[name=divCartMeal]').hide();
		$('div[name=divCartLounge]').hide();
		$('div[name=divCartInsu]').hide();
		$('div[name=divBagCartML]').html('');
		$('div[name=divBagCartLG]').html('');
		$('div[name=divBagCartIS]').html('');

		let cartHTML = '';
		for(let i = 0; i < imgLength; i++) {
			const imgBox = obj.find('.put-product__box-img').eq(i);
			const tabNo = imgBox.find('.tabNo').text();
			const imgSrc = imgBox.find('img').attr('src');
			const ssrName = imgBox.find('.ssrName').text();
			const categoryCode = imgBox.find('.categoryCode').text();
			const ssrCode = imgBox.find('.ssrCode').text();
			const costArr = imgBox.find('.cost').text().trim().split(/\s+/);
			const sideMenuName = imgBox.find('.sideMenu').text().trim();
			const sideMenuCost = imgBox.find('.sideMenuCost').text().trim();
			
			cartHTML = '<div class="list-card__item">';
			cartHTML += '	<span name="index" style="display: none">' + i + '</span>';
			cartHTML += '	<span name="tabNo" style="display: none">' + tabNo + '</span>';
			cartHTML += '	<div class="list-card__item-inner">';
			cartHTML += '		<div class="list-card__image">';
			cartHTML += '			<img src=' + imgSrc + ' alt="">';
			cartHTML += '		</div>';
			cartHTML += '		<div class="list-card__info">';
			cartHTML += '			<strong class="list-card__title">' + ssrName + '</strong>';
			cartHTML += '			<span class="categoryCode" style="display: none">' + categoryCode + '</span>';
			cartHTML += '			<span class="ssrCode" style="display: none">' + ssrCode + '</span>';
			cartHTML += '			<p class="list-card__text">' + sUtil.FmtcurrencyCvt(I18N.language, costArr[1] , sUtil.getNumber(costArr[0].replace(/[,]/g, ''))) + '</p>';
			cartHTML += '		</div>';
			cartHTML += '		<div class="button-wrap">';
			setCartLayer(cartHTML, categoryCode, sideMenuName, sideMenuCost, tabNo);
		}
	} else {
		$('div[name=divEmptied]').show();
		$('div[name=divCartMeal]').hide();
		$('div[name=divCartLounge]').hide();
		$('div[name=divCartInsu]').hide();
	}
	
	$.modal.close();
	$('#ancillaryPassengerCart').trigger('click');
}

// 부가서비스 선택 정보 저장
const saveSsrInfo = function(passengerKey, ssrCode, categoryCode, ssrName, imgSrc, cost, currencyCode, tabNo, sideMenuArr, journeysIdx) {
	const market = cartData[0].market[tabNo];
	let replaceFlag = false;
	for(let i = 0; i < market.items.length; i++) {
		if(market.items[i].passengerKey === passengerKey) {
			if(categoryCode === 'ML') {
				for(let j = 0; j < market.items[i].ssrs.length; j++) {
					if(market.items[i].ssrs[j].categoryCode === 'ML') {
						replaceFlag = true;
						market.items[i].ssrs[j].ssrCode = ssrCode;
						market.items[i].ssrs[j].ssrName = ssrName;
						market.items[i].ssrs[j].imgSrc = imgSrc;
						market.items[i].ssrs[j].cost = cost;
						market.items[i].ssrs[j].currencyCode = currencyCode;
						if(typeof(journeysIdx) !== 'undefined') {
							market.items[i].ssrs[j].tabNo = journeysIdx;
						} else {
							market.items[i].ssrs[j].tabNo = tabNo;
						}
						market.items[i].ssrs[j].sideMenuArr = sideMenuArr;
						
					}
				}
			}
			if(!replaceFlag) {
				let tempObj = {};
				tempObj.ssrCode = ssrCode;
				tempObj.categoryCode = categoryCode;
				tempObj.ssrName = ssrName;
				tempObj.imgSrc = imgSrc;
				tempObj.cost = cost;
				tempObj.currencyCode = currencyCode;
				if(typeof(journeysIdx) !== 'undefined') {
					tempObj.tabNo = journeysIdx;
				} else {
					tempObj.tabNo = tabNo;
				}
				tempObj.sideMenuArr = sideMenuArr;
				
				market.items[i].ssrs.push(tempObj);					
			}
		}
	}
	sessionStorage.setItem('cartData', JSON.stringify(cartData));
}

// 담은 상품 개수 계산
const getCartCount = function(cartData, includeXB) {
	let cartCount = 0;
	const market = cartData[0].market;
	const marketLength = market.length;
	for(let i = 0; i < marketLength; i++) {
		const items = market[i].items;
		const itemsLength = items.length;
		for(let j = 0; j < itemsLength; j++) {
			let tempCart = '';
			if(typeof(includeXB) === 'undefined') {
				tempCart = items[j].ssrs.filter(function(element) {
					return !['XB', 'SB'].includes(element.categoryCode);
				});
			} else {
				tempCart = items[j].ssrs.filter(function(element) {
					return element.length !== 0;
				});
			}
			
			cartCount += tempCart.length;
		}
	}
	if(typeof(cartData[0].insuInfo) !== 'undefined') {
		cartCount += cartData[0].insuInfo.length;
	}
	return cartCount;
}

// 담은 상품 삭제
const removeCartData = function(tabNo, ssrCode) {
	const items = cartData[0].market[tabNo].items;
	for(let i = 0; i < items.length; i++) {
		if(items[i].passengerKey === $('#hPassengerKey').text()) {
			const ssrs = items[i].ssrs;
			for(let j = 0; j < ssrs.length; j++) {
				if(ssrs[j].ssrCode === ssrCode) {
					ssrs.splice(j, 1);
					break;
				}
			}
		}
	}
}

// 담은 상품 삭제 버튼 클릭 
const cartDelete = function(event) {
	const obj = $(event.currentTarget);
	cartDeleteData = obj.parents('.list-card__item');
	
	$.modal.close();
	
	let alertText = '';
	if(cartDeleteData.find('.ssrCode').text() !== 'INSU') {
		alertText = BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00012"); //담은 상품을 삭제 하시겠습니까?
	} else {
		alertText = BIZ_COMMONS_SCRIPT.getI18n("0000000361.msg00013"); //보험 상품을 삭제하시겠습니까?\n삭제 시 전체 탑승객의 보험 가입이 취소 됩니다.
	}
	$('#btnConfirmAgree').off('click').on('click', btnConfirmAgreeClick);
	$('#hText').html(alertText);
	$('#commonConfirm').trigger('click');
}

// 보험 담은 상품 삭제
const cartInsuDelete = function() {
	$('.put-product__box-img').each(function() {
		if($(this).children().length !== 0 && $(this).children('.ssrCode').text() === 'INSU') {
			$(this).remove();
		}
	});
	$('.put-product__item').each(function() {
		const imgCount = $(this).find('img').length;
		$(this).find('.put-product__button-text').html(imgCount + '개');
		
		const divImg = $(this).find('.put-product__box-img');
		const divImgLen = divImg.length;
		const imgBox = divImg[3];
		
		if(typeof(imgBox) !== 'undefined' && imgBox.style.display === 'none') {
			imgBox.removeAttribute('style');
		}
		if(divImgLen < 4) {
			const productBox = $(this).find('.put-product__box');
			let imgBoxHTML = '';
			for(let i = divImgLen; i < 4; i++) {
				imgBoxHTML += '<div class="put-product__box-img"></div>';
			}
			productBox.append(imgBoxHTML);
			productBox.removeClass('more');
		}
	});
}

// 담은 상품 삭제
const cartDataDelete = function(cartPassengerKey, cartDataTabNo) {
	const cartDataIndex = cartDeleteData.find('span[name=index]').text();
	const categoryCode =  cartDeleteData.find('.categoryCode').text();
	const ssrCode = cartDeleteData.find('.ssrCode').text();
	
	if(cartDeleteData.parents('.tab__panel').find('.list-card').children().length === 1) {
		cartDeleteData.parents('.tab__panel').children('div[name=divEmptied]').show();
	}

	if(ssrCode !== 'INSU') {
		if(cartDeleteData.parent().children().length === 1) {
			cartDeleteData.parents('.section-wrap').hide();
		}
		cartDeleteData.remove();
	} else {
		$('div[name=divCartInsu]').hide().children('div[name=divBagCartIS]').children().remove();
	}

	if(paxInfoLength > 1) {
		if(ssrCode !== 'INSU') {
			$('.put-product__item').each(function() {
				if($(this).find('p[name=passengerKey]').text() === cartPassengerKey) {
					$(this).find('.put-product__box-img')[cartDataIndex].remove();
					
					const imgCount = $(this).find('img').length;
					$(this).find('.put-product__button-text').html(BIZ_COMMONS_SCRIPT.getI18n("0000000360.msg00004").replace('{0}', imgCount)); //n개
					
					const imgBox = $(this).find('.put-product__box-img')[3];
					
					if(typeof(imgBox) !== 'undefined' && imgBox.style.display === 'none') {
						imgBox.removeAttribute('style');
					}
					if(imgCount < 4) {
						const productBox = $(this).find('.put-product__box');
						productBox.append('<div class="put-product__box-img"></div>');
						productBox.removeClass('more');
					}
					return false;
				}
			});
		} else {
			cartInsuDelete();
		}
	}

	if(ssrCode !== 'INSU') {
		const cost = sUtil.getNumber(cartDeleteData.find('.list-card__text').children('.price_txt').text().replace(/[,]/g, ''));
		const spanCost = (payType === 'P' && inflType === 'B') ? $('#spanPoint') : $('#spanCost');
		const preCost = sUtil.getNumber(spanCost.children('.price_txt').text().replace(/[,]/g, '')); 
		
		sUtil.FmtcurrencyCvt(I18N.language, currencyCode, preCost - cost, spanCost);
		let categoryFee = '';
		if(categoryCode === 'ML') {
			categoryFee = $('#divMealFee');
		} else {
			categoryFee = $('#divLoungeFee');
		}
			
		const categoryCost = sUtil.getNumber(categoryFee.children('.price_txt').text().replace(/[,]/g, '')) - cost;
		sUtil.FmtcurrencyCvt(I18N.language, currencyCode, categoryCost, categoryFee);
		
		if(categoryCost === 0) {
			categoryFee.parent('div').hide();
		}
	} else {
		let insuCost = 0;
		const insuInfoLen = cartData[0].insuInfo.length;
		for(let i = 0; i < insuInfoLen; i++) {
			insuCost += cartData[0].insuInfo[i].premium;
		}
		$('#divInsu').hide();
		const preCost = sUtil.getNumber($('#spanCost').children('.price_txt').text().replace(/[,]/g, '')); 
		sUtil.FmtcurrencyCvt(I18N.language, currencyCode , (preCost - insuCost), $('#spanCost'));
	}
	
	let exist = false;
	$('#extraServiceFee').find('.flex-text').each(function() {
		if($(this).css('display') !== 'none') {
			$('#extraServiceFee').show();
			exist = true;
			return false;	
		}
	});
	if(!exist) {
		$('#extraServiceFee').hide();
	}

	if(ssrCode !== 'INSU') {
		removeCartData(cartDataTabNo, ssrCode);
	} else {
		delete cartData[0].insuInfo;
		delete cartData[0].insu;
	}
	
	const divTabPanel = $('#divTabPanel' + cartDataTabNo);
	let firstClass = false;
	const categoryLen = divTabPanel.children('div').length - 1;
	for(let j = 0; j < categoryLen; j++) {
		const titleFirst = divTabPanel.children().eq(j);
		if(firstClass) {
			titleFirst.removeClass('mt0');
		} else {
			if(titleFirst.css('display') !== 'none') {
				titleFirst.attr('class', 'section-wrap mt0');
				firstClass = true;
			}
		}
	}

	sessionStorage.setItem('cartData', JSON.stringify(cartData));
	
	$.modal.close();
}

// 승객 별 담은 상품 뒤로가기
const locationBack = function() {
	$.modal.close();
	$('#ancillaryCart').trigger('click');
}

// 다음 화면 이동
const nextPage = function() {
	
	Progress.show();
	$('#pnrData').val(JSON.stringify(pnrData));
	$('#payType').val(payType);
	$('#bookType').val(bookType);
	$('#tripType').val(tripType);
	$('#inflType').val(inflType);
	$('#domIntType').val(domIntType);
	$('#cultureCode').val(cultureCode);
	if(seatData !== '') {
		$('#seatData').val(JSON.stringify(seatData));
	}
	
	$('#frmNext').attr({
		'method': 'post',
		'onsubmit': 'return true',
		'action': 'AncillaryGate.do'
	}).submit();
}

// 확인 및 동의 화면으로 이동
const goConfirm = function() {
	
	Progress.show();
	let segCount = 0;
	for(let i = 0; i < journeysLength; i++) {
		const segmentsLength = journeys[i].segments.length;
		for(let j = 0; j < segmentsLength; j++) {
			segCount++;
		}
	}
	
	const GATripType = tripType === 'MT' ? 'MC' : tripType;
	let totalPoint = 0;
	let GAEventArr = [];
	let GAProductsArr = [];
	let emdInfoArr = [];
	if(inflType === 'B') {
		if(getCartCount(cartData, 'Y') !== 0 || seatData !== '') {
			for(let i = 0; i < paxInfoLength; i++) {
				let tempObj = {};
				
				tempObj.Num = i + 1;
				tempObj.insure = 0;
				tempObj.insureCurrency = currencyCode;
				tempObj.journeys = [];
				tempObj.passengerKey = paxInfo[passengerObjKeyArr[i]].passengerKey;
				tempObj.name = paxInfo[passengerObjKeyArr[i]].name.last + '/' + paxInfo[passengerObjKeyArr[i]].name.first;
				tempObj.passengerTypeCode = paxInfo[passengerObjKeyArr[i]].passengerTypeCode;
				emdInfoArr.push(tempObj);
				for(let j = 0; j < journeysLength; j++) {
					let tempObj = {};
					tempObj.emdInfo = {};
					emdInfoArr[i].journeys.push(tempObj);
				}
			}
		}
	}
	
	if(getCartCount(cartData, 'Y') !== 0 || $('#divCheckRow').find('[id^=inputCheck]').is(':checked')) {
		let ssrAddData = cartData;
		let tempArr = [];
		
		for(let i = 0; i < ssrAddData[0].market.length; i++) {
			ssrAddData[0].market[i].items = ssrAddData[0].market[i].items.filter(function(element) {
				return element.ssrs.length !== 0;
			})
		}
		for(let i = 0; i < ssrAddData[0].market.length; i++) {
			ssrAddData[0].market = ssrAddData[0].market.filter(function(element) {
				return element.items.length !== 0;
			})	
		}
		
		let market = ssrAddData[0].market;
		
		for(let i = 0; i < ssrAddData[0].market.length; i++) {
			let items = market[i].items;
			
			for(let j = 0; j < ssrAddData[0].market[i].items.length; j++) {
				let ssrs = items[j].ssrs;
				const ssrsLength = ssrs.length;
				
				for(let k = 0; k < ssrsLength; k++) {
					const sideMenuArr = ssrs[k].sideMenuArr;
					const sideMenuArrLength = sideMenuArr.length;

					tempArr = [];
					for(let z = 0; z < sideMenuArrLength; z++) {
						tempArr.push({'ssrCode' : sideMenuArr[z].sideMenuSsrCode, 'ssrName' : sideMenuArr[z].sideMenuName, 'cost' : sUtil.setComma(sideMenuArr[z].sideMenuCost), 'categoryCode' : 'CB', 'journeysNum' : ssrs[k].tabNo})
						
						let GAEventObj = {};
						GAEventObj.event = 'checkAnc';
						GAEventObj.eventCategory = '부가서비스 선택';
						
						let eventAction = '가는편';
						let journeysIdx = '0';
						if(journeysLength > 1 && segCount < 3) {
							if(ssrs[k].tabNo === '1') {
								eventAction = '오는편';
								journeysIdx = 1;
							}
						} else {
							if(sUtil.getNumber(ssrs[k].tabNo) > 1) {
								eventAction = '오는편';
								journeysIdx = 1;
							}
						}
						GAEventObj.eventAction = eventAction;
						GAEventObj.eventLabel = '기내식';
		
						GAEventArr.push(GAEventObj);
						
						let GAObj = {};
						GAObj.id = pnrData.journeys[journeysIdx].designator.origin + '-' + pnrData.journeys[journeysIdx].designator.destination + '-' + GATripType + '^A-MEAL';
						GAObj.name = 'Meal';
						GAObj.price = sideMenuArr[z].sideMenuCost;
						GAObj.variant = '서브';
						GAObj.category = 'Ancillary';
						GAObj.quantity = 1;
						
						GAProductsArr.push(GAObj);
						
					}
					ssrs[k] = {'ssrCode' : ssrs[k].ssrCode, 'ssrName' : ssrs[k].ssrName, 'cost' : ssrs[k].cost, 'categoryCode' : ssrs[k].categoryCode, 'journeysNum' : ssrs[k].tabNo};
					
					let GAEventLabel = ''
					let GAID = '';
					let GAName = '';
					let GAVariant = '';
					if(['XB', 'SB'].includes(ssrs[k].categoryCode)) {
						GAEventLabel = '수하물';
						GAID = '^A-BAG';
						GAName = 'Baggage';
						GAVariant = ssrs[k].categoryCode === 'XB' ? '위탁' : '특수';
					} else if(ssrs[k].categoryCode === 'ML') {
						GAEventLabel = '기내식';
						GAID = '^A-MEAL';
						GAName = 'Meal';
						GAVariant = '메인';
					} else if(ssrs[k].categoryCode === 'LG') {
						GAEventLabel = 'JJ라운지 이용권';
						GAID = '^A-LOUN';
						GAName = 'Lounge';
						GAVariant = pnrData.passengers[items[j].passengerKey].passengerTypeCode === 'ADT' ? '성인' : '소아';
					}
					
					let GAEventObj = {};
					GAEventObj.event = 'checkAnc';
					GAEventObj.eventCategory = '부가서비스 선택';
					
					let eventAction = '가는편';
					let journeysIdx = 0;
					if(['XB', 'SB'].includes(ssrs[k].categoryCode) || (journeysLength > 1 && segCount < 3)) {
						if(ssrs[k].journeysNum === '1') {
							eventAction = '오는편';
							journeysIdx = 1;
						}
					} else {
						if(sUtil.getNumber(ssrs[k].journeysNum) > 1) {
							eventAction = '오는편';
							journeysIdx = 1;
						}
					}
					GAEventObj.eventAction = eventAction;
					GAEventObj.eventLabel = GAEventLabel;
	
					GAEventArr.push(GAEventObj);
								
					let GAObj = {};
					GAObj.id = pnrData.journeys[journeysIdx].designator.origin + '-' + pnrData.journeys[journeysIdx].designator.destination + '-' + GATripType + GAID;
					GAObj.name = GAName;
					GAObj.price = sUtil.getNumber(ssrs[k].cost.replace(/[,]/g, ''));
					GAObj.variant = GAVariant;
					GAObj.category = 'Ancillary';
					GAObj.quantity = 1;
					
					GAProductsArr.push(GAObj);
					
					ssrs = ssrs.concat(tempArr);
					if(k === ssrsLength - 1) {
						if(inflType === 'M') {
							ssrs = ssrs.filter(function(element) {
								return element.ssrCode !== 'DELETE';
							});
						}
						ssrAddData[0].market[i].items[j].ssrs = ssrs;
					}
				}
				for(let k = 0; k < items[j].ssrs.length; k++) {
					
					totalPoint += sUtil.getNumber(ssrs[k].cost.replace(/[,]/g, ''));
					
					let tempObj = {};
					tempObj.categoryCode = ssrs[k].categoryCode;
					tempObj.amount = sUtil.getNumber(ssrs[k].cost.replace(/[,]/g, ''));
					tempObj.ssrCode = ssrs[k].ssrCode;
					tempObj.ssrName = ssrs[k].ssrName;
				
					for(let z = 0; z < emdInfoArr.length; z++) {
						if(emdInfoArr[z].name === items[j].passengerName) {
							let journeysIdx = 0;
							let segmentsIdx = 0;
							if(['XB', 'SB'].includes(ssrs[k].categoryCode) || (journeysLength > 1 && segCount < 3)) {
								if(ssrs[k].journeysNum === '1') {
									journeysIdx = 1;
								}
							} else {
								if(sUtil.getNumber(ssrs[k].journeysNum) > 1) {
									journeysIdx = 1;
								}
								
								if((ssrs[k].categoryCode === 'ML' || ssrs[k].categoryCode === 'LG') && segCount > 2) {
									if(journeys[0].segments.length === 2 && ssrs[k].journeysNum === '1') {
										segmentsIdx = 1;
									} else if(typeof(journeys[1]) !== 'undefined' && journeys[1].segments.length === 2 && ssrs[k].journeysNum === '3') {
										segmentsIdx = 1;
									}
								}
							}
							const emdInfoCategoryCode = emdInfoArr[z].journeys[journeysIdx].emdInfo[ssrs[k].categoryCode];
							if(typeof(emdInfoCategoryCode) === 'undefined') {
								emdInfoArr[z].journeys[journeysIdx].emdInfo[ssrs[k].categoryCode] = {};
								let classificationName = ssrs[k].ssrName;
								if(ssrs[k].categoryCode === 'XB') {
									classificationName = BIZ_COMMONS_SCRIPT.getI18n("0000000350.msg00052"); //사전 수하물
								} else if(ssrs[k].categoryCode === 'ML') {
									classificationName = BIZ_COMMONS_SCRIPT.getI18n("0000000350.msg00088"); //사전 기내식
								} else if(ssrs[k].categoryCode === 'CB') {
									classificationName = BIZ_COMMONS_SCRIPT.getI18n("0000000350.msg00095"); //사이드 메뉴
								} else if(ssrs[k].categoryCode === 'LG') {
									classificationName = BIZ_COMMONS_SCRIPT.getI18n("0000000350.msg00076"); //라운지
								}
								emdInfoArr[z].journeys[journeysIdx].emdInfo[ssrs[k].categoryCode].classificationName = classificationName;
							}
							
							if(typeof(emdInfoArr[z].journeys[journeysIdx].emdInfo[ssrs[k].categoryCode].segments) === 'undefined') {
								emdInfoArr[z].journeys[journeysIdx].emdInfo[ssrs[k].categoryCode].segments = [];
								const segmentsLength = journeys[journeysIdx].segments.length;
								for(let x = 0; x < segmentsLength; x++) {
									let tempObj = {};
									let destinationName = journeys[journeysIdx].segments[x].designator.destinationName;
									let originName = journeys[journeysIdx].segments[x].designator.originName;
									if(ssrs[k].categoryCode === 'XB' || ssrs[k].categoryCode === 'SB') {
										if(x !== 0) {
											break;
										}
										destinationName = journeys[journeysIdx].designator.destinationName;
										originName = journeys[journeysIdx].designator.originName;
									}
									tempObj.destinationName = destinationName;
									tempObj.originName = originName;
									tempObj.emds = [];
									emdInfoArr[z].journeys[journeysIdx].emdInfo[ssrs[k].categoryCode].segments.push(tempObj);
								}
							}
							
							let emdsObj = {};
							emdsObj.amount = sUtil.getNumber(ssrs[k].cost.replace(/[,]/g, ''));
							emdsObj.currency = currencyCode;
							emdsObj.ssrCode = ssrs[k].ssrCode;
							emdsObj.ssrName = ssrs[k].ssrName;
							
							emdInfoArr[z].journeys[journeysIdx].emdInfo[ssrs[k].categoryCode].segments[segmentsIdx].emds.push(emdsObj);
							break;
						}
					}
				}
			}
		}

		ssrAddData[0].blkSt = $('#inputCheck1').is(':checked') ? 'Y' : 'N';
		ssrAddData[0].ds = $('#inputCheck2').is(':checked') ? 'Y' : 'N';
		ssrAddData[0].plstBag = $('#inputCheck3').is(':checked') ? 'Y' : 'N';
		
		$('#cartData').val(JSON.stringify(ssrAddData[0]));
	} else {
		$('#cartData').val('');
	}
	$('#pnrData').val(JSON.stringify(pnrData));
	$('#payType').val(payType);
	$('#bookType').val(bookType);
	$('#tripType').val(tripType);
	$('#inflType').val(inflType);
	$('#domIntType').val(domIntType);
	$('#cultureCode').val(cultureCode);
	$('#totalPoint').val(totalPoint);
	$('#ssrAgentId').val(ssrAgentId);
	
	if(seatData !== '') {
		const seats = seatData[0].seats;
		const seatsLength = seats.length;
		for(let i = 0; i < seatsLength; i++) {
			for(let j = 0; j < emdInfoArr.length; j++) {
				if(emdInfoArr[j].passengerKey === seats[i].passengerKey) {
					if(typeof(emdInfoArr[j].journeys[seats[i].journeysNum].emdInfo['ST']) === 'undefined') {
						emdInfoArr[j].journeys[seats[i].journeysNum].emdInfo['ST'] = {};
					}
					emdInfoArr[j].journeys[seats[i].journeysNum].emdInfo['ST'].classificationName = BIZ_COMMONS_SCRIPT.getI18n("0000000350.msg00089"); //사전 좌석
					if(typeof(emdInfoArr[j].journeys[seats[i].journeysNum].emdInfo['ST'].segments) === 'undefined') {
						emdInfoArr[j].journeys[seats[i].journeysNum].emdInfo['ST'].segments = [];
					}
					
					let tempObj = {};
					tempObj.destinationName = journeys[seats[i].journeysNum].segments[seats[i].segmentsNum].designator.destinationName;
					tempObj.originName = journeys[seats[i].journeysNum].segments[seats[i].segmentsNum].designator.originName;
					tempObj.emds = [];
					emdInfoArr[j].journeys[seats[i].journeysNum].emdInfo['ST'].segments.push(tempObj);
					
					let emdsObj = {};
					emdsObj.amount = sUtil.getNumber(seats[i].price.replace(/[,]/g, ''));
					emdsObj.currency = seatData[0].currencyCode;
					emdsObj.ssrCode = seats[i].designator;
					emdsObj.ssrName = seats[i].designator;
					
					if(typeof(emdInfoArr[j].journeys[seats[i].journeysNum].emdInfo['ST'].segments[seats[i].segmentsNum]) === 'undefined') {
						emdInfoArr[j].journeys[seats[i].journeysNum].emdInfo['ST'].segments[0].emds.push(emdsObj)						
					} else {
						emdInfoArr[j].journeys[seats[i].journeysNum].emdInfo['ST'].segments[seats[i].segmentsNum].emds.push(emdsObj)
					}
					break;
				}	
			}
			
			let GAEventObj = {};
			GAEventObj.event = 'checkAnc';
			GAEventObj.eventCategory = '부가서비스 선택';
			GAEventObj.eventAction = seats[i].journeysNum === 0 ? '가는편' : '오는편';
			GAEventObj.eventLabel = '좌석';

			GAEventArr.push(GAEventObj);
			
			let GAObj = {};
			GAObj.id = pnrData.journeys[seats[i].journeysNum].designator.origin + '-' + pnrData.journeys[seats[i].journeysNum].designator.destination + '-' + GATripType + '^A-SEAT';
			GAObj.name = 'Seat';
			GAObj.price = sUtil.getNumber(seats[i].price.replace(/[,]/g, ''));
			GAObj.variant = seats[i].variant;
			GAObj.category = 'Ancillary';
			GAObj.quantity = 1;
			
			GAProductsArr.push(GAObj);
			
		}
		
		$('#seatData').val(JSON.stringify(seatData));
	}
	
	const productTypeCode = inflType === 'B' ? 'RSV' : 'EMD';
	let saleTypeCd = bookType === 'Promotion' ? 'PRM' : (bookType === 'Voucher' ? 'VCH' : (bookType === 'FOC' ? 'FOC' : (bookType === 'Point' ? 'PNT' : 'NOR')));
	$('#saleTypeCd').val(saleTypeCd);
	$('#productTypeCode').val(productTypeCode);
	
	const emdInfoArrLength = emdInfoArr.length;
	if(typeof(cartData[0].insuInfo) !== 'undefined') {
		const insuInfoLen = cartData[0].insuInfo.length;
		for(let i = 0; i < insuInfoLen; i++) {
			for(let j = 0; j < emdInfoArrLength; j++) {
				if(cartData[0].insuInfo[i].passengerKey === emdInfoArr[j].passengerKey) {
					if(typeof(emdInfoArr[j].insure) === 'undefined') {
						emdInfoArr[j].insure = cartData[0].insuInfo[i].premium;
					} else {
						emdInfoArr[j].insure += cartData[0].insuInfo[i].premium;
					}
				}
			}
			
			let GAEventObj = {};
			GAEventObj.event = 'checkAnc';
			GAEventObj.eventCategory = '부가서비스 선택';
			GAEventObj.eventAction = '가는편';
			GAEventObj.eventLabel = '여행자 보험';

			GAEventArr.push(GAEventObj);
			
			let GAObj = {};
			GAObj.id = pnrData.journeys[0].designator.origin + '-' + pnrData.journeys[0].designator.destination + '-' + GATripType + '^A-INSU';
			GAObj.name = 'Insurance';
			GAObj.price = cartData[0].insuInfo[i].premium;
			GAObj.variant = domIntType === 'D' ? '국내' : '해외';
			GAObj.category = 'Ancillary';
			GAObj.quantity = 1;
			
			GAProductsArr.push(GAObj);
		}
	}
	
	if(emdInfoArrLength !== 0) {
		for(let i = 0; i < emdInfoArrLength; i++) {
			for(let j = 0; j < emdInfoArr[i].journeys.length; j++) {
				if(Object.keys(emdInfoArr[i].journeys[j].emdInfo).length === 0) {
					emdInfoArr[i].journeys[j] = [];
				}
			}
		}
		$('#emdInfo').val(JSON.stringify(emdInfoArr));
	}
	
	const GAEventArrLength = GAEventArr.length;
	if(GAEventArrLength !== 0 && inflType === 'B') {
		window.dataLayer = window.dataLayer || [];
		for(let i = 0; i < GAEventArrLength; i++) {
			window.dataLayer.push(GAEventArr[i]);
		}
	}
	
	if(GAProductsArr.length !== 0) {
		$('#GAProducts').val(JSON.stringify(GAProductsArr));
		if(inflType === 'M') {
			window.dataLayer = window.dataLayer || [];
			window.dataLayer.push({
				'event'		: 'ee-addToCart-부가서비스',
				'ecommerce'	: {
					'currencyCode' : currencyCode,
					'add'		: {
						'products' : GAProductsArr
					}
				}
			});
		}
	}
	
	const url = inflType === 'B' ? '../booking/viewConfirm.do' : 'AncillaryConfirm.do';
	
	$('#frmNext').removeAttr('target');
	$('#frmNext').attr({
		'method': 'post',
		'onsubmit': 'return true',
		'action': url
	}).submit();
}
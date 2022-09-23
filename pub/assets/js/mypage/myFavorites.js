/**
 * 마이페이지 즐겨찾기
 */
// 즐겨찾기 삭제
let targetId = "";

let getAvailSearchData = function(obj) {
	let dataContainer = $(obj).parents(".boarding-wrap");
	let originCd = $(dataContainer).find("[name=hidStartPointAirportCd]").val();
	let destinationCd = $(dataContainer).find("[name=hidDestinationAirportCd]").val();
	let adtCnt = $(dataContainer).find("[name=hidAdtCnt]").val();
	let chdCnt = $(dataContainer).find("[name=hidChdCnt]").val();
	let infCnt = $(dataContainer).find("[name=hidInfCnt]").val();
	let destinationName = $(dataContainer).find("[name=hidDestinationAirportName]").val();
	let originName = $(dataContainer).find("[name=hidStartPointAirportName]").val();
	let tripType = "OW";
	let trips = [];
	let passengers = [];
	let domIntType = setDomIntType(originCd, destinationCd);
	let cultureCode = I18N.language + "-" + I18N.country;

	// passengers 셋팅
	if(adtCnt > 0) {
		passengers.push({type : "ADT",count : adtCnt});
	}
	if(chdCnt > 0) {
		passengers.push({type : "CHD",count : chdCnt});
	}
	if(infCnt > 0) {
		passengers.push({type : "INF",count : infCnt});
	}

	// 즐겨찾기 타입별 셋팅
	if($(dataContainer).attr("id").replaceAll(/[0-9]/g, '') == "divFlight") {
		trips.push({
			originAirport : originCd,
			destinationAirport : destinationCd,
			destinationName : destinationName,
			originName : originName,
			flightName : $(dataContainer).find("[name=hidFlightNm]").val(),
			flightDate : dUtil.cvtDate($(dataContainer).find("[name=hidDepartureDt]").val(), "y-m-d")
		});
	} else {
		tripType = $(dataContainer).find("[name=hidTripType]").val();

		trips.push({
			originAirport : originCd,
			destinationAirport : destinationCd,
			destinationName : destinationName,
			originName : originName,
			flightDate : dUtil.cvtDate($(dataContainer).find("[name=hidGDayDt]").val(), "y-m-d")
		});
		
		if(tripType == "RT") {
			trips.push({
				originAirport : destinationCd,
				destinationAirport : originCd,
				destinationName : destinationName,
				originName : originName,
				flightDate : dUtil.cvtDate($(dataContainer).find("[name=hidCDayDt]").val(), "y-m-d")
			});
		}
	}
	
	let availSearchData = {		
		tripRoute: trips,		
		passengers: passengers,
		currencyCode: "",
		tripType : tripType,
		bookType : "Common",
		domIntType : domIntType,
		cultureCode: cultureCode,
		discountInfo: {},
   		voucherInfo : {},
		lowfareIncludeTaxesAndFee : "false"
	};
	return availSearchData;
}

let shareMyFavorites = function(obj) {
	getShortUrl('booking', encodeURIComponent(JSON.stringify(getAvailSearchData(obj))));
};

let deleteFavorite = function() {
	let targetObj = $("#" + targetId);
	let targetType = targetId.replaceAll(/[0-9]/g, "").replace("div", "");
	let loginId = JSON.parse(USER_INFO.get()).userId;

	let reqData = {
			type : targetType,
			mbrId : loginId
	};

	switch(targetType) {
		case "Flight" :
			reqData.flightName = $(targetObj).find("[name=hidFlightNm]").val();
			reqData.departureDate = $(targetObj).find("[name=hidDepartureDt]").val();
			reqData.startPointAirportCode = $(targetObj).find("[name=hidStartPointAirportCd]").val();
			break;
		case "Journey" :
			reqData.tripType = $(targetObj).find("[name=hidTripType]").val();
			reqData.gDayDate = $(targetObj).find("[name=hidGDayDt]").val();
			reqData.cDayDate = $(targetObj).find("[name=hidCDayDt]").val();
			reqData.startPointAirportCode = $(targetObj).find("[name=hidStartPointAirportCd]").val();
			reqData.destinationAirportCode = $(targetObj).find("[name=hidDestinationAirportCd]").val();
			break;
		case "Airport" :
			reqData.code = $(targetObj).find("[name=hidAirportCode]").val();
			break;
	}
	
	$.ajax({
		async : false,
		type : "post",
		url : "deleteMyFavorites.json",
		data : reqData,
		success : function(data) {
			if(!sUtil.isEmpty(data.data) && data.data.deleteCount > 0) {
				if(targetType == "Airport") {
					$(targetObj).remove();
					$("#divAirport .anchor-list__item:eq(0)").addClass("cancel--bt");
				} else {
					if($(targetObj).parent().children().length == 1) {
						$(targetObj).parent().parent().remove();
					}
					$(targetObj).remove();
				}
				checkNoResult(targetType);
			}
		}
	});
	closeModal('confirmDelete');
};

// 즐겨찾기 삭제 후 남은 즐겨찾기 없을 경우 화면 셋팅
let checkNoResult = function(type) {
	let targetDiv = $("#div" + type);
	if(type == "Flight" || type == "Journey") {
		if($(targetDiv).find("[id^=div" + type + "]").length > 0) {
			return;
		}
	} else {
		if($(targetDiv).find(".anchor-list__item").length > 0) {
			return;
		}
	}
	
	let strHtml = "";
	strHtml += '<div class="finish-item-wrap">';
	strHtml += '	<div class="finish-item nodata">';
	strHtml += '		<div class="finish-item__img">';
	strHtml += '			<img src="/resources/images/icon/icon-nodata-03.png" alt="">';
	strHtml += '		</div>';
	strHtml += '		<p class="finish-item__title">' + BIZ_COMMONS_SCRIPT.getI18n("0000000280.msg00009") + '</p>'; 	// 즐겨찾기는 예매 단계에서<br>등록할 수 있어요.
	strHtml += '		<p class="finish-item__text">' + BIZ_COMMONS_SCRIPT.getI18n("0000000280.msg00010") + '</p>'; 	// 고민 중인 여행이 있다면<br>언제든 저장하고 관리해 보세요:) 
	strHtml += '		<div class="container--large pc-40">';
	strHtml += '			<div class="button-wrap button-wrap--center">';
	strHtml += '				<button type="button" class="button button--secondary button--active" onclick="moveAvailability();">';
	strHtml += '					<span class="button__text">' + BIZ_COMMONS_SCRIPT.getI18n("0000000280.msg00011") + '</span>';	// 예매하러 가기
	strHtml += '				</button>';
	strHtml += '			</div>';
	strHtml += '		</div>';
	strHtml += '	</div>';
	strHtml += '</div>';

	$(targetDiv).html(strHtml);	
};

let moveAvailability = function() {
	location.href ="/"+I18N.language+"/ibe/booking/Availability.do";
};

let setDomIntType = function(pOriginCd, pDestinationCd) {
	let domIntType = "";

	let reqData = {
			origin : pOriginCd,
			destination : pDestinationCd,
			langCode : I18N.language
	};
	$.ajax({
		async : false,
		type : "post",
		url : "getDomIntType.json",
		data : reqData,
		success : function(data) {
			if(!sUtil.isEmpty(data.data)) {
				domIntType = data.data.domIntType;
			}
		}
	});
	return domIntType;
};

$(document).ready(function() {
	$("#divAirport .anchor-list__item:eq(0)").addClass("cancel--bt");
	
	// 항공편, 여정 삭제
	$(".button-delete").on("click", function() {
		targetId = $(this).parent().parent().parent().parent().parent().attr("id");
		fullPopOpen("confirmDelete");
	});
	
	// 공항 삭제
	$(".button-del").on("click", function() {
		targetId = $(this).parent().attr("id");
		fullPopOpen("confirmDelete");
	});
	
	$("#btnMoreFavorites").on("click", function() {
		let moreCnt = 0;
		let friendItems = $("#divAirport .anchor-list__item");
		let visibleCnt = $("#divAirport .anchor-list__item:visible").length;
		let airportListSize = $(friendItems).length;
		
		if(airportListSize > visibleCnt + 10) {
			moreCnt = visibleCnt + 10;
		} else {
			moreCnt = airportListSize;
			$(this).parent().hide();
		}
		for(let i = visibleCnt ; i < moreCnt ; i++) {
			$(friendItems[i]).show();
		}
	});
	
	// 예매하기 버튼 클릭 시 예매화면으로 이동
	$("[name=btnSendFlight], [name=btnSendJourney]").on("click", function() {
		let availSearchData = getAvailSearchData(this);
		
		$('#frmForAvail [name=availSearchData]').val(JSON.stringify(availSearchData));
		$('#frmForAvail').attr({'method': 'POST','onsubmit': 'return true','action': '../../ibe/booking/AvailSearch.do'}).submit();
	});
	
	BIZ_COMMONS_SCRIPT.callI18n("0000000280");
});
/**
 * 승객 정보 입력(모바일 탑승권 발급, 모바일 탑승권 자동 발급 신청)
 */

// 승객 정보 셋팅
let orderKeys = {};
let sortOrderKeys = {};
let journeyNo = 0;

function initPassengerInput() {
	for(let i = 0 ; i < checkinInfo.journeys.length ; i++) {
		if(checkinInfo.journeys[i] == journeyKey) {
			journeyNo = i;
			break;
		}
	}
	$("[name=hidNationality]").each(function() {
		$(this).val(I18N.country);
		$(this).siblings("[name=btnNationality]").text(getNationalityName(I18N.country));
	});
	
	if(domIntType == "I") {
		$("[name=hidIssuedByCode]").each(function() {
			$(this).val(I18N.country);
			$(this).siblings("[name=btnIssuedByCode]").text(getNationalityName(I18N.country));
		});
	}
	
	for(let idx in passengersKey) {
		let pKey = passengersKey[idx];
		orderKeys[checkinInfo.passengers[pKey].order] = pKey;
	}
	sortOrderKeys = Object.keys(orderKeys).sort();
	
	for(let oKey in sortOrderKeys) {
		let pKey = orderKeys[sortOrderKeys[oKey]];
		let psgrData = checkinInfo.passengers[pKey];
		let psgrContainer = $("[data-passengerkey=" + pKey + "]");
		let psgrBirth = psgrData.info.dateOfBirth;
		let idx = $(psgrContainer).attr('id').replaceAll(/[^0-9]/gi, '');
		// 생년월일
		if(!sUtil.isEmpty(psgrBirth)) {
			let dPsgrDate = new Date(psgrBirth);
			let divBirth = $("#divBirth" + idx);
			$(divBirth).find("[name=txtYear]").val(dPsgrDate.getFullYear());
			$(divBirth).find("[name=selMonth]").val(dPsgrDate.getMonth() + 1).trigger("change");
			$(divBirth).find("[name=selDate]").val(dPsgrDate.getDate());
		}
		if(!sUtil.isEmpty(psgrData.info.nationality)) {
			$(psgrContainer).find("[name=hidNationality]").val(psgrData.info.nationality);
			$(psgrContainer).find("[name=btnNationality]").text(getNationalityName(psgrData.info.nationality));
		}
		if(!sUtil.isEmpty(psgrData.passengerAlternateKey)) {
			$(psgrContainer).find("[name=passengerAlternateKey]").val(psgrData.passengerAlternateKey);
		}
		if(!sUtil.isEmpty(psgrData.addresses.length > 0)) {
			$(psgrContainer).find("[name=passengerAddressKey]").val(psgrData.addresses[0].passengerAddressKey);
			if(amFlag) {
				if(!sUtil.isEmpty(psgrData.addresses[0].lineOne)) {
					$(psgrContainer).find("[name=selAddress]").val(psgrData.addresses[0].lineOne);
				}
				if(!sUtil.isEmpty(psgrData.addresses[0].provinceState)) {
					$(psgrContainer).find("[name=txtProvinceState]").val(psgrData.addresses[0].provinceState);
				}
				if(!sUtil.isEmpty(psgrData.addresses[0].city)) {
					$(psgrContainer).find("[name=txtCity]").val(psgrData.addresses[0].city);
				}
				if(!sUtil.isEmpty(psgrData.addresses[0].postalCode)) {
					$(psgrContainer).find("[name=txtPostalCode]").val(psgrData.addresses[0].postalCode);
				}
			}
		}
		
		if(domIntType == "I") {
			if(!sUtil.isEmpty(psgrData.name)) {
				$(psgrContainer).find("[name=txtEngLastName]").val(psgrData.name.last);
				$(psgrContainer).find("[name=txtEngFirstName]").val(psgrData.name.first);
			}
			if(!sUtil.isEmpty(psgrData.info.gender)) {
				$(psgrContainer).find("#rdoGender" + psgrData.info.gender.charAt(0) + idx).prop("checked", true);
			}
			if(!sUtil.isEmpty(psgrData.travelDocuments.length > 0)) {
				let docContainer = $("#divPassport" + idx);
				let dDocDate = new Date(psgrData.travelDocuments[0].expirationDate);
				$(psgrContainer).find("[name=passengerTravelDocumentKey]").val(psgrData.travelDocuments[0].passengerTravelDocumentKey);
				$(psgrContainer).find("[name=txtPassport]").val(psgrData.travelDocuments[0].number);
				$(psgrContainer).find("[name=hidNationality]").val(psgrData.travelDocuments[0].nationality);
				$(psgrContainer).find("[name=btnNationality]").text(getNationalityName(psgrData.travelDocuments[0].nationality)).addClass("active");
				$(psgrContainer).find("[name=hidIssuedByCode]").val(psgrData.travelDocuments[0].issuedByCode);
				$(psgrContainer).find("[name=btnIssuedByCode]").text(getNationalityName(psgrData.travelDocuments[0].issuedByCode)).addClass("active");
				$(docContainer).find("[name=txtYear]").val(dDocDate.getFullYear());
				$(docContainer).find("[name=selMonth]").val(dDocDate.getMonth() + 1).trigger("change");
				$(docContainer).find("[name=selDate]").val(dDocDate.getDate());
			}
		}
		
		if(checkPsgrInput(idx)) {
			$("#psgrTab" + idx).children("button").addClass("is-checked");	
		}
	}
	
	if(amFlag) {
		// 미주노선 체류지 셀렉트박스 구성
		setAddress(checkinInfo.journeys[0].designator.destination);
	}
	
	// 값이 있는 input 라벨처리
	$.each($("[data-element=input]"), function(idx, pKey) {
		if(!sUtil.isEmpty($(pKey).val())) {
			$(pKey).closest("[data-element=form]").parent('.input-box').addClass('label-active');
		}
	});
	$.each($("select"), function(idx, pKey) {
		if(!sUtil.isEmpty($(pKey).val())) {
			$(pKey).addClass("selected");
		}
	});
	
	checkInputComplete(true);
	$("#psgrTab0").children("button").trigger("click");
}

// 탑승객 별 입력 완료 체크
function checkPsgrInput(pPsgrNo) {
	let psgrContainer = $("#divPsgrContainer" + pPsgrNo);
	let result = true;
	
	$.each($(psgrContainer).find(":required, [name=hidNationality], [name=hidIssuedByCode]"), function(idx, item) {
		if(sUtil.isEmpty($(item).val())) {
			result = false;
			return false;
		}
	});
	
	if(amFlag && $("#selAddress" + pPsgrNo).val() == "direct" && sUtil.isEmpty($("#txtAddressDirect" + pPsgrNo).val())) {
		result = false;
		return false;
	}
	
	if(result) {
		$("#psgrTab" + pPsgrNo).children("button").addClass("is-checked");
	} else {
		$("#psgrTab" + pPsgrNo).children("button").removeClass("is-checked");
	}
	
	return result;
}

function checkBirthday(psgrNo, adtCnt) {
	let psgrContainer = $("#divPsgrContainer" + psgrNo);
	let psgrType = $(psgrContainer).find("[name=passengerTypeCode]").val();
	let today = dUtil.toDate();
	let year = $("#txtYear" + psgrNo).val();
	let month = $("#selMonth" + psgrNo).val();
	let date = $("#selDate" + psgrNo).val();

	if(!sUtil.isEmpty(year) && !sUtil.isEmpty(month) && !sUtil.isEmpty(date)) {
		let pDate = year + ("0" + month).slice(-2) + ("0" + date).slice(-2);
		let minDate = new Date(1900,0,1);
		let psgrName = getPassengerName($(psgrContainer).find("[name=txtLastName]").val(), $(psgrContainer).find("[name=txtFirstName]").val());
		if(Number(today) <= Number(pDate)) {
			showAlert(BIZ_COMMONS_SCRIPT.getI18n('0000000552.msg00031').replace('{0}', psgrName)); // {성/이름} 님의 생년월일을 오늘 이전 일자로 선택하여 주십시오.
			return false;
		}
		
		if(Number(minDate.getFullYear()) > Number(year) || Number(minDate) > Number(pDate)) {
			showAlert(BIZ_COMMONS_SCRIPT.getI18n('0000000552.msg00030').replace('{0}', psgrName)); // {성/이름} 님의 생년월일을 다시 입력하여 주십시오.
			return false;
		}
		
		// 국제선은 출발일 기준 / 국내선은 돌아오는 여정의 출발일
		let baseDate = journeys[0].designator.departure.substring(0,10).replaceAll(/[^0-9]/g, "");
		if (domIntType === 'D') {
			if (tripType !='OW') {
				baseDate = journeys[journeys.length-1].designator.arrival.substring(0,10).replaceAll(/[^0-9]/g, "");
			}
		}
		
		if(psgrType == "CHD") {
			if(domIntType == "D") {
				let strFromDate = dUtil.termDate('M', 24, '', pDate);
				let strToDate = dUtil.termDate('Y', 13, '', pDate);
				if(Number(strFromDate) > Number(baseDate) || Number(strToDate) <= Number(baseDate)) {
			showAlert(BIZ_COMMONS_SCRIPT.getI18n('0000000552.msg00030').replace('{0}', psgrName)); // {성/이름} 님의 생년월일을 다시 입력하여 주십시오.
					return false;
				}
			} else {
				let strFromDate = dUtil.termDate('M', 24, '', pDate);
				let strToDate = dUtil.termDate('Y', 12, '', pDate);
				if(Number(strFromDate) > Number(baseDate) || Number(strToDate) <= Number(baseDate)) {
			showAlert(BIZ_COMMONS_SCRIPT.getI18n('0000000552.msg00030').replace('{0}', psgrName)); // {성/이름} 님의 생년월일을 다시 입력하여 주십시오.
					return false;
				}
			}
			
		} else if(psgrType == "INF") {
			if(domIntType == "D") {
				let strFromDate = dUtil.termDate('D', 7, '', pDate);
				let strToDate = dUtil.termDate('M', 24, '', pDate);
				if(Number(strFromDate) > Number(baseDate) || Number(strToDate) <= Number(baseDate)) {
			showAlert(BIZ_COMMONS_SCRIPT.getI18n('0000000552.msg00030').replace('{0}', psgrName)); // {성/이름} 님의 생년월일을 다시 입력하여 주십시오.
					return false;
				}
			} else {
				let strFromDate = dUtil.termDate('D', 14, '', pDate);
				let strToDate = dUtil.termDate('M', 24, '', pDate);
				if(Number(strFromDate) > Number(baseDate) || Number(strToDate) <= Number(baseDate)) {
			showAlert(BIZ_COMMONS_SCRIPT.getI18n('0000000552.msg00030').replace('{0}', psgrName)); // {성/이름} 님의 생년월일을 다시 입력하여 주십시오.
					return false;
				}
			}
		} else {
			if(domIntType == "D") {
				let strToDate = dUtil.termDate('Y', 13, '', pDate);
				if(Number(strToDate) >= Number(baseDate)) {
			showAlert(BIZ_COMMONS_SCRIPT.getI18n('0000000552.msg00030').replace('{0}', psgrName)); // {성/이름} 님의 생년월일을 다시 입력하여 주십시오.
					return false;
				}
			} else {
				let strToDate = dUtil.termDate('Y', 12, '', pDate);
				if(Number(strToDate) >= Number(baseDate)) {
			showAlert(BIZ_COMMONS_SCRIPT.getI18n('0000000552.msg00030').replace('{0}', psgrName)); // {성/이름} 님의 생년월일을 다시 입력하여 주십시오.
					return false;
				}
			}
		}
		return true;
	} else {
		showAlert(BIZ_COMMONS_SCRIPT.getI18n('0000000552.msg00029').replace('{0}', psgrName)); // {성/이름} 님의 생년월일을 선택하여 주십시오.
		return false;
	}
}

function isAdultPassenger(psgrNo) {
	let result = false;
	
	let year = $("#txtYear" + psgrNo).val();
	let month = $("#selMonth" + psgrNo).val();
	let date = $("#selDate" + psgrNo).val();
	let pDate = year + ("0" + month).slice(-2) + ("0" + date).slice(-2);
		
	// 국제선은 출발일 기준 / 국내선은 돌아오는 여정의 출발일
	let baseDate = journeys[0].designator.departure.substring(0,10).replaceAll(/[^0-9]/g, "");
	if (domIntType === 'D') {
		if (tripType !='OW') {
			baseDate = journeys[journeys.length-1].designator.arrival.substring(0,10).replaceAll(/[^0-9]/g, "");
		}
	}
	
	let strDate = dUtil.termDate('Y', 19, '', pDate);
	if(Number(strDate) < Number(baseDate)) {
		result = true;
	}
	return result;
}

// 입력 값 유효성 검사
function validationCheck() {
	let result = true;
	let adtCnt = 0;
	
	$.each($("[id^=divPsgrContainer]"), function(idx, item) {
		let pKey = orderKeys[sortOrderKeys[idx]];
		// 탑승객 타입과 생년월일 체크
		if(!checkBirthday(idx, adtCnt)) {
			result = false;
			return false;
		}
		
		if(domIntType == "I") {
			let docContainer = $(this).find("[id^=divPassport]");
			let inputLastName = $(this).find("[name=txtEngLastName]").val();
			let inputFirstName = $(this).find("[name=txtEngFirstName]").val();
			let resvLastName = checkinInfo.passengers[pKey].name.last;
			let resvFirstName = checkinInfo.passengers[pKey].name.first;
			
			// 영문명 불일치 체크
			if(resvLastName != inputLastName || resvFirstName != inputFirstName) {
				showAlert("(예약정보에 입력된 영문명)과 일치하는지 확인 하시기 바랍니다. \n\n만약, 여권상 기재된 영문명과 예약정보에 입력된 영문명이 다를 경우, 구매처로 문의 바랍니다. ");
				result = false;
				return false;
			}
			
			// 여권만료일 오늘 이후 일자인지 체크
			let pDate = $(docContainer).find("[name=txtYear]").val() + ("0" + $(docContainer).find("[name=selMonth]").val()).slice(-2) + ("0" + $(docContainer).find("[name=selDate]").val()).slice(-2);
			let psgrName = getPassengerName(inputLastName, inputFirstName);
			let today = dUtil.toDate();
			if(Number(today) >= Number(pDate)) {
				showAlert(psgrName + "님의 여권만료일을 오늘 이후 일자로 선택하여 주십시오.");
				result = false;
				return false;
			}
		}
		if(isAdultPassenger(idx)) {
			adtCnt++;	
		}
	});
		
	// 만 19세 미만
	if(result && adtCnt <= 0) {
		// 만 {19}세 미만 승객은 국토부 지침에 따라 셀프체크인 이용이 불가하오니 공항 카운터에서 수속하여 주시기 바랍니다. (만 {19}세 미만의 승객이 체크인 시에는 성인과 함께 수속하여야 합니다.)
		showAlert(BIZ_COMMONS_SCRIPT.getI18n('0000000552.msg00047').replace('{0}', 19) + BIZ_COMMONS_SCRIPT.getI18n('0000000552.msg00048').replace('{0}', 19));
		result = false;
		return false;
	}
	
	return result;
}

function setTripType(pJourneys) {
	let jLength = pJourneys.length;
	if(jLength == 1){
		return "OW";
	} else if (jLength == 2){
		if(pJourneys[0].designator.origin == pJourneys[1].designator.destination && pJourneys[0].designator.destination == pJourneys[1].designator.origin){
			return "RT";
		} else {
			return "MT";
		}
	} else {
		return  "MT";
	}
}

// 미주노선 체류지 select box 셋팅
function setAddress(pArrStn) {
	let strHtml = "<option value=''>" + BIZ_COMMONS_SCRIPT.getI18n('0000000552.msg00018') + "</option>"; // 선택
	let arrAddress = [];
	let reqData = {
		codeType : "address",
		cultureCode : I18N.language + "-" + I18N.country,
		arrStn : pArrStn
	};
	$.ajax({
		async : false,
		type : "post",
		url : "getCheckInCommonCode.json",
		data : {
			commonCodeReq : JSON.stringify(reqData)
		},
		success : function(data) {
			if(data.data.code == "0000") {
				arrAddress = data.data.data.addresses;
			}
		},
		error : function(request, status, error) {
		}
	});
	
	if(arrAddress.length > 0) {
		for(let i = 0 ; i < arrAddress.length ; i++) {
			strHtml += '<option value="' + arrAddress[i].stayAddr + '" data-stateAddr="' + arrAddress[i].stateAddr + '" data-cityName="' + arrAddress[i].cityName + '" data-zipCode="' + arrAddress[i].zipCode + '">' + arrAddress[i].stayAddr + '</option>';
		}
	}
	strHtml += '<option value="direct">직접 입력</option>';
	$("[name=selAddress]").html(strHtml);
}

// 입력한 승객 정보 셋팅
function getPassengerInfo(pageType) {
	
	let arrPsgr = [];
	$.each($("[id^=divPsgrContainer]"), function(idx, item) {
		let psgrObj = {};
		let divBirth = $("#divBirth"+idx);
		psgrObj.passengerTypeCode = $(item).find("[name=passengerTypeCode]").val();
		psgrObj.passengerKey = $(item).find("[name=passengerKey]").val();
		psgrObj.customerNumber = sUtil.nvl($(item).find("[name=customerNumber]").val(), '');
		psgrObj.travelDocument = {};
		psgrObj.travelDocument.passengerTravelDocumentKey = $(item).find("[name=passengerTravelDocumentKey]").val();
		psgrObj.passengerAlternateKey = sUtil.nvl($(item).find("[name=passengerAlternateKey]").val(), '');
		// 화면에 따라 생년월일 형식 맞춤
		if(pageType == "A") {
			psgrObj.travelDocument.dateOfBirth = $(divBirth).find("[name=txtYear]").val() + ("0" + $(divBirth).find("[name=selMonth]").val()).slice(-2) + ("0" + $(divBirth).find("[name=selDate]").val()).slice(-2);
		} else {
			psgrObj.travelDocument.dateOfBirth = $(divBirth).find("[name=txtYear]").val() + "-" + ("0" + $(divBirth).find("[name=selMonth]").val()).slice(-2) + "-" + ("0" + $(divBirth).find("[name=selDate]").val()).slice(-2);
		}
		
		if(domIntType == "D") {
			psgrObj.travelDocument.name = {
				last : $(item).find("[name=txtLastName]").val(),
				first : $(item).find("[name=txtFirstName]").val()
			};
			psgrObj.travelDocument.nationality = $(item).find("[name=hidNationality]").val();
		} else {
			let divPassport = $("#divPassport"+idx);
			psgrObj.travelDocument.expirationDate = $(divPassport).find("[name=txtYear]").val() + "-" + ("0" + $(divPassport).find("[name=selMonth]").val()).slice(-2) + "-" + ("0" + $(divPassport).find("[name=selDate]").val()).slice(-2);
			psgrObj.travelDocument.nationality = $(item).find("[name=hidNationality]").val();
			psgrObj.travelDocument.birthCountry = $(item).find("[name=hidNationality]").val();
			psgrObj.travelDocument.issuedByCode = $(item).find("[name=hidIssuedByCode]").val();
			psgrObj.travelDocument.number = $(item).find("[name=txtPassport]").val();
			psgrObj.travelDocument.name = {
				last : $(item).find("[name=txtEngLastName]").val(),
				first : $(item).find("[name=txtEngFirstName]").val()
			};
			psgrObj.travelDocument.gender = $(item).find("[name=rdoGender" + idx + "]:checked").val() == "M" ? 1 : 2;
			
			if(amFlag) {
				psgrObj.address = {};
				
				psgrObj.address.passengerAddressKey = $(item).find("[name=passengerAddressKey]").val();
				psgrObj.address.lineOne = $(item).find("[name=selAddress]").val() == "direct" ? $(item).find("[name=txtAddressDirect]").val() : $(item).find("[name=selAddress]").val();
				psgrObj.address.provinceState = $(item).find("[name=txtProvinceState]").val();
				psgrObj.address.city = $(item).find("[name=txtCity]").val();
				psgrObj.address.postalCode = $(item).find("[name=txtPostalCode]").val();
				psgrObj.address.stationCode = checkinInfo.journeys[journeyNo].designator.destination;
			}
		}
		arrPsgr.push(psgrObj);
	});
	return arrPsgr;
}

function getPassportData(pPassportData) {
	let psgrContainer = $("[id^=divPsgrContainer].is-active");
	let psgrNo = $(psgrContainer).attr("id").replace(/[^0-9]/gi, "");
	let divBirth = $("#divBirth" + psgrNo);
	let docContainer = $("#divPassport" + psgrNo);
	let issuedByCode = sUtil.nvl(getNationalityName(pPassportData.issuedByCode), "");
	let birthCountry = sUtil.nvl(getNationalityName(pPassportData.birthCountry), "");
	
	$(psgrContainer).find("[name=txtEngLastName]").val(sUtil.nvl(pPassportData.name.last, ""));
	$(psgrContainer).find("[name=txtEngFirstName]").val(sUtil.nvl(pPassportData.name.first, ""));
	setPassengerTab($(psgrContainer));
	
	let gender = sUtil.nvl(pPassportData.gender, "1")  == "1" ? "M" : "F"; 
	$(psgrContainer).find("#rdoGender" + gender + psgrNo).prop("checked", true);
	
	if(pPassportData.dateOfBirth.length >= 8) {
		pPassportData.dateOfBirth = pPassportData.dateOfBirth.replace(/[^0-9]/gi, "");
		$(divBirth).find("[name=txtYear]").val(pPassportData.dateOfBirth.substr(0, 4));
		$(divBirth).find("[name=selMonth]").val(Number(pPassportData.dateOfBirth.substr(4, 2))).trigger("change");
		$(divBirth).find("[name=selDate]").val(Number(pPassportData.dateOfBirth.substr(6, 2)));
	} else {
		$(divBirth).find("[name=txtYear]").val("");
		$(divBirth).find("[name=selMonth]").val("").trigger("change");
		$(divBirth).find("[name=selDate]").val("").trigger("change");
	}

	$(psgrContainer).find("[name=txtPassport]").val(sUtil.nvl(pPassportData.number), "");
	$(psgrContainer).find("[name=hidNationality]").val(sUtil.nvl(birthCountry, ""));
	$(psgrContainer).find("[name=btnNationality]").text(sUtil.nvl(getNationalityName(birthCountry), "")).addClass("active");
	$(psgrContainer).find("[name=hidIssuedByCode]").val(sUtil.nvl(issuedByCode, ""));
	$(psgrContainer).find("[name=btnIssuedByCode]").text(sUtil.nvl(getNationalityName(issuedByCode), "")).addClass("active");
	
	if(!sUtil.isEmpty(pPassportData.expirationDate) && pPassportData.expirationDate.length >= 8) {
		pPassportData.expirationDate = pPassportData.expirationDate.replace(/[^0-9]/gi, "");
		$(docContainer).find("[name=txtYear]").val(pPassportData.expirationDate.substr(0, 4));
		$(docContainer).find("[name=selMonth]").val(Number(pPassportData.expirationDate.substr(4, 2))).trigger("change");
		$(docContainer).find("[name=selDate]").val(Number(pPassportData.expirationDate.substr(6, 2))).trigger("change");
	} else {
		$(docContainer).find("[name=txtYear]").val("");
		$(docContainer).find("[name=selMonth]").val("").trigger("change");
		$(docContainer).find("[name=selDate]").val("").trigger("change");
	}
	
	// 값이 있는 input 라벨처리
	$.each($(psgrContainer).find("[data-element=input]"), function(idx, pKey) {
		if(!sUtil.isEmpty($(pKey).val())) {
			$(pKey).closest("[data-element=form]").parent('.input-box').addClass('label-active');
		}
	});
	$.each($(psgrContainer).find("select"), function(idx, pKey) {
		if(!sUtil.isEmpty($(pKey).val())) {
			$(pKey).addClass("selected");
		}
	});
}

function getPassengerName(pLast, pFirst) {
	let rtnName = "";
	if(I18N.country == "KR" || I18N.country == "JP") {
		rtnName = pLast + "/" + pFirst;
	} else {
		rtnName = pFirst + "/" + pLast;
	}
	return rtnName;
}

function showAlert(message) {
	$("#modalAlert .alert-text").text(message);
	fullPopOpen("modalAlert");
}


// 국제선일 경우 탑승객 선택 탭에 이름 표기
function setPassengerTab(obj) {
	let psgrNo = $(obj).attr("id").replaceAll(/[^0-9]/g, "");
	let lastName = $("#txtEngLastName" + psgrNo).val();
	let firstName = $("#txtEngFirstName" + psgrNo).val();
	
	if(lastName == "" && firstName == "") { 
		$("#psgrTab" + psgrNo + " .name").html("");
	} else {
		$("#psgrTab" + psgrNo + " .name").html(lastName + '/' + firstName);
	}
}

$(document).ready(function() {
	// 국제선일 경우 영문 성, 이름, 여권정보, 미주노선 체류지 셋팅
	if(domIntType == "I") {
		$("[name=txtEngLastName], [name=txtEngFirstName]").on("input",function(evt){
			let position = $(evt.target).prop("selectionStart");
			$(evt.target).val(sUtil.trim($(evt.target).val().toUpperCase()));
			sUtil.engUpper($(evt.target));
			setPassengerTab($(evt.target));
			$(evt.target).trigger("change");
			$(evt.target).prop("selectionStart", position);
			$(evt.target).prop("selectionEnd", position);
		});
	
		$("[name=txtPassport]").on("input change",function(evt){
			let position = $(evt.target).prop("selectionStart");
			sUtil.alphaNumeric($(evt.target));
			$(evt.target).val($(evt.target).val().toUpperCase());
			$(evt.target).prop("selectionStart", position);
			$(evt.target).prop("selectionEnd", position);
		});
		
		if(amFlag) {
			// 미주노선 체류지 직접 입력 란 show/hide
			$('.js-select-addr').on('change', function () {
				let thisVal = $(this).val();
				if (thisVal == 'direct') {
					$('.input-row.direct').removeClass('hide');
					$('.input-row.fake').remove();
				} else if($('.input-row.direct').siblings(".input-row.fake").length <= 0){
					$('.input-row.direct').addClass('hide').before('<div class="input-row fake"></div>');
				}
		    });
	
			// 미주노선 체류지 직접 입력 시 특수문자 불가
			$("[name=txtAddressDirect]").on("input change", function(){
				$(this).val($(this).val().replace(/[^A-Za-z0-9\s]/gi, "").toUpperCase());
			});
			
			// 우편번호 숫자만 입력가능하도록 설정
			$("[name=txtPostalCode]").on("input change", function() {
				$(this).val($(this).val().replace(/[^0-9]/gi, ""));
			});
		}
		
		// 앱인 경우에만 여권스캔 버튼 노출
		if(!USER_DEVICE.isApp()) {
			$("[id^=divScan]").remove();
		} else {
			$("button[name=btnScanPassport]").click(function() {
				APPCALL.callPassport();
			});
		}
	}
	
	// 생년월일, 여권만료일 연도 입력 설정
	$("[name=txtYear]").on("input change", function() {
		$(this).val($(this).val().replaceAll(/[^0-9]/g, ""));
	});
	
	// 생년월일, 여권만료일 월 value 변경 시 일 설정
	$("[name=txtYear], [name=selMonth]").on("change", function() {
		let birthObj = $(this).parent().parent().parent();
		
		if(!sUtil.isEmpty($(birthObj).find("[name=txtYear]")) && $(birthObj).find("[name=txtYear]").val().length == 4) {
			let year = $(birthObj).find("[name=txtYear]").val();
			let month = $(birthObj).find("[name=selMonth]").val();
			let date = sUtil.nvl($(birthObj).find("[name=selDate]").val(), '');
			let lastDate = new Date(year, month, 0).getDate();
			let strHtml = "<option value=''>" + BIZ_COMMONS_SCRIPT.getI18n('0000000552.msg00066') + "</option>";

			for(let i = 0 ; i < lastDate ; i++) {
				strHtml += '<option value="' + (i+1) + '">' + (i+1) + '</option>';
			}

			$(birthObj).find("[name=selDate]").html(strHtml);

			if(lastDate > date) {
				$(birthObj).find("[name=selDate]").val(date).addClass("selected");
			}
		}
	});

	// remove 버튼 클릭 시
	$("button[data-element=remove]").on("click", function() {
		let btnObj = $(this);
		setTimeout(function() {
			$(btnObj).prev().trigger("change");
			$(btnObj).prev().focus();
		}, 0);
	});
	
	// 필수 입력 값 입력 체크
	$(":required, [name=hidNationality], [name=hidIssuedByCode]").on("change", function() {
		let psgrNo = $(this).attr("id").replace(/[^0-9]/g, "");
		let result = false;

		if(!sUtil.isEmpty($(this).val())) {
			result = checkPsgrInput(psgrNo);
		} else {
			let psgrTab = $("#psgrTab" + psgrNo).children("button");
			if($(psgrTab).hasClass("is-checked")) {
				$(psgrTab).removeClass("is-checked");
			}
		}
		checkInputComplete(result);
	});
	
	BIZ_COMMONS_SCRIPT.callI18n("0000000552", initPassengerInput);
});
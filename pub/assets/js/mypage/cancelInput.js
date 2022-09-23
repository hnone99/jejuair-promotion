/**
 * ECON 취소, 편의점 결제, 계좌이체, 180일 이후 환불 시 환불 정보 입력
 */

let arrRefundInfo = [];	// 입력한 환불 정보가 저장될 변수
let arrPaymentInfo = [];// 환불 정보 필요한 payment 정보

$(document.body).append('<div id="modalBTInput" class="modal modal-full modal--fixed-multi modal-scroll"></div>');
$(document.body).append('<div id="modalECONInput" class="modal modal-full modal--fixed-multi modal-scroll"></div>');

// 환불정보 입력이 필요한지 체크
let initPaymentInfo = function(pPnrData) {
	if(sUtil.isEmpty(pPnrData.refundPayments))	return false;
	let pRefundPayments = pPnrData.refundPayments;
	let pRecordLocator = pPnrData.recordLocator;
	let pNumericLocator = pPnrData.locators.numericRecordLocator;
	arrRefundInfo = [];
	arrPaymentInfo = [];
	
	for(let i = 0 ; i < pRefundPayments.length ; i++) {
		let refundPaymentObj = pRefundPayments[i];
		
		let tmpObj = {};
		if(refundPaymentObj.code == "CL") {
			if(refundPaymentObj.subCode == "KC") {	// 실시간 계좌이체
				if(is180DaysLater(pPnrData.payments)) {
					tmpObj.type = "C";
					tmpObj.amount = Math.abs(refundPaymentObj.refundAmount);
					tmpObj.currency = refundPaymentObj.currencyCode;
				}
			} else if(refundPaymentObj.subCode == "CP") {	// 편의점 결제
				tmpObj.type = "B";
				tmpObj.amount = Math.abs(refundPaymentObj.refundAmount);
				tmpObj.currency = refundPaymentObj.currencyCode;
			}
		} else if(refundPaymentObj.code == "EA") {// ECON 결제
			tmpObj.type = "A";
			tmpObj.amount = Math.abs(refundPaymentObj.refundAmount);
			tmpObj.currency = refundPaymentObj.currencyCode;
		} else if((refundPaymentObj.code == "EB" || refundPaymentObj.code == "EC" || refundPaymentObj.code == "ET") && checkEconDate()) { // 202205_Payment 개선 프로젝트 - 23/01/11 이후 ECON 카드 취소 시 현금 환불 
			tmpObj.type = "A";
			tmpObj.amount = Math.abs(refundPaymentObj.refundAmount);
			tmpObj.currency = refundPaymentObj.currencyCode;
		}

		
		if(!sUtil.isEmpty(tmpObj) && tmpObj.amount > 0) {
			tmpObj.recordLocator = pRecordLocator;
			tmpObj.numericLocator = pNumericLocator;
			arrPaymentInfo.push(tmpObj);
		}
	}

	if(arrPaymentInfo.length > 0) {
		openCancelInputPop(arrPaymentInfo[0]);
		return true;
	} else {
		return false;
	}
}

// 계좌이체 시 결제 후 180일 지났는지 확인
let is180DaysLater = function(pPayments) {
	let result = false;
	let nowObj = new Date(); //local 시간 
	
	for(let i = 0 ; i < pPayments.length ; i++) {
		if(pPayments[i].status == "Approved" && pPayments[i].code == "CL" && !sUtil.isEmpty(pPayments[i].details.fields["Jeju::OrderID"])
				&& pPayments[i].details.fields["Jeju::OrderID"].substr(0,2) == "KC") {
			let bookDateObj = new Date(pPayments[i].approvalDate);
			let diffDate = Math.ceil((nowObj.getTime() - bookDateObj.getTime()) /(1000*3600*24));
			if(diffDate >= 180) {
				result = true;
			}
		}
	}
	
	return result;
};

// 환불정보 저장 후 입력 완료 체크
let setRefundInfo = function(refundObj, processType) {
	arrRefundInfo.push(refundObj);
	if(arrRefundInfo.length == arrPaymentInfo.length) {
		if (processType === 'Exchange') {
			fnRebook(arrRefundInfo);
		} else {
			cancelConfirm(arrRefundInfo);
		}
	} else {
		openCancelInputPop(arrPaymentInfo[arrRefundInfo.length]);
	}
};

// 환불정보 입력 modal open
let openCancelInputPop = function(pPaymentInfoObj) {
	let pType = pPaymentInfoObj.type;
	let strAmount = sUtil.setComma(Number(pPaymentInfoObj.amount).toFixed(2));
	if(I18N.language == "ko" && pPaymentInfoObj.currency == "KRW") {
		strAmount += "원";
	} else if(pPaymentInfoObj.currency == "PNT") {
		strAmount += "P";
	} else {
		strAmount = pPaymentInfoObj.currency + " " + strAmount;
	}
	if(pType == "A") {
		$.ajax({
			async : false,
			type : "post",
			url : "viewCancelECONInput.do",
			data : {
				amount : strAmount,
				currency : pPaymentInfoObj.currency,
				numericLocator : pPaymentInfoObj.numericLocator,
				recordLocator : pPaymentInfoObj.recordLocator,
				type : pType
			},
			success : function(data) {
				$("#modalECONInput").html(data);
			}
		});

		fullPopOpen('modalECONInput');
	} else {
			
		$.ajax({
			async : false,
			type : "post",
			url : "viewCancelBTInput.do",
			data : {
				amount : strAmount,
				currency : pPaymentInfoObj.currency,
				numericLocator : pPaymentInfoObj.numericLocator,
				recordLocator : pPaymentInfoObj.recordLocator,
				type : pType
			},
			success : function(data) {
				$("#modalBTInput").html(data);
				
			}
		});
		fullPopOpen('modalBTInput');
	}
};

// 전화번호 포멧 적용
let inputPhoneNo = function(obj) {
	let strPhone = $(obj).val().replace(/[^0-9]/gi, "");
	if(strPhone.length > 8) {
		$(obj).val(sUtil.fmtHpNum(strPhone));
	}
};

let focusPhoneNo = function(obj) {
	let strPhone = $(obj).val().replace(/[^0-9]/gi, "");
	$(obj).val(strPhone);
};

let checkEmailValidation = function(obj) {
	let result = true;
	let objId = $(obj).attr("id");
	if(!sUtil.emailCheck(objId)) {
		$(obj).parents(".input-item").addClass("input--error");
		result = false;
	}
	return result;
};

// 202205_Payment 개선 프로젝트 - 23/01/11 이후 ECON 카드 취소 시 현금 환불 
let checkEconDate = function() {
	return parseInt(dUtil.toDate()) >= 20230112;
};
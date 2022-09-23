let receiveCodeObj, receiveNameObj; // receive 객체 변수
let mapCountryCode = [];

$.ajax({
	async : false,
	type : "post",
	url : "../../ibe/layer/getCountryCode.json",
	data : {
		type : "N",
		langCode : I18N.language
	},
	success : function(data) {
		mapCountryCode = data.data;
	}
});

$(document).ready(function() {
	$(document.body).append('<div id="modalCountry" class="modal modal-full CO_1_1 modal-scroll"></div>');
	$(document.body).append('<div id="modalNationality" class="modal modal-full CO_1_1 modal-scroll"></div>');
});

function getNationalityName(pNationalityCode) {
	return sUtil.nvl(mapCountryCode[pNationalityCode], pNationalityCode);
}

function openLayerCountry(pLangCode, pReceiveCodeObj, pReceiveNameObj) {
	receiveCodeObj = pReceiveCodeObj;
	receiveNameObj = pReceiveNameObj;
	$.ajax({
		async : false,
		type : "post",
		url : "../../ibe/layer/viewLayerCountry.do",
		data : {
			type : "C",
			langCode : pLangCode
		},
		success : function(data) {
			$("#modalCountry").html(data);
			fullPopOpen("modalCountry");
		}
	});
}

function openLayerNationality(pLangCode, pReceiveCodeObj, pReceiveNameObj) {
	receiveCodeObj = pReceiveCodeObj;
	receiveNameObj = pReceiveNameObj;
	$.ajax({
		async : false,
		type : "post",
		url : "../../ibe/layer/viewLayerNationality.do",
		data : {
			type : "N",
			langCode : pLangCode
		},
		success : function(data) {
			$("#modalNationality").html(data);
			fullPopOpen("modalNationality");
		}
	});
}

function selectCountryCode(pName, pCode) {
	$(receiveNameObj).text("+" + pName).addClass("active");
	$(receiveCodeObj).val(pCode).trigger("change");
}

function selectNationalityCode(pName, pCode) {
	$(receiveNameObj).text(pName).addClass("active");
	$(receiveCodeObj).val(pCode).trigger("change");
}
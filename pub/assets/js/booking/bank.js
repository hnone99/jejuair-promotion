/**
 * 은행 및 증권가 선택
 */
let receiveNameObj, receiveCodeObj;

function openLayerBank(pLangCode, pReceiveCodeObj, pReceiveNameObj) {
	receiveCodeObj = pReceiveCodeObj;
	receiveNameObj = pReceiveNameObj;
	$.ajax({
		async : false,
		type : "post",
		url : "../../ibe/layer/viewLayerBank.do",
		data : {
			langCode : pLangCode
		},
		success : function(data) {
			$("#modalBank").html(data);
			$('.tab.tab--default.tab-bank').tab();
			fullPopOpen('modalBank');
		},
		error : function(request, status, error) {
			alert("viewLayerCountry.do error");
		}
	});
}

function selectBank(pName, pCode) {
	$(receiveNameObj).text(pName);
	$(receiveCodeObj).val(pCode).trigger("change");
}

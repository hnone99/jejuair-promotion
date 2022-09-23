$(document).ready(function() {
	// 예약변경 유의사항 동의 체크박스 클릭
	$(document).on('click', '#agree', function() {
		if ($(this).prop('checked')) {
			$(this).prop('checked', false);
			openModal("#resChangeInfoModalLayer", "full");
		}
	});
	
	// 팝업창 속 확인 클릭
	$(document).on('click', '#resButton', function() {
		$('#agree').prop('checked', true).trigger('change');
		$.modal.close();
	});
	
	const openModal = function(mTarget, mType) {
		$("#btnModalOpen").data("target", mTarget);
		$("#btnModalOpen").data("modal-type", mType);
		$("#btnModalOpen").trigger("click");
	};
		
});	// ready



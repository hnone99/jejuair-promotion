$(document).ready(function() {
	$(document).on('click', '#myJPassLook', function() {
		alert("JPass 구경하기 준비 중");
	});

});	// ready

// modal open 함수 
let openModal = function(mTarget, mType) {
	if($.modal.isActive()) {
		$.modal.close();
	}
	$("#btnModalOpen").data("target", mTarget);
	$("#btnModalOpen").data("modal-type", mType);
	$("#btnModalOpen").trigger("click");
};
// JPass 상세보기
let openDetail = function() {
	openModal("#myJPassDetailModalLayer", "full");
	
}
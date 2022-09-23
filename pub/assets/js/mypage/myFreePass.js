let ticketListInfo = [];
$(document).ready(function() {
	$(document).on('click', '#myFreePassLook', function() {
		alert("프리패스 구경하기 준비 중");
	});
	
	// 구매취소 페이지
	$(document).on('click', '#purCancel', function() {
		$('#formPurCancel').attr({
			'method'	: 'post',
			'onsubmit' 	: 'return true',
			'action' 	: 'viewCancelFreePass.do'
		}).submit();
	});
	
	if(voucherList.length > 0) {
		setSelectBox();
		setTotalCount();
		setContents();
	}
	
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
	

// 프리패스 상세보기
let openDetail = function(index) {
	const ticket = ticketListInfo[index];
	const voucherName = ticket.voucherName;				// 티켓명
	const voucherBasisCode = ticket.voucherBasisCode;	// 코드
	const createdDate = ticket.createdDate;				// 사용기간
	const expirationDate = ticket.expirationDate;
	const depDateFrom = ticket.depDateFrom;				// 출발가능기간
	const depDateTo = ticket.depDateTo;
	const totCnt = ticket.totCnt;						// 전체횟수
	const useCnt = ticket.useCnt;						// 사용횟수
	let reCnt = totCnt - useCnt; 					 	// 남은횟수
	
	const voucherStatus = ticket.voucherStatus;
	const purStatus = ticket.purStatus;					// 상태

	let useDate = dUtil.cvtDate(createdDate ,"y.m.d")+" ~ "+dUtil.cvtDate(expirationDate ,"y.m.d"); // 사용기간
	let startDate = dUtil.cvtDate(depDateFrom ,"y.m.d")+" ~ "+dUtil.cvtDate(depDateTo ,"y.m.d"); // 출발가능기간
	let statusName = "";
	// 이용일자 현재날짜 비교
	let date = new Date();
    let year = date.getFullYear();
    let month = ("0" + (1 + date.getMonth())).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);
	let toDay = year+'-'+month+'-'+day;
	let expDate = dUtil.cvtDate(expirationDate ,"y-m-d"); // 사용기간 끝 날짜
	
	if(voucherStatus === "0"){
		statusName = "사용가능"
	} else if(voucherStatus === "1"){
		statusName = "사용불가"
	} else if(voucherStatus === "2"){
		statusName = "사용완료"
	} else if(voucherStatus === "3"){
		statusName = "기간만료"
	} else if(purStatus === "P") {
		statusName = "사용가능"
	} else if(purStatus === "C") {
		statusName = "사용불가"
	} else {
		statusName = "상태없음"
	}
	
	// 구매취소 가능
	if(useCnt === 0 && expDate > toDay && (voucherStatus === "0" || purStatus === "P")){
		$("#purCancelDiv").show();
	} else {
		$("#purCancelDiv").hide();
	}
	
	$("#voucherName").text(voucherName); 					// 티켓명
	$("#voucherBasisCode").text(voucherBasisCode);			// 티켓번호
	$("#statusName").text(statusName+" ("+reCnt+"회 남음)");	// 바우처상태 (0:Available(미사용), 1:Void(사용불가), 2:Redeemed(사용완료), 3:Expired(기간만료)) // 구매상태 (P:구매, C:취소)
	$("#useDate").text(useDate);							// 사용가능일
	$("#startDate").text(startDate);						// 출발가능기간
	$("#useCnt").text(useCnt+" 회");							// 사용횟수
							
	openModal("#myFreePassDetailModalLayer", "full");
	
}

const selectSearchEl = $(".search-result .search-result__header .select-wrap__select")[0];
const totalCountEl = $(".search-result .search-result__header .search-result__total")[0];
const contentsEl = $(".search-result .search-result__contents .anchor-list")[0];

const setSelectBox = function() {
	const reducedVoucherList = voucherList.reduce(function (prev, curr) {
		let exists = false;
		for (let i in prev) {
			if (prev[i].status === curr.voucherStatus || prev[i].status === curr.purStatus ) {
				exists = true; break;
			}
		}
		if (!exists) {
			prev.push({ status: curr.voucherStatus, purStatus: curr.purStatus });
		}
	  	
		return prev;
	}, []);
	
		
	for (let i in reducedVoucherList) {
		if (reducedVoucherList[i]['purStatus'] === "C") {
			selectSearchEl.innerHTML += '<option value="C">구매취소</option>'; break;
		} else if(reducedVoucherList[i]['purStatus'] === "P"){ 
			selectSearchEl.innerHTML += '<option value="P">사용가능</option>'; break;
			
		} else {
			switch (reducedVoucherList[i]['status']) {
				case "0":
					selectSearchEl.innerHTML += '<option value="0">사용가능</option>'; break;
				case "2":
					selectSearchEl.innerHTML += '<option value="2">사용완료</option>'; break;
				case "3":
					selectSearchEl.innerHTML += '<option value="3">기간만료</option>'; break;
				default:
					selectSearchEl.innerHTML += '<option value="">사용불가</option>'; break;
			}
		}
	}
}

const setTotalCount = function(selectedVoucherStatus) {
	let vList = voucherList;
	if (selectedVoucherStatus) {
		vList = voucherList.filter(function (e) {
			return (e.voucherStatus === selectedVoucherStatus || e.purStatus === selectedVoucherStatus);
		});
	}
	totalCountEl.innerHTML = '총 <strong>' + vList.length + '</strong>건';
}

const setContents = function(selectedVoucherStatus) {
	let vList = voucherList;
	if (selectedVoucherStatus) {
		vList = voucherList.filter(function (e) {
			return (e.voucherStatus === selectedVoucherStatus || e.purStatus === selectedVoucherStatus);
		});
	}
	
	let innerHTML = '';
	ticketListInfo=[];
	for (let i in vList) {
		ticketListInfo.push(vList[i]);
		innerHTML += '<a href="#none" class="anchor-list__item" onclick="openDetail('+ i +')"><div class="pc-top">';
		if (vList[i].purStatus === "C") {
			innerHTML += '<div class="anchor-list__label anchor-list__label-label02">구매취소</div>';
		} else if (vList[i].purStatus === "P") {
			innerHTML += '<div class="anchor-list__label anchor-list__label-label01">사용가능</div>';
			
		} else {
			switch (vList[i].voucherStatus) {
				case "0":
					 innerHTML += '<div class="anchor-list__label anchor-list__label-label01">사용가능</div>'; break;
				case "2":
					 innerHTML += '<div class="anchor-list__label anchor-list__label-label02">사용완료</div>'; break;
				case "3":
					 innerHTML += '<div class="anchor-list__label anchor-list__label-label02">기간만료</div>'; break;
				default:
					 innerHTML += '<div class="anchor-list__label anchor-list__label-label02">상태없음</div>'; break;	
			}
		}
		innerHTML += '<div class="anchor-list__title">' + vList[i].voucherName + '</div>';
		innerHTML += '</div>';
		innerHTML += '<div class="anchor-list__date">' + dUtil.cvtDate(vList[i].createdDate ,"y.m.d") + ' ~ ' + dUtil.cvtDate(vList[i].expirationDate ,"y.m.d") + '</div>';
		innerHTML += '</a>';		
	}
	
	contentsEl.innerHTML = innerHTML;
}

const changeVoucherList = function() {
	let selectedVoucherStatus = selectSearchEl.options[selectSearchEl.selectedIndex].value;
	if (selectedVoucherStatus === "") {
		selectedVoucherStatus = undefined;
	}
	setTotalCount(selectedVoucherStatus);
	setContents(selectedVoucherStatus);
}



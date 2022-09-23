let userInfo = JSON.parse(USER_INFO.get());

function openMyFriendsList() {
	$.ajax({
		async : false,
		type : "post",
		url : "viewMyFriendsList.do",
		data : {
			langCode : I18N.language,
			mbrId : userInfo.userId
		},
		success : function(data) {
			$("#modalMyFriendsList").html(data);
		}
	});
	fullPopOpen("modalMyFriendsList");
}

function openMyFriendsDetail(pFriendData) {
	$.ajax({
		async : false,
		type : "post",
		url : "viewMyFriendsDetail.do",
		data : {
			type : "N",
			langCode : I18N.language,
			mbrId : userInfo.userId,
			friendData : JSON.stringify(pFriendData)
		},
		success : function(data) {
			$("#modalMyFriendsDetail").html(data);
		}
	});
	fullPopOpen("modalMyFriendsDetail");
}

function openUpdateFriend(flag, pUserId, pFriendData) {
	$.ajax({
		async : false,
		type : "post",
		url : "viewAddMyFriends.do",
		data : {
			mbrId : pUserId,
			pageFlag : flag,
			friendData : sUtil.nvl(pFriendData, '')
		},
		success : function(data) {
			$("#modalAddMyFriends").html(data);
		}
	});
	fullPopOpen("modalAddMyFriends");
}

function reloadMyFriendsList() {
	if(!$("#modalMyFriendsList").prop("hidden")) {
		closeModal("modalMyFriendsList");
		openMyFriendsList();
	}
}

function addFriend(pFriendObj) {
	let result = false;
	$.ajax({
		async : false,
		type : "post",
		url : "addFriend.json",
		data : {
			friendReq : JSON.stringify(pFriendObj)
		},
		success : function(data) {
			if(!sUtil.isEmpty(data.data) && data.data.addCount > 0) {
				result = true;
			}
		}
	});
	return result;
}
function updateFriend(pFriendObj) {
	let result = false;
	$.ajax({
		async : false,
		type : "post",
		url : "updateFriend.json",
		data : {
			friendReq : JSON.stringify(pFriendObj)
		},
		success : function(data) {
			if(!sUtil.isEmpty(data.data) && data.data.updateCount > 0) {
				result = true;
			}
		}
	});
	return result;
}

function deleteFriend(pUserId, pFriendNo) {
	let result = false;
	$.ajax({
		async : false,
		type : "post",
		url : "deleteFriend.json",
		data : {
			mbrId : pUserId,
			friendNo : pFriendNo
		},
		success : function(data) {
			if(!sUtil.isEmpty(data.data) && data.data.deleteCount > 0) {
				result = true;
			}
		}
	});
	return result;
}
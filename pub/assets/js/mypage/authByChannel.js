let authByChannel = {
	"IBE_M" : {
		"journey" : true, //여정
		"fare" : true, //운임
		"fee" : true, //부가서비스
		"payment" : true, //결제내역
		"exchange" : true, //변경
		"cancel" : true, //취소  
		"untk" : true, //untk
		"balance" : true, //환불
		"infant" : true, //유아승객추가
		"onHold" : true, //나중에결제
		"addFee" : true, //부가서비스 추가구매
		"cancelFee" : true, //부 가서비스 취소
		"eticket" : true, //여정확인서
		"receipt" : true, //매출전표
		"btnFareInfo" : true //탑승객별 운임상세
	},
	"IBE_N" : {
		"journey" : true,
		"fare" : true,
		"fee" : true,
		"payment" : true,
		"exchange" : true,
		"cancel" : true,
		"untk" : true,
		"balance" : true,
		"infant" : true,
		"onHold" : true,
		"addFee" : true,
		"cancelFee" : true,
		"eticket" : true,
		"receipt" : true,
		"btnFareInfo" : true
	},
	"META_M" : {
		"journey" : true,
		"fare" : true,
		"fee" : true,
		"payment" : true,
		"exchange" : true,
		"cancel" : true,
		"untk" : true,
		"balance" : true,
		"infant" : true,
		"onHold" : true,
		"addFee" : true,
		"cancelFee" : true,
		"eticket" : true,
		"receipt" : true,
		"btnFareInfo" : true
	},
	"META_N" : {
		"journey" : true,
		"fare" : true,
		"fee" : true,
		"payment" : true,
		"exchange" : true,
		"cancel" : true,
		"untk" : true,
		"balance" : true,
		"infant" : true,
		"onHold" : true,
		"addFee" : true,
		"cancelFee" : true,
		"eticket" : true,
		"receipt" : true,
		"btnFareInfo" : true
	},
	"B2B" : {
		"journey" : true,
		"fare" : false,
		"fee" : true,
		"payment" : false,
		"exchange" : false,
		"cancel" : false,
		"untk" : false,
		"balance" : false,
		"infant" : false,
		"onHold" : false,
		"addFee" : false,
		"cancelFee" : false,
		"eticket" : false,
		"receipt" : false,
		"btnFareInfo" : false
	},
	"OTA" : {
		"journey" : true,
		"fare" : false,
		"fee" : true,
		"payment" : false,
		"exchange" : false,
		"cancel" : false,
		"untk" : false,
		"balance" : false,
		"infant" : false,
		"onHold" : false,
		"addFee" : true,
		"cancelFee" : true,
		"eticket" : false,
		"receipt" : false,
		"btnFareInfo" : false
	},
	"GDS" : {
		"journey" : true,
		"fare" : false,
		"fee" : true,
		"payment" : false,
		"exchange" : false,
		"cancel" : false,
		"untk" : false,
		"balance" : false,
		"infant" : false,
		"onHold" : false,
		"addFee" : true,
		"cancelFee" : true,
		"eticket" : false,
		"receipt" : false,
		"btnFareInfo" : false
	},
	"NDC" : {
		"journey" : true,
		"fare" : false,
		"fee" : true,
		"payment" : false,
		"exchange" : false,
		"cancel" : false,
		"untk" : false,
		"balance" : false,
		"infant" : false,
		"onHold" : false,
		"addFee" : false,
		"cancelFee" : false,
		"eticket" : false,
		"receipt" : false,
		"btnFareInfo" : false
	},
	"INTERLINE" : {
		"journey" : true,
		"fare" : false,
		"fee" : true,
		"payment" : false,
		"exchange" : false,
		"cancel" : false,
		"untk" : false,
		"balance" : false,
		"infant" : false,
		"onHold" : false,
		"addFee" : true,
		"cancelFee" : true,
		"eticket" : false,
		"receipt" : false,
		"btnFareInfo" : false
	},
	"CODESHARE" : {
		"journey" : true,
		"fare" : false,
		"fee" : true,
		"payment" : false,
		"exchange" : false,
		"cancel" : false,
		"untk" : false,
		"balance" : false,
		"infant" : false,
		"onHold" : false,
		"addFee" : true,
		"cancelFee" : true,
		"eticket" : false,
		"receipt" : false,
		"btnFareInfo" : false
	}
};

function getChannelTypeCode(rsResvDetail, userInfo, agentId){
	let channelTypeCode = "B2B";
	let isMember = false;
	
	if(Object.keys(userInfo).length > 0 && userInfo.customerNo != null){
		isMember = true;
	}
	
	let channelType = rsResvDetail.info.channelType;
	let organizationCode = rsResvDetail.sales.source.organizationCode;
	
	if(organizationCode == "7C"){
		if(isMember){
			channelTypeCode = "IBE_M";
		} else {
			channelTypeCode = "IBE_N";
		}
	} else if (channelType == "DigitalApi" || channelType == "Direct"){ //direct 데이터 확인
		if(organizationCode.substr(4, 1) == "3"){
			if(isMember){
				channelTypeCode = "META_M";
			} else {
				channelTypeCode = "META_N";
			}
		} else if(organizationCode.substr(4, 1) == "1"){
			channelTypeCode = "B2B";
		} else if(organizationCode.substr(4, 1) == "2"){
			channelTypeCode = "OTA";
		}
	 
	} else if(channelType == "Api" || channelType == "Ndc"){
		if(organizationCode.substr(4, 1) == "2"){
			channelTypeCode = "NDC";
		}
	} else if(channelType == "Gds"){
		if(organizationCode == "SYSTEM"){
			channelTypeCode = "GDS";
			
			for(let jdx in rsResvDetail.journeys){
				for(let sdx in rsResvDetail.journeys[jdx].segments){
					let segType = rsResvDetail.journeys[jdx].segments[sdx].segmentType;
					
					if(segType == "Passive"){
						channelTypeCode = "INTERLINE";
						break;
					} else if(segType == "CodShareMarketing" || segType == "CodShareOperating"){
						channelTypeCode = "CODESHARE";
						break;
					}
				}
				
				if (channelTypeCode != "GDS") {
					break;
				}
			}
		}
	} 
	
	if(agentId != ""){
		channelTypeCode = "OTA";
	}
	
	//CA 결제
	let isCA = false;
	
	for(let pdx in rsResvDetail.payments){
		if(rsResvDetail.payments[pdx].code == "CA"){
			isCA = true;
			
			break;
		}
	}
	
	if (isCA) {
		let targetAuth = ["exchange","cancel","infant","onHold","addFee","cancelFee","receipt"];
		
		for(let tdx in targetAuth){
			authByChannel[channelTypeCode][targetAuth[tdx]] = false;
		}
	}
	
	return channelTypeCode;
}

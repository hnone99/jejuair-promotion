BIZ_COMMONS_SCRIPT.callI18n("0000000466")
var autoCompleteAirport = function autoCompleteAirport(airportACData, sourceDatas) {
	var select = false;
	$('#'+airportACData.txtAirportId).autocomplete({
		appendTo : '#' + airportACData.divAirportACId,
		autoFocus: false,
		delay: 0,
		minLength: 1,
		source: sourceDatas,
		close: function() {
			$(this).removeClass('ui-corner-top').addClass('ui-corner-all');
			$(this).autocomplete('widget').find('li').remove();
		},
		open: function(event, ui) {
			$('ul[id^=ui-id]').css("width", "");
			$('ul[id^=ui-id]').css("top", "");
			$('ul[id^=ui-id]').css("left", "");
			$(this).removeClass('ui-corner-all').addClass('ui-corner-top');
		},
		select: function(event, ui) {
			//출도착지 자동 완성 결과 클릭시 값 저장
			if(ui.item) {
				if(event.target.id.indexOf("MultiDEP") > -1){
					ui.item.stationType ="MultiDEP"
				}else if(event.target.id.indexOf("MultiARR") > -1){
					ui.item.stationType ="MultiARR"
				}else if(event.target.id.indexOf("DEP") > -1){
					ui.item.stationType ="DEP"
				}else if(event.target.id.indexOf("ARR") > -1){
					ui.item.stationType ="ARR"
				}
				setAirportInfo(ui.item);				
			}
		},
		focus: function(event, ui) {
			return false;
		}
	}).focusout(function(event, ui) {
		$(this).val('');
		//$(this).next().next().next().find('div[name=search_auto] > ul').children().remove();
	}).keypress(function(event, ui) {
		var key = event.which || event.keyCode;
		if(key == 27) { // ESC Key
			$(this).val('');
		}else if(key == 13) { // ENTER Key
			if($(this).autocomplete('widget').find('li').length == 1) {
				event.preventDefault();
				$(this).autocomplete('widget').find('li').click();			
				return false;
			}
		}
	}).autocomplete('instance')._renderItem = function(ul, item) {
		$('span[aria-live="assertive"]').remove();	
    	if(navigator.userAgent.indexOf('Firefox') > -1) {
	        var targetId = ul.parent().attr('target'),target = $('#'+targetId);
	    	if(isKoreanChar(target.val())) {
	    		var $inner = ul.closest('.inner');
	    		$inner.find('div[name=search_lately]').hide();
	    		$inner.find('div[name=search_auto]').show();
	    	}
        }
    	let label,value;
		label = item.value;				
		var lowerLabel = label.toLowerCase();
		var tempTerm = this.term;	
		var insertFIndex = lowerLabel.search(tempTerm.toLowerCase());	
		if(insertFIndex > -1) {
			var insertLIndex = insertFIndex + this.term.length;			
			label = label.substr(0, insertLIndex) + '</span>' + label.substr(insertLIndex);
			label = label.substr(0, insertFIndex) + '<span class="match">' + label.substr(insertFIndex);
			label = '<span class="name">'+label + '</span>';
		}else {			
			label = '<span class="name">'+label + '</span>';
		}		
    	var $li	= $('<li/>').appendTo(ul);
        $('<div/>').addClass('predictive-search__item').html(label).appendTo($li);
        return $li;
	};
};

$(document).on('click', '.layer-close', function () {
	$(this).parent().slideUp(300);
	controlOtherEventDisabled(false);
});

function selectDepartureAirports(type) {
	$.ajax({
		//url: 'selectDepartureStations.json',
		url: searchUrl+'/'+ I18N.language +'/ibe/booking/selectDepartureStations.json',
		type: 'POST',
		data	: {
			bookType : bookType,
			cultureCode : cultureCode.replace("_","-")
		},    
		success: function (data) {
			paintAirports(data.data.data.stations , type);
		}
	});
}

function paintAirports(result , type) {
	const Airports = result;
	const uniqueAreaNames = getUniqueObjectArray(Airports, 'area');
	//공항 정보 paint 전 지역 , 공항 초기화 
	if(type==="DEP"){
		//Panel 초기화
		$("#divDepArea").eq(0).html("")	
		$("#divDepArea").next().html("")
		//Map 초기화
		$(".tab-top-list").eq(0).html("")
	}else if(type==="MultiDEP"){
		$("#divMultiDepArea").eq(0).html("")	
		$("#divMultiDepArea").next().html("")
	}else if(type==="ARR"){
		$("#divArrArea").eq(0).html("")	
		$("#divArrArea").next().html("")
		$(".tab-top-list").eq(1).html("")
	}else if(type==="MultiARR"){
		$("#divMultiArrArea").eq(0).html("")	
		$("#divMultiArrArea").next().html("")
	}	
	uniqueAreaNames.forEach(function(areaName , index) {
		let areaCode = "";
		for(let i=0; i<Airports.length; i++){
			if(Airports[i].area === areaName){
				areaCode = Airports[i].areaCode
				break;
			}
		}
		paintTabAnchor(index , areaName , areaCode ,type);
		paintTabPanel(index , areaName, Airports , type);		
	});
	var airportACData = {
		txtAirportId	: 'txt'+type+'Airport',
		divAirportACId	: 'div'+type+'AirportAC'
	};	
	autoCompleteAirport(airportACData , Airports)
	
	//tab plugin
	if(type==="DEP"){
		$("#divDepArea").closest(".main--destination-select").tab()
		if(window.location.href.indexOf('AvailSearch')==-1 ){
			if(navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(findNearestStore);	
			}
		}	
	}else if(type==="MultiDEP"){
		$("#divMultiDepArea").closest(".main--destination-select").tab()	
	}else if(type==="ARR"){
		$("#divArrArea").closest(".main--destination-select").tab()	
	}else if(type==="MultiARR"){
		$("#divMultiArrArea").closest(".main--destination-select").tab()	
	}
}

function findNearestStore(position) {
	if(typeof $("#departureData").data('stationcode') =='undefined'){
		let latitude = position.coords.latitude;
		let longitude = position.coords.longitude;
		let selectedIdx = 0;
		for(let i=0; i<$("#depAirportLayer").find('div.tab__panel-wrap').find('.choise__button').length; i++){
		    if (distance(latitude , longitude , $("#depAirportLayer").find('div.tab__panel-wrap').find('.choise__button').eq(i).data('latitude'), 
				$("#depAirportLayer").find('div.tab__panel-wrap').find('.choise__button').eq(i).data('longitude'), "K") <= 100) {
		        selectedIdx = i;
				break;
		    }
		}
		$("#depAirportLayer").data("target" , "spanDepartureDesc")
		$("#depAirportLayer").find('div.tab__panel-wrap').find('.choise__button').eq(selectedIdx).trigger('click');
	}
}

function distance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = Math.PI * lat1/180
  var radlat2 = Math.PI * lat2/180
  var theta = lon1-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  if (unit=="K") { dist = dist * 1.609344 }
  if (unit=="N") { dist = dist * 0.8684 }
  return dist
}

// 지역명의 중목 제거
function getUniqueObjectArray(array, key) {
	const unique = array.map(function (val, index) {
		return val[key];
	}).filter(function (val, index, arr) {
		return arr.indexOf(val) === index;
	});
	return unique;
}

function paintTabAnchor(index , areaName , areaCode , type) {	
	//첫번째 구간의 도착지의 국가와 두번째 구간의 출발지 국가가 동일해야함
	if(tripType ==='MT' && type === 'MultiDEP' && $("#arrivalData").data("areacode") != areaCode){
	}else{	
		let anchorListHtml = '<div data-element="tab__list" class="tab__button" role="presentation">'
		+'<button type="button" tabindex="" data-element="tab__anchor" role="tab" data-index="'+index+'" id="plugin-'+type+'tab-'+Number(index+2)+'"';
		if(index == 0){
			anchorListHtml+='class="tab__anchor is-active" aria-selected="true" aria-expanded="true"';
		}else{
			anchorListHtml+='class="tab__anchor" aria-selected="false" aria-expanded="false"';
		}
		anchorListHtml+='>'+areaName +'</button></div>';
	
		let anchorMapHtml ='<li class="tab-top-item"><a href="#" class="tab-top-btn" data-areacode="'+areaCode+'">'+areaName+'</a></li>';
		if(type==="DEP"){
			//Panel 정보
			$("#divDepArea").eq(0).append(anchorListHtml);
			//Map 정보
			$(".tab-top-list").eq(0).append(anchorMapHtml);
			if(index == 0){
				$(".tab-top-list").eq(0).find('a').addClass('on')
			}
		}else if(type==="MultiDEP"){
			$("#divMultiDepArea").eq(0).append(anchorListHtml);
		}else if(type==="ARR"){
			$("#divArrArea").eq(0).append(anchorListHtml)
			$(".tab-top-list").eq(1).append(anchorMapHtml);
			if(index == 0){
				$(".tab-top-list").eq(1).find('a').addClass('on')
			}
		}else if(type==="MultiARR"){
			$("#divMultiArrArea").eq(0).append(anchorListHtml)
		}
	}		
}

function paintTabPanel(index , areaName, Airports , type) {
	let tapPanelHtml = $('<div data-element="tab__panel" class="tab__panel" aria-labelledby="plugin-'+type+'tab-'+Number(index+2)+'" role="tabpanel" tabindex="0" style="display: none;"></div>');
	let mapBottomHtml = $('<div></div>');
	for(let i=0; i<Airports.length; i++){
		let airport = Airports[i];
		if (airport.area === areaName) {
			if(tripType ==='MT' && type === 'MultiDEP' && airport.countryCode !=  $("#arrivalData").data("countrycode")){
				var skipPanel = true
				if($("#arrivalData").data("countrycode") ==='MO' && airport.countryCode =='HK'){
					skipPanel = false;
				}
				if($("#arrivalData").data("countrycode") ==='HK' && airport.countryCode =='MO'){
					skipPanel = false;
				}
				if(skipPanel){
					continue;
				}
			}
			let longitude = Number(airport.longitude.replace(/[^0-9]/g,''))*0.0001
			let latitude = Number(airport.latitude.replace(/[^0-9]/g,''))*0.0001		
			let tapPanelInnerHtml = '<div class="choise">'+
				'<button type="button" class="choise__button" data-countryCode="' + airport.countryCode + '" data-areacode="'+airport.areaCode+'" data-onlyoneway="'+airport.onlyOneWay+'"'+ 
				' data-latitude ="' + latitude +'" data-longitude ="' + longitude +'" data-stationcode ="' + airport.stationCode + '" data-stationType="' + type + '" data-stationName="' + airport.stationName + '">';
				if(cultureCode.substring(0,2) != 'en'){
					tapPanelInnerHtml+='<span class="stationName">' + airport.stationName + '</span><span class="airport">'+ airport.stationCode +'</span>';
				}else{
					tapPanelInnerHtml+='<span class="stationName">' + airport.stationCode + '</span><span class="airport">'+ airport.stationName +'</span>';
				}
				tapPanelInnerHtml+='</button><div class="fav-check"><button type="button" onclick="javascript:clickBtnFavorites(this);" class="button-favorites">' +    
				'<span class="hidden">'+BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00037")+'</span></label></div></div>'; //즐겨찾기
			//출도착 panel
			$(tapPanelHtml).append(tapPanelInnerHtml);
					
			let airportMap = airport;
			airportMap.id = airport.stationCode
			airportMap.longitude = Number(airportMap.longitude.replace(/[^0-9]/g,''))*0.0001+0.2
			airportMap.latitude = Number(airportMap.latitude.replace(/[^0-9]/g,''))*0.0001+0.2
			
			let mapBottomInnerHtml = $('<a class="tab-swipe-item swiper-slide"><div class="city-name">'+airport.stationName+'<span class="sub">'+airport.stationCode+'</span></div>'+
			'<button type="button" name="btnAAMChartAirport" class="btn-choose-city js-choose-city" data-countryCode="' + airport.countryCode + '"'+
			'data-areacode ="' + airport.areaCode +'" data-latitude ="' + airport.latitude +'" data-longitude ="' + airport.longitude +'"'+
			'data-stationcode ="' + airport.stationCode + '" data-stationType="' + type + '" data-stationName="' + airport.stationName + '">'+BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00011")+'</button>'+ //선택
			'<button type="button" onclick="javascript:clickBtnFavorites(this);" class="btn-wish"><span class="hidden">'+BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00037")+'</span></button></a>'); //즐겨찾기								
			$(mapBottomInnerHtml).hide();
			if(cultureCode.substring(0,2) =='en'){
				$(mapBottomInnerHtml).find('.city-name').html(airport.stationCode+"<span class='sub'>"+airport.stationName+"</span>")
			}
			if(type =="DEP"){
				departureAiportsMap.push(airportMap);
				mapBottomHtml.append(mapBottomInnerHtml);	
			}else if(type=="ARR"){
				//연결구간이 아닌것만 지도 표시
				if(airportMap.connectYn ==='N'){				
					arrivalAiportsMap.push(airportMap);										
					if(airportMap.onlyOneWay ==='Y' && tripType != 'OW'){
						arrivalAiportsMap.pop();
					}else{
						mapBottomHtml.append(mapBottomInnerHtml);						
					}
				}			
			}			
			if(type.indexOf("ARR") > -1){
				//편도전용 노선 제거
				if(airportMap.onlyOneWay ==='Y' && tripType != 'OW'){
					$(tapPanelHtml).children().last().remove()
				}				
				if(tripType==='MT' && airportMap.connectYn ==='Y'){
					$(tapPanelHtml).children().last().remove()					
				}
			}
		}
		//항공권 선택화면에서 이미 출/도착지가 선택되어저있기 때문에 부족한 DATA SET
		if($("#departureData").data("stationcode") === airport.stationCode){
			$("#departureData").data("countrycode" , airport.countryCode)
		}
		if($("#arrivalData").data("stationcode") === airport.stationCode){
			$("#arrivalData").data("countrycode" , airport.countryCode)
		}
		if(tripType ==='MT'){
			if($("#multiDepartureData").data("stationcode") === airport.stationCode){
				$("#multiDepartureData").data("countrycode" , airport.countryCode)
			}
			if($("#multiArrivalData").data("stationcode") === airport.stationCode){
				$("#multiArrivalData").data("countrycode" , airport.countryCode)
			}
		}		
	}
	if(type==="DEP"){
		$("#depAirportLayer").find('div.tab__panel-wrap').append(tapPanelHtml);
		if(index ===0){
			$("#depAirportLayer").find('div.tab-swipe-wrapper')[0].innerText = "";			
			//panel
			$("#depAirportLayer").find('div.tab__panel-wrap').children("div")[0].classList.add("is-active")
			$("#depAirportLayer").find('div.tab__panel-wrap').children("div")[0].style.display="block";
			mapBottomHtml.children().show();
		}
		$("#depAirportLayer").find('div.tab-swipe-wrapper').append(mapBottomHtml.children());	
	}else if(type==="MultiDEP"){
		if($(tapPanelHtml).children('div').length > 0){
			$("#depMultiAirportLayer").find('div.tab__panel-wrap').append(tapPanelHtml);
			if(index ===0){			
				$("#depMultiAirportLayer").find('div.tab__panel-wrap').children("div")[0].classList.add("is-active")
				$("#depMultiAirportLayer").find('div.tab__panel-wrap').children("div")[0].style.display="block";
			}	
		}
	}else if(type==="ARR"){
		//connectYn , onlyOneWay 로 인해서 공항이 다 없어진 경우 지역도 hide처리
		if(tapPanelHtml.children().length == 0){
			$("#arrAirportLayer").find('#'+tapPanelHtml.attr('aria-labelledby')).eq(0).remove()			
			$("#arrAirportLayer").find('.tab-top-list').children().eq(index).remove()			
		}else{
			$("#arrAirportLayer").find('div.tab__panel-wrap').append(tapPanelHtml);		
			//첫번째 지역 활성화
			if($("#arrAirportLayer").find('div.tab__panel-wrap').children(".is-active").length ==0){		
				//panel
				$("#arrAirportLayer").find('div.tab__panel-wrap').children("div")[0].classList.add("is-active")
				$("#arrAirportLayer").find('div.tab__panel-wrap').children("div")[0].style.display="block";
				//map 하단 버튼 초기화 / 상단 버튼 default 선택
				$("#arrAirportLayer").find('.tab-top-list').find('a').addClass('on')
				$("#arrAirportLayer").find('div.tab-swipe-wrapper')[0].innerText = "";	
				$("#arrAirportLayer").find('div.tab-swipe-wrapper').append(mapBottomHtml.children());		
				$("#arrAirportLayer").find('div.tab-swipe-wrapper').children('a').show();
			}else{
				$("#arrAirportLayer").find('div.tab-swipe-wrapper').append(mapBottomHtml.children());		
			}
		}
			
	}else if(type==="MultiARR"){
		//connectYn , onlyOneWay 로 인해서 공항이 다 없어진 경우 지역도 hide처리
		if(tapPanelHtml.children().length == 0){
			$("#arrMultiAirportLayer").find('#'+tapPanelHtml.attr('aria-labelledby')).eq(0).remove()			
			$("#arrMultiAirportLayer").find('.tab-top-list').children().eq(index).remove()				
		}else{
			$("#arrMultiAirportLayer").find('div.tab__panel-wrap').append(tapPanelHtml);
			//첫번째 지역 활성화
			if($("#arrMultiAirportLayer").find('div.tab__panel-wrap').children(".is-active").length ==0){
				$("#arrMultiAirportLayer").find('div.tab__panel-wrap').children("div")[0].classList.add("is-active")
				$("#arrMultiAirportLayer").find('div.tab__panel-wrap').children("div")[0].style.display="block";
			}		
		}		
	}	
}
//항공권 검색 버튼 활성화
function activeSearchFlight(){	
	let btndisFlag = false;			
	if(typeof $("#departureData").data("stationcode") == "undefined" || $("#arrivalData").data("stationcode") == null || $("#departureDate").val() == ""){
		btndisFlag = true;
	}
	if(tripType =='RT' && !btndisFlag){
		if($("#arrivalDate").val() == ""){
			btndisFlag = true;
		}
	}
	//$("#searchFlight").attr("disabled" , btndisFlag);
}

function clickPromotionButton(event){
	let $target = $(this);	
	if($target.parents('.flight-layer').attr('id') ==='depAirportLayer' || $target.parents('.flight-layer').attr('id') ==='depMultiAirportLayer'){				
		let item = {
				stationCode: $target.data("depstationcode"),
				stationName: $target.data("depstationname"),
				stationType : $target.data("depstationtype"),
				countryCode : $target.data("depcountrycode"),
				latitude : $target.data("deplatitude"),
				longitude : $target.data("deplongitude"),
				areaCode : $target.data("areacode")
		};
		//선택한 공항을 세팅
		setAirportInfo(item);		
	}	
	$("#arrAirportLayer").data("target" , "spanArrivalDesc")
	
	let item = {
			stationCode: $target.data("arrstationcode"),
			stationName: $target.data("arrstationname"),
			stationType : $target.data("arrstationtype"),
			countryCode : $target.data("arrcountrycode"),
			latitude : $target.data("arrlatitude"),
			longitude : $target.data("arrlongitude"),
			areaCode : $target.data("areacode")
	};
	//선택한 공항을 세팅
	setAirportInfo(item);		
}
function clickAAMChartBtn(event){
	if(!$(this).hasClass('on')){
		airportMapLayer.zoomIn($(this))		
	}
}
//공항선택 레이어에서 공항을 선택한 경우 처리
function clickChoiseButton(event) {
	$(".boarding-error").hide();
	let $target = $(this);
	if($(this).parent().hasClass('tab-swipe-item')){
		$(this).parent().data('selected' , 'false');
	}	
	const item = {
			stationCode: $target.data("stationcode"),
			stationName: $target.data("stationname"),
			stationType : $target.data("stationtype"),
			countryCode : $target.data("countrycode"),
			latitude : $target.data("latitude"),
			areaCode : $target.data("areacode"),
			onlyoneway : $target.data("onlyOneWay"),
	};
	//선택한 공항을 세팅
	setAirportInfo(item);
}
//자동화 검색
function autoComplete() {	
	$(this).keyup(function() {				
		if($(this).val() === "") {				
			$(this).parents().find('div[name=search_auto]').hide();
		}else{	
			$(this).parents().find('div[name=search_auto]').show();
		}
	});
}

//리스트, 맵 변경
function viewTabMap (target, type) {
	var type = type;
	if (target == 'start' && type == 'map'){
		$('.flight-start').eq(0).addClass('map')
		airportMapLayer = new AirportMapLayer('map-start');
		uiCarousel.init();
	}else if (target == 'start' && type != 'map'){
		$('.flight-start').removeClass('map')
	}else if (target == 'target' && type == 'map'){
		//map 영역 버튼 그리기
		$('.flight-target').eq(0).addClass('map')
		airportMapLayer = new AirportMapLayer('map-target');
		
		if($("#arrivalData").data("stationcode") != null && $("#arrAirportLayer").is(":visible")){
		//도착지 정보
		let arrivalMapData;
		for(let i=0; i<arrivalAiportsMap.length; i++){
			if(arrivalAiportsMap[i].stationCode === $("#arrivalData").data("stationcode")){
				arrivalMapData = arrivalAiportsMap[i]
				break;
			}
		}		
		
		let departureMapData = [];
		departureMapData.push($("#departureData").data("stationcode"));
		departureMapData.push($("#departureData").data("latitude"));
		departureMapData.push($("#departureData").data("longitude"));
		
		let drawLineData = {		
			departureMapData : departureMapData,
			arrivalMapData: arrivalMapData			
		};			
		airportMapLayer.showLines(drawLineData)	
	}
			  
	}else if (target == 'target' && type != 'map'){
		$('.flight-target').removeClass('map')
	}
}

//달력 좌우 이동
function moveCalendar() {
	pickerMoveMonth();
}

// 공항 선택
function setAirportInfo(item) {
	let name = item.stationName;	
	if(cultureCode.substring(0,2) == 'en'){		
		if(item.stationName.indexOf('(') > -1){
			name = item.stationCode+"<em class='sub'><span>(</span>"
			let stationNames = item.stationName.split('(');
			name = name+ stationNames[0]+"<br class='mobile-only'>("+stationNames[1]+"</span></em>"
		}else{
			name = item.stationCode+"<em class='sub'><span></span>"+item.stationName+"<span></span></em>"
		}
	}
	let airportSelector
	let hidAirportData
	let dateLayerSelector
	let arrAirportData
	let arrhidAirportData
	let thisLayer,nextLayer
	//let areaData
	if(item.stationType ==='DEP'){
		airportSelector = $("#depAirportLayer").data("target");
		thisLayer = $("#depAirportLayer")
		nextLayer = $("#spanArrivalDesc").parent()
		hidAirportData = $("#departureData")
		arrAirportData = $("#arrivalData")
		arrhidAirportData = $("#spanArrivalDesc")
		dateLayerSelector = $("#dateLayer")
		if(typeof airportMapLayer != 'undefined'){
			airportMapLayer.clearOldLines()
			$("#arrAirportLayer").find('.tab-swipe-item').removeClass('on')
		}					
		selectArrivalAirports(item , 'ARR');
	}else if(item.stationType ==='MultiDEP'){
		airportSelector = $("#depMultiAirportLayer").data("target");
		hidAirportData = $("#multiDepartureData")
		arrAirportData = $("#multiArrivalData")
		arrhidAirportData = $("#spanMultiArrivalDesc")
		dateLayerSelector = $("#multiDateLayer")				
		selectArrivalAirports(item , 'MultiARR');	
	}
	if(item.stationType.indexOf('DEP')> -1){
		airportSelector = $("#"+airportSelector)[0];
		airportSelector.innerHTML  = name;
		airportSelector.classList.remove("before-select")		
		$(airportSelector).parent().hasClass('active') == true ? '' : $(airportSelector).parent().addClass('active')	
		hidAirportData.data("stationcode" , item.stationCode);
		hidAirportData.data("departurename" , item.stationName);
		hidAirportData.data("latitude" , item.latitude);
		hidAirportData.data("longitude" , item.longitude);
		hidAirportData.data("countrycode" , item.countryCode);			
		hidAirportData.data("areacode" , item.areaCode);	
		dateLayerSelector.find('.location').eq(0).html(hidAirportData.data("departurename"))		
		/*출발지 선택시 도착지 초기화*/
		arrAirportData.data("stationcode" , null)	
		arrAirportData.data("arrivalname", null)	
		arrAirportData.data("countrycode", null)	
		arrhidAirportData.parent().removeClass('active')
		arrhidAirportData.text(BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00010")) //도착지
		arrhidAirportData.addClass("before-select")				
		if($("div[id$=Layer]").is(":visible")){
			thisLayer.find(".layer-close").trigger('click');
			nextLayer.trigger('click');
		}
	}
	if(item.stationType ==='ARR'){
		airportSelector = $("#arrAirportLayer").data("target");
		hidAirportData = $("#arrivalData")
		dateLayerSelector = $("#dateLayer")
		thisLayer = $("#arrAirportLayer")
		nextLayer = 'undefined'
		if(tripType ==='MT'){
			selectDepartureAirports('MultiDEP');
			nextLayer = $("#spanMultiDepartureDesc").parent()		
		}
	}else if(item.stationType ==='MultiARR'){
		airportSelector = $("#arrMultiAirportLayer").data("target");
		hidAirportData = $("#multiArrivalData")
		dateLayerSelector = $("#multiDateLayer")
		thisLayer = $("#arrMultiAirportLayer")
		nextLayer = 'undefined'
	}
	if(item.stationType.indexOf('ARR')> -1){
		airportSelector = $("#"+airportSelector)[0];
		airportSelector.innerHTML  = name;
		airportSelector.classList.remove("before-select")	
		$(airportSelector).parent().hasClass('active') == true ? '' : $(airportSelector).parent().addClass('active')				
		hidAirportData.data("stationcode" , item.stationCode);
		hidAirportData.data("arrivalname" , item.stationName);
		hidAirportData.data("countrycode" , item.countryCode);	
		hidAirportData.data("areacode" , item.areaCode);		
		hidAirportData.data("onlyoneway" , item.onlyOneWay);
		dateLayerSelector.find('.location').eq(1).text(hidAirportData.data("arrivalname"))						
		if($("div[id$=Layer]").is(":visible")){
			thisLayer.find(".layer-close").trigger('click');
			if(nextLayer != 'undefined'){
				nextLayer.trigger('click');
			}
		}
	}
	
	// 최근 검색 공항 set 
	if(localStorage.getItem('recentSearchAirport') != null) {		
		searchLatelyDatas = JSON.parse(localStorage.getItem('recentSearchAirport'));
		let pushFlag = true;
		for(let i=0; i<searchLatelyDatas.length; i++){
			if(searchLatelyDatas[i].stationCode == item.stationCode){
				pushFlag = false;
				break;
			}
		}
		if(pushFlag){
			searchLatelyDatas.push(item)
			localStorage.setItem('recentSearchAirport', JSON.stringify(searchLatelyDatas));
		}
	}else{
		searchLatelyDatas.push(item)
		localStorage.setItem('recentSearchAirport', JSON.stringify(searchLatelyDatas));
	}
	activeSearchFlight();
}

function selectArrivalAirports(original , selectedLayer) {
	$.ajax({
		async : true,      
		//url: 'selectArrivalStations.json',
		url: searchUrl+'/'+ I18N.language +'/ibe/booking/selectArrivalStations.json',
		type: 'POST',
		data	: {		
			bookType : bookType,
			cultureCode : cultureCode.replace("_","-"),
			originAirport : original.stationCode,
			pageType : "schedule"
		},  
		success: function (data) {
			//지도는 OW/RT 밖에 안되기 때문에 다구간에서는 첫번째 구간의 도착 정보를 계속해서 저장하고 있는다-
			if(selectedLayer !="MultiARR"){
				arrivalAiportsMap = [];
			}			
			paintAirports(data.data.data.stations , selectedLayer);  
			
			//최근검색
			setRecentSearchAirports(selectedLayer);
			// 즐겨찾기 
			selectFavoritesAirports();
			// 프로모션 조회
			if(selectedLayer =="ARR"){
				selectPromotionsAirports($("#departureData").data("stationcode"))
			}
		}
	});
}

// 최근 검색 목록
function setRecentSearchAirports(stationType){
	paintRecentAirports(JSON.parse(localStorage.getItem('recentSearchAirport')) , stationType);
}

// 즐겨찾기 목록
function selectFavoritesAirports() {
	if(typeof JSON.parse(USER_INFO.get()).userId != 'undefined'){	
		$.ajax({
			//url: './selectAirportFavorites.json',
			url: searchUrl+'/'+ I18N.language +'/ibe/booking/selectAirportFavorites.json',
			type: 'post',
			async : false,
			dataType: "json",
			data: {
			  mbrId: JSON.parse(USER_INFO.get()).userId,
			},
			success: function (data) {
			  const list = data.data.mtxTt;
			  paintFavoritesAirports(list);
			}
		});
	}else{
		$("div[name=favorites]").text("");
		let btnFavoriteAirport = '<div class="tag-list__no-result">'+BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00056")+'</div>' //즐겨 찾는 도시(공항)가 없습니다.
		$("div[name=favorites]").append(btnFavoriteAirport)	
	}
}

//최근 검색 공항 그리기
function paintRecentAirports(localStorageDatas , stationType) {
	$("div[name=latelySearch]").text("");
	let btnRecentAirport = '';
	if(localStorageDatas != null && localStorageDatas.length !=0){				
		
		localStorageDatas.forEach(function (recentAirport) {
			let skipFlag = true;
			if(stationType === 'DEP' || stationType === 'MultiDEP'){
				skipFlag = false;		
			}
			if(stationType === 'ARR'){				
				//도착지 목록에 없는 노선은 제외
				for(let i=0; i<$("#divArrArea").next('.tab__panel-wrap').find('.choise').length; i++){
					let airport = $("#divArrArea").next('.tab__panel-wrap').find('.choise').eq(i)				
					if(airport.find('.airport').text() === recentAirport.stationCode){
						skipFlag = false;
						break;
					}
				}
			}
			if(stationType === 'MultiARR'){
				//도착지 목록에 없는 노선은 제외
				for(let i=0; i<$("#divMultiArrArea").next('.tab__panel-wrap').find('.choise').length; i++){
					let airport = $("#divMultiArrArea").next('.tab__panel-wrap').find('.choise').eq(i)				
					if(airport.find('.airport').text() === recentAirport.stationCode){
						skipFlag = false;
						break;
					}
				}
			}
			//cultureCode 가 없으면 표출하지 않음
			if(typeof recentAirport.cultureCode === 'undefined'){
				skipFlag = true;	
			}
			//해당 사이트가 아니면 표출하지 않음
			if(typeof recentAirport.cultureCode != 'undefined' 
				&& !cultureCode.replace("_","-").startsWith(recentAirport.cultureCode) 
				&& !recentAirport.cultureCode.startsWith(cultureCode.replace("_","-"))){
				skipFlag = true;
			}
			
			if(!skipFlag){
			btnRecentAirport+= '<div class="tag-list__item tag-list__item--tag" data-element="tab__list" role="presentation">'+
				'<button type="button" name="btnLatelyAirport"class="tag-list__text"'+
				'data-stationcode="'+ recentAirport.stationCode+'"'+
				'data-latitude="'+ recentAirport.latitude+'"data-longitude="'+ recentAirport.longitude+'"data-countrycode="'+ recentAirport.countryCode+'"'+
				'data-stationtype="'+ stationType +'" data-stationname="'+recentAirport.stationName+'">'+
				recentAirport.stationName+'<span class="airport" style="display: none;">'+recentAirport.stationCode+'</span></button>'+
		      '<button type="button" class="tag-list__remove" onclick="javascript:deletelatelySearch(this);"><span class="hidden">'+BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00036")+'</span></button></div>';	//삭제
			}	      
		})
	}	
	if(btnRecentAirport ==""){
		btnRecentAirport = '<div class="tag-list__no-result">'+BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00057")+'</div>' //최근 검색 도시(공항)가 없습니다.
	}
	$("div[name=latelySearch]").append(btnRecentAirport) 
}

//즐겨찾기 그리기
function paintFavoritesAirports(favoritesAirports){
	let targetLayerId = $(".flight-layer:visible").attr('id');
	let targetLayer = $("#"+targetLayerId);
	$("div[name=favorites]").text("");
	if(favoritesAirports.length ==0){
		let btnFavoriteAirport = '<div class="tag-list__no-result">'+BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00056")+'</div>' //즐겨 찾는 도시(공항)가 없습니다.
		$("div[name=favorites]").append(btnFavoriteAirport)
	}else{
		let checkCnt = 0
		let choiseList = targetLayer.find('.choise')
		//탭 하트 버튼 제어
		for(let j=0; j<choiseList.length; j++){
			let choise = choiseList.eq(j)
			choise.find('.button-favorites').removeClass("on");
			for(let i=0; i<favoritesAirports.length; i++){
				let favoritesAirport = {
					stationCode: favoritesAirports[i].AIRPORT_CD,
					stationName: "",
					stationType : "",
					countryCode : "",
					latitude : "",
					longitude : ""
				};
				if(choise.find('.airport').text() === favoritesAirport.stationCode) {
					choise.find('.button-favorites').addClass("on");
					favoritesAirport.stationName = choise.find('button').eq(0).data('stationname')
					favoritesAirport.stationType = choise.find('button').eq(0).data('stationtype')
					favoritesAirport.countryCode = choise.find('button').eq(0).data('countrycode')
					favoritesAirport.latitude = choise.find('button').eq(0).data('latitude')
					favoritesAirport.longitude = choise.find('button').eq(0).data('longitude')
					favoritesAirport.areaCode = choise.find('button').eq(0).data('areacode')
					paintFavoritesTag(favoritesAirport);
					checkCnt++;
					break;	
				}
				
			}
		}
		
		let choiseMapList = targetLayer.find('.tab-swipe-item')
		//지도 하트 버튼 제어
		for(let j=0; j<choiseMapList.length; j++){
			let choise = choiseMapList.eq(j)
			choise.find('.button').eq(1).removeClass("on");
			for(let i=0; i<favoritesAirports.length; i++){		
				if(choise.find('button').eq(0).data('stationcode') === favoritesAirports[i].AIRPORT_CD) {
					choise.find('button').eq(1).addClass("on");		
					break;	
				}			
			}
		}
		if(checkCnt ==0){
			let btnFavoriteAirport = '<div class="tag-list__no-result">'+BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00056")+'</div>' //즐겨 찾는 도시(공항)가 없습니다.
			$("div[name=favorites]").append(btnFavoriteAirport)
		}
	}
}

//즐겨찾기 tag item 그리기
function paintFavoritesTag(favoritesAirport) {
	const favoritesHtml = '<div class="tag-list__item tag-list__item--tag" data-element="tab__list" role="presentation">'+
		'<button type="button" name="btnFavoriteAirport"class="tag-list__text" data-stationcode="'+ favoritesAirport.stationCode+'"'+
		'data-areacode="'+ favoritesAirport.areaCode+'" data-stationcode="'+ favoritesAirport.stationCode+'" data-latitude="'+ favoritesAirport.latitude+'"data-longitude="'+ favoritesAirport.longitude+'"'+
		'data-countrycode="'+ favoritesAirport.countryCode+'" data-stationtype="'+ favoritesAirport.stationType +'" data-stationname="'+favoritesAirport.stationName+'">#' + favoritesAirport.stationName + '</button>' +
		'<button type="button" class="tag-list__remove" onclick="javascript:deleteFavorites(this);"><span class="hidden">'+BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00036")+'</span></button></div>'; //삭제
	if($("div[name=favorites]").find('.tag-list__no-result').length != 0){
		$("div[name=favorites]").find('.tag-list__no-result').remove()
	}
	$("div[name=favorites]").append(favoritesHtml)
}

// 프로모션 목록
function selectPromotionsAirports(airportCode) {
	let depAirportCode = airportCode
	if(typeof depAirportCode ==='undefined'){
		depAirportCode = ''
	}
	$.ajax({
		//url: 'selectPromotionsAirports.json',
		url: searchUrl+'/'+ I18N.language +'/ibe/booking/selectPromotionsAirports.json',
		type: 'post',
		dataType: "json",
		data: {
			depAirportCode: depAirportCode,
			lang : cultureCode.substring(0,2),
		},
		success: function (data) {
			const promotionAirports = data.data.mtxTt;
			paintPromotionAirports(promotionAirports);
		}
	});
}

//프로모션 그리기
function paintPromotionAirports(promotionAirports) {
	$("div[name=promotionSearch]").text("");
	let promotionHTML = ''
	promotionAirports.forEach(function (promotionAirport) {	
		promotionHTML+='<button type="button" class="tag-list__item tag-list__item--promo" data-element="tab__list" role="presentation" name="btnPromotion"';	
		promotionHTML+='data-depstationcode="'+ promotionAirport.DEP_STATION+'" data-depcurrencycode="'+ promotionAirport.DEP_STATION+'"'+
		'data-depcountrycode="'+ promotionAirport.DEP_COUNTRYCODE+'"'+
		'data-depstationtype="DEP" data-depstationname="'+promotionAirport.DEP_AIRPORT_NM+'"'+
		'data-arrstationcode="'+ promotionAirport.ARR_STATION+'" data-arrcurrencycode="'+ promotionAirport.ARR_STATION+'"'+
		'data-arrcountrycode="'+ promotionAirport.ARR_COUNTRYCODE+'"'+
		'data-arrstationtype="ARR" data-arrstationname="'+promotionAirport.ARR_AIRPORT_NM+'">';		
		if(promotionAirport.STARTPOINT_TAG_NM !=''){
			promotionHTML+='<span class="new">'+promotionAirport.STARTPOINT_TAG_NM+'</span>'
		}
		promotionHTML+='<span class="tag-list__text" style="color:'+promotionAirport.DESTINATION_TAG_TCOLOR_CD+';">'+promotionAirport.PROMOTION_NM+'</span></button>'
	});
	if($("#depAirportLayer").is(":visible")){
		$("div[name=promotionSearch]").eq(0).append(promotionHTML) 
	}else{
		$("div[name=promotionSearch]").eq(1).append(promotionHTML) 
	}	
}

// 최근검색 삭제 
function deletelatelySearch(_this) {
	const parentButton = $(_this).parent('div');	
	const airport =  $(_this).prev().data('stationcode')
	//storage에서 삭제 처리
	if(localStorage.getItem('recentSearchAirport') != null) {		
		searchLatelyDatas = JSON.parse(localStorage.getItem('recentSearchAirport'));	
		if(searchLatelyDatas.length == 1){
			localStorage.removeItem('recentSearchAirport')
			searchLatelyDatas = [];
		}else{
			for(let i=0; i<searchLatelyDatas.length; i++){
				if(searchLatelyDatas[i].stationCode == airport){
					searchLatelyDatas.splice(i,1);
				}
			}
			localStorage.setItem('recentSearchAirport', JSON.stringify(searchLatelyDatas));	
		}
	}
	let emptyDesc ='';
	if(parentButton.parent('.tag-list').children('.tag-list__item').length==1){
		emptyDesc = parentButton.parent('.tag-list')
	}
	parentButton.remove();
	if(emptyDesc != ''){
		emptyDesc[0].innerHTML = '<div class="tag-list__no-result">'+BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00057")+'</div>' //최근 검색 도시(공항)가 없습니다.
	}
}

// 즐겨찾기 삭제 
function deleteFavorites(_this) {	
	const stationcode = $(_this).prev().data("stationcode");
	let targetLayer
	if($(_this).prev().data("stationtype") === 'DEP'){
		targetLayer = $("#depAirportLayer")
	}else if($(_this).prev().data("stationtype") === 'ARR'){
		targetLayer = $("#arrAirportLayer")
	}else if($(_this).prev().data("stationtype") === 'MultiDEP'){
		targetLayer = $("#depMultiAirportLayer")
	}else if($(_this).prev().data("stationtype") === 'MultiARR'){
		targetLayer = $("#arrMultiAirportLayer")
	}
	//db에서 삭제 처리
	deleteFavoritesAirport(stationcode , targetLayer);
}

//즐겨찾기 공항 DB 삭제
function deleteFavoritesAirport(code , targetLayer) {
	if(USER_INFO.get() != '{}'){	
		$.ajax({
			//url: 'deleteAirportFavorites.json',
			url: searchUrl+'/'+ I18N.language +'/ibe/booking/deleteAirportFavorites.json',
			type: 'post',
			data: {
				mbrId: JSON.parse(USER_INFO.get()).userId,
				code: code
			},
			success: function (data) {
				//x 버튼 제어	
				for(let i=0; i<targetLayer.find('.tag-list').eq(1).children('.tag-list__item').length; i++){
					let choise = targetLayer.find('.tag-list').eq(1).children('.tag-list__item').eq(i)
					if (choise.find('button').eq(0).data('stationcode') === code) {
						choise.remove()
						break;
					}
				}
				if(targetLayer.find('.tag-list').eq(1).children('.tag-list__item').length == 0){
					targetLayer.find('.tag-list').eq(1)[0].innerHTML = '<div class="tag-list__no-result">'+BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00056")+'</div>' //즐겨 찾는 도시(공항)가 없습니다.
				}
				
				//하트 버튼 제어	
				for(let i=0; i<targetLayer.find('.choise').length; i++){
					let choise = targetLayer.find('.choise').eq(i)
					if (choise.find('.airport').text() === code) {
						choise.find('.button-favorites').removeClass("on")
						break;
					}
				}
				//amchart 하단 버튼 제어
				for(let j=0; j<$('.tab-swipe-wrapper').find('a').length; j++){
					let tmp = targetLayer.find('div.tab-swipe-wrapper').find('a').eq(j);
					if(tmp.find('.btn-choose-city').data('stationcode') === code) {
						tmp.find('.btn-wish').removeClass("on")
						break;
					}
				}
			},
			error: function () {
			}
		});
	}else{
		BIZ_COMMONS_SCRIPT.formPostLogin("scheduleSearchForm", window.location.pathname);
	}
}

//공항 검색 레이어에서 공항 즐겨찾기 버튼 클릭 이벤트 처리
function clickBtnFavorites(_this) {
	const $target = $(_this);
	let favoritesButton = $target.closest('.choise').find('button').eq(0);		
	let stationName = favoritesButton.data('stationname')
	let stationCode = favoritesButton.data('stationcode')
	/*amChart*/
	if($target.hasClass('btn-wish')){
		stationName = $target.parent().children('button').eq(0).data('stationname')
		stationCode =  $target.parent().children('button').eq(0).data('stationcode')
	}
	let favoritesAirport = {
		stationCode: stationCode,
		stationName: stationName,
		stationType : favoritesButton.data('stationtype'),
		countryCode : favoritesButton.data('countrycode'),
		latitude : favoritesButton.data('latitude'),
		longitude : favoritesButton.data('longitude')
	};
	
	if(typeof JSON.parse(USER_INFO.get()).userId != 'undefined'){
		if ($target.hasClass("on")) {
			//DB에서 즐겨찾기 정보 제거
			deleteFavoritesAirport(favoritesAirport.stationCode , $target.parents('.flight-layer'));			
		} else {
			//DB에 저장 
			insertFavoritesAirport(favoritesAirport.stationCode);					
			//즐겨찾기 tag item 추가
			paintFavoritesTag(favoritesAirport);
			//텝 하트 버튼 추가
			$target.addClass("on")	
			//지도 하트 버튼 추가
			for(let i=0; i<$('.tab-swipe-wrapper').length; i++){
				let swipe = $('.tab-swipe-wrapper').eq(i)
				for(let j=0; j<swipe.find('a').length; j++){
					let btnchoose = swipe.find('a').eq(j);
					if(btnchoose.find('.btn-choose-city').data('stationcode') === favoritesAirport.stationCode) {
						btnchoose.find('.btn-wish').addClass("on")
						break;
					}
				}
			}
		}
	}else{
		BIZ_COMMONS_SCRIPT.formPostLogin("scheduleSearchForm", window.location.pathname);
	}
}

// 슬라이딩 공통 이벤트 
$.fn.sliding = function () {
	var ticketingWrap = this
	var rowBot = ticketingWrap.find('.ticketing-row-bot')
	var btnPick = ticketingWrap.find('.js-target-pick')
	var btnStart = ticketingWrap.find('.start.js-target-pick')
	var btnTarget = ticketingWrap.find('.target.js-target-pick')
	var btnDate = ticketingWrap.find('.btn-date')
	var rowTop = ticketingWrap.find('.ticketing-row-top')
	var flightStart = ticketingWrap.find('.flight-start').eq(0)
	var flightTarget = ticketingWrap.find('.flight-target').eq(0)
	var ticketPath = ticketingWrap.find('.ticket-path')
	var layerClose = ticketingWrap.find('.layer-close')
	var promotionTop = ticketingWrap.find('.promotion-top')
	var promotionInp = ticketingWrap.find('.promotion-inp .inp-txt')
	var btnPc = ticketingWrap.find('.pc-toggle-btn')
    var btnMo = ticketingWrap.find('.mobile-btn')
	var customerLayer = ticketingWrap.find('.customer-layer');
	//기본 날짜
	var now = new Date();		
	var departureDate = new Date(now.setDate(now.getDate()))
	let _dm = departureDate.getMonth()+1
	let _dd = departureDate.getDate()
	if(_dm <10){_dm = '0'+_dm}
	if(_dd <10){_dd = '0'+_dd}		
	var arrivalDate = new Date(now.setDate(now.getDate() + 7))
	let _am = arrivalDate.getMonth()+1
	let _ad = arrivalDate.getDate()
	if(_am <10){_am = '0'+_am}
	if(_ad <10){_ad = '0'+_ad}
		
	//편도, 왕복, 다구간 탭
	var typeTab = ticketingWrap.find('.ticketing-type')
	var typeTabItem = ticketingWrap.find('.ticketing-type .item')
	var typeTabBtn = ticketingWrap.find('.ticketing-type .item-btn')
	var currentId;
	$("[id^=tripType1-]").on('click', function (e) {
		var currentTripType = $(this).data("triptype")
		currentId = $(this).attr("id");
		//레이어열려있을시 다른 버튼 비활성화
		/*if($(".flight-layer").is(":visible")){
			return false;
		}*/
		if(titleType != "status"){
			$(this).prop("checked",true)
			/*typeTabItem.removeClass('selected')
			$(this).parent().addClass('selected')*/
			if (currentId == 'tripType1-1') {
				tripType = 'RT'			
				$("#selectDate").data("min-date" , dUtil.cvtDate(dUtil.toDate(), 'y-m-d'));
				$("#selectDate").data("max-date" , dUtil.termDate('D', 362, 'y-m-d', dUtil.toDate()));
				
				$("#selectDate").data("picker" , "range");
				datepicker.init('[data-picker]', 'change');
				
				$("#departureDate").val(departureDate.getFullYear()+"-"+_dm+"-"+_dd)
				$("#arrivalDate").val(arrivalDate.getFullYear()+"-"+_am+"-"+_ad)	
				$("#departureDate").prev().find('.txt').text(dUtil.dateWeekNameTime($("#departureDate").val().replace(/[^0-9]/gi,''),I18N.language)+" ~ "+dUtil.dateWeekNameTime($("#arrivalDate").val().replace(/[^0-9]/gi,''),I18N.language));
				$(".main-ticketing").eq(0).addClass('round')
				$(".main-ticketing").eq(0).removeClass('one-way multi')			
				$(".ticketing").addClass('round')
				$(".ticketing").removeClass('multi-wrap one-way multi')
				$(this).parents('.ticketing-type').siblings('.route1').hide()
				if($("#departureDate").val()!= ""){
					$("#departureDate").prev().find('.txt').text(dUtil.dateWeekNameTime($("#departureDate").val().replace(/[^0-9]/gi,''),I18N.language)+" ~ "+dUtil.dateWeekNameTime($("#arrivalDate").val().replace(/[^0-9]/gi,''),I18N.language));
				}
				$(".booking-trip__from").next().removeClass('one-way')
				$(".booking-trip__from").next().addClass('round-trip')
				$(".floating-button").show();	
				$(".radio-wrap").children().eq(1).show()
			}else {		
				tripType = 'OW'	
				var defaultDate = $("#selectDate").attr("data-defaultDate");	
				var pickerInitType = "change";
				$("#selectDate").data("min-date" , dUtil.cvtDate(dUtil.toDate(), 'y-m-d'));
				$("#selectDate").data("max-date" , dUtil.termDate('D', 362, 'y-m-d', dUtil.toDate()));
				$("#selectDate").data("picker" , "single");
				if(defaultDate != dUtil.cvtDate(dUtil.toDate(), 'y-m-d')){
					$("#selectDate").attr("data-defaultDate" , dUtil.cvtDate(dUtil.toDate(), 'y-m-d'));
					pickerInitType = "Flight";
				}	
				datepicker.init('[data-picker]' , pickerInitType);
				
				
				$("#departureDate").val(departureDate.getFullYear()+"-"+_dm+"-"+_dd);			
				$("#departureDate").prev().find('.txt').text(dUtil.dateWeekNameTime($("#departureDate").val().replace(/[^0-9]/gi,''),I18N.language));
//				$("#arrivalDate").val("");						
				$(".main-ticketing").eq(0).addClass('one-way')
				$(".main-ticketing").eq(0).removeClass('round multi')	
				$(".ticketing").addClass('one-way')
				$(".ticketing").removeClass('multi-wrap round multi')	
				$(this).parents('.ticketing-type').siblings('.route1').hide()
				$("#departureDate").prev().find('.txt').text($("#departureDate").prev().find('.txt').text().split("~")[0])
//				$("#arrivalDate").val("");
				$(".booking-trip__from").next().addClass('one-way')
				$(".booking-trip__from").next().removeClass('round-trip')						
				$(".floating-button").show();
				$(".radio-wrap").children().eq(1).show()
			}
		}else{
			clearSearchData();
			currentId = $(this).attr('id'); 
			if (currentId == 'tripType1-1') { 
				$('.main-ticketing').removeClass('flight-info'); 
				$('.boarding-search').addClass('flight-info'); 
			} else { 
				$('.main-ticketing').addClass('flight-info'); 
				$('.boarding-search').removeClass('flight-info'); 
			} 
			if($(".flight-layer").is(":visible")){
				return false;
			}
			$(this).prop("checked",true)
			/*typeTabItem.removeClass('selected')
			$(this).parent().addClass('selected')*/
							
			tripType = 'OW'	
			$("#selectDate").data("picker" , "single");
			$("#selectDate").data("min-date" , dUtil.termDate('D',-180,'y-m-d',dUtil.toDate()));
			$("#selectDate").data("max-date" , dUtil.termDate('D',+5,'y-m-d',dUtil.toDate()));
			
			customDeviceType = typeof USER_DEVICE.getName() != "undefined" ? USER_DEVICE.getName().toLowerCase() : "";
			if(customDeviceType == "pc"){
				$("#selectDate").attr("data-defaultDate" , currentDay.replaceAll(".","-"));
			}else{
				$("#selectDate").attr("data-defaultDate" , dUtil.termDate('D',-180,'y-m-d',dUtil.toDate()));
			}

			datepicker.init('[data-picker]' , 'Flight');

			if (currentId == 'tripType1-1') { 
			$("#departureDate").val(departureDate.getFullYear()+"-"+_dm+"-"+_dd);			
			$("#departureDate").prev().find('.txt').text(dUtil.dateWeekNameTime($("#departureDate").val().replace(/[^0-9]/gi,''),I18N.language));
//			$("#arrivalDate").val("");						
			$(".main-ticketing").eq(0).addClass('one-way')
			$(".main-ticketing").eq(0).removeClass('round multi')	
			$(".ticketing").addClass('one-way')
			$(".ticketing").removeClass('multi-wrap round multi')	
			$(this).parents('.ticketing-type').siblings('.route1').hide()
			$("#departureDate").prev().find('.txt').text($("#departureDate").prev().find('.txt').text().split("~")[0])
			$(".booking-trip__from").next().addClass('one-way')
			$(".booking-trip__from").next().removeClass('round-trip')						
			$(".floating-button").show();
			$(".radio-wrap").children().eq(1).show()
			}			
		}
		if($("#divRecentRoute").parents(".search").find('.search__box').length > 0)$("#divRecentRoute").parents(".search").show()
		dateRangeChangeInit();		
		activeSearchFlight();
	});

	// 가려진 부분 열기
	btnPick.on('click', function () {
		open(this)
	})
	
	//항공편 선택 전용
	btnPc.on('click', function () {
      var check = ticketingWrap.hasClass('open')
      if (check) {
        close ()
      }
      else {
        open ()
      }
    })

	//항공편 선택 전용
    btnMo.on('click', function () {
		var check = ticketingWrap.hasClass('open')
		if (check) {
        	close ()
			ticketPath.show()
			rowTop.hide()
		}else {
			open ()			
		}
    })

	// 내부 슬라이드 요소 닫을 때
	layerClose.on('click', function () {
		$('.quick-booking').removeClass('active')
		$('.quick-booking').trigger('removeClassActive');
		$(this).addClass('on');
	});

	function open (obj) {
		ticketingWrap.removeClass('closed').addClass('open')
		typeTab.show()
    	rowBot.show()
		rowTop.eq(0).show()		
		if(tripType != 'MT'){        	
			rowTop.eq(1).hide()	
		}else{
			rowTop.eq(1).show()
		}
		controlOtherEventDisabled(true);
	}
	function close () {
		ticketingWrap.removeClass('open').addClass('closed')
		typeTab.hide()
    	rowBot.hide()
		$('.quick-booking').removeClass('active')
		$('.quick-booking').trigger('removeClassActive');
		controlOtherEventDisabled(false);
	}

	//출발, 도착지 선택
	btnStart.on('click', function () {
		$('.flight-layer').hide();
		$('.date-layer').hide();	
		customerLayer.hide();	
		$('.predictive-search').hide();
		$('.quick-booking').addClass('active')
		$('.quick-booking').trigger('addClassActive');
		// 다구간의 두번째 구간의 출발지를 선택한 경우 
		
			ticketingWrap.find('.flight-start').eq(0).show();			
			$("#depAirportLayer").data("target" , $(this).find('.txt')[0].id)
			
			//최근검색
			setRecentSearchAirports('DEP');
			// 즐겨찾기 
			selectFavoritesAirports();
			// 프로모션 조회
			selectPromotionsAirports();	

			$('.flight-start .map-wrap').mapInnerTab();
		
		removeUnderLine();
		$(this).addClass('on');		
	})
	
	//도착레이어 열기
	btnTarget.on('click', function () {				
		$('.flight-layer').hide();
		$('.date-layer').hide();	
		ticketingWrap.find('.customer-layer').hide()
		$('.predictive-search').hide();
		$('.quick-booking').addClass('active')
		$('.quick-booking').trigger('addClassActive');
		if($(this).find('.txt')[0].id==='spanArrivalDesc'){
			if($("#departureData").data("stationcode") == null || $("#departureData").data("stationcode") == ""){										
				$('#alertModalLayer').find('.alert-text').text(BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00054")) //출발지를 선택해 주세요.
				fullPopOpen('alertModalLayer')
				controlOtherEventDisabled(false);
				return;
			}
			ticketingWrap.find('.flight-target').eq(0).show();		
			$("#arrAirportLayer").data("target" , $(this).find('.txt')[0].id)
			$('.flight-target .map-wrap').mapInnerTab();			
	 }
		removeUnderLine();
		$(this).addClass('on');	
	})

	//날짜 선택
	btnDate.on('click', function () {
		if(typeof $("#departureData").data("stationcode") == "undefined" || $("#arrivalData").data("stationcode") == null){						
			if(tripType ==='MT'){
				$('#alertModalLayer').find('.alert-text').text(BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00060")) //출발 도착지를 선택해주세요.
				fullPopOpen('alertModalLayer')			
				return;
			}else{
				$('#alertModalLayer').find('.alert-text').text(BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00060")) 
				fullPopOpen('alertModalLayer')			
				return;
			}
		}
		if(tripType ==='MT'){
			if($("#multiDepartureData").data("stationcode") == "" || $("#multiArrivalData").data("stationcode") == null){	 			
				$('#alertModalLayer').find('.alert-text').text(BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00060")) 
				fullPopOpen('alertModalLayer')			
				return;
			}
		}
		$('.flight-layer').hide();
		$('.date-layer').hide();
		ticketingWrap.find('.customer-layer').hide()
		$('.quick-booking').addClass('active');
	    $('.quick-booking').trigger('addClassActive');
		removeUnderLine();    	
		$(this).addClass('on');
		if($(this).attr('id')==='btnDatePicker'){
			open()			
			$("#dateLayer").show();
		}else{
			open()
			$("#multiDateLayer").show();
		}	
	});	


	// 프로모션 코드 활성화 체크
	promotionInp.on('focusin', function () {
		promotionTop.addClass('focus')
		removeUnderLine();    
	});
	promotionInp.on('focusout', function () {
		promotionTop.removeClass('focus')
	});
}

//즐겨찾기 공항 DB 저장
function insertFavoritesAirport(airportCode) {
	$.ajax({
		//url: 'insertAirportFavorites.json',
		url: searchUrl+'/'+ I18N.language +'/ibe/booking/insertAirportFavorites.json',
		type: 'post',
		data: {			
			mbrId: JSON.parse(USER_INFO.get()).userId,
			airportCode: airportCode
		},
		success: function (data) {
			const result = data.result;
		},
		error: function () {
		}
	});
}


function pickerMoveMonth(){
	let year = $(".flatpickr-wrapper").eq(0).find(".dayContainer").eq(0).find('.year').html()
	let month = $(".flatpickr-wrapper").eq(0).find(".dayContainer").eq(0).find('.month').html()
	if(month.length ==1){
		month = "0"+month;
	}
	if(bookType ==='Common' && $("#txtPromoCode").val() == "" && $("#paymentRadio01").is(":checked")){	
		let stationType = 'ARR'
		if($(".date-layer:visible").attr('id') == 'multiDateLayer'){
			stationType = 'MultiARR'
		}
	}
}

function selectDate(){
	let startRange,endRange;
	let ticketingDate = $('.date-layer:visible').parent().prev().find('.ticketing-date')

	if(tripType == 'RT'){
		if(typeof $('.endRange').attr('aria-label') =='undefined'){
			return;
		}
		startRange = $("#selectDate").data("startdate")
		endRange = $('.endRange').attr('aria-label')
		ticketingDate.find('.txt').text(dUtil.dateWeekNameTime(startRange,I18N.language)+" ~ "+dUtil.dateWeekNameTime(endRange,I18N.language))
		$("#departureDate").val(startRange.substring(0,4)+'-'+startRange.substring(4,6)+'-'+startRange.substring(6,8));
		$("#arrivalDate").val(endRange.substring(0,4)+'-'+endRange.substring(4,6)+'-'+endRange.substring(6,8));
	}else{	
		if($("#multiDateLayer").is(":visible")){
			startRange = $("#selectMultiDate").next().find('.flatpickr-day.selected').eq(0).attr('aria-label')		
			$("#multiArrivalDate").val(startRange.substring(0,4)+'-'+startRange.substring(4,6)+'-'+startRange.substring(6,8));
			if($("#departureDate").val().replace(/[^0-9]/g,'') > startRange){
				$("#departureDate").val(startRange.substring(0,4)+'-'+startRange.substring(4,6)+'-'+startRange.substring(6,8));
				$('.ticketing-date').eq(0).find('.txt').text(dUtil.dateWeekNameTime(startRange,I18N.language))				
			}
		}else{
			startRange = $("#selectDate").next().find('.flatpickr-day.selected').eq(0).attr('aria-label')
			if(typeof startRange != "undefined"){					
				$("#departureDate").val(startRange.substring(0,4)+'-'+startRange.substring(4,6)+'-'+startRange.substring(6,8));
			}
			//MT의 경우 구간2를 자동 SET 
		}
		if(typeof startRange != "undefined"){
			ticketingDate.find('.txt').text(dUtil.dateWeekNameTime(startRange,I18N.language))	
		}
	}

	$('.date-layer').slideUp(200)
	controlOtherEventDisabled(false);
	activeSearchFlight();	
}

function exchangeRoute(type){
	let selectedDepartureData = $("#departureData")
	let selectedDepartureDesc = $("#spanDepartureDesc")
	let selectedArrivalData = $("#arrivalData")	
	let selectedArrivalDesc = $("#spanArrivalDesc")
	let stationType = "ARR"
	let selectedDate = $("#departureDate").val()
	if(type ==='Multi'){
		selectedDepartureData = $("#multiDepartureData")
		selectedDepartureDesc = $("#spanMultiDepartureDesc")
		selectedArrivalData = $("#multiArrivalData")
		selectedArrivalDesc = $("#spanMultiArrivalDesc")
		stationType = "MultiARR"
		selectedDate = $("#multiArrivalDate").val()	
	}	
	if(selectedDepartureData.data("stationcode") != null &&  selectedArrivalData.data("stationcode") != null){
		let temCode = selectedDepartureData.data("stationcode")
		let temName = selectedDepartureData.data("departurename")
		let temHTML = selectedDepartureDesc[0].textContent
			
		selectedDepartureDesc[0].textContent = selectedArrivalDesc[0].textContent;
		selectedDepartureData.data("stationcode" , selectedArrivalData.data("stationcode"));
		selectedDepartureData.data("departurename" , selectedArrivalData.data("arrivalname"));		

		selectedArrivalDesc[0].textContent = temHTML;
		selectedArrivalData.data("stationcode" , temCode);
		selectedArrivalData.data("arrivalname" , temName);
	}
	
}

function clearDate(){
	if(typeof $("#departureData").data("stationcode") !='undefined' && typeof $("#arrivalData").data("stationcode") !='undefined'){
		pickerMoveMonth();
	}
}

function removeUnderLine() {
	$('.main-ticketing, .ticketing').find('.start, .target, .btn-date').removeClass('on');
} 

function closeLayer(){
	$(".layer-close").trigger('click');
}

function clickPrevButton(){
	if($("#depAirportLayer").is(":visible")){
		$("#depAirportLayer").find(".layer-close").trigger('click');
	}else if($("#arrAirportLayer").is(":visible")){
		$("#arrAirportLayer").find(".layer-close").trigger('click');
		$("#spanDepartureDesc").parent().trigger('click');	
	}else if($("#dateLayer").is(":visible")){
		$("#dateLayer").find(".layer-close").trigger('click');
		$("#spanArrivalDesc").parent().trigger('click');	
	}
}

//am4 map
let AirportMapLayer = function (mapNum) {	
	am4core.useTheme(am4themes_animated);	
	am4core.addLicense("MP280293716")
	var chart = am4core.create(mapNum, am4maps.MapChart);
	chart.geodata = am4geodata_worldHigh;

	// 기본 지역 셋팅 
	chart.homeZoomLevel = 5;
	chart.homeGeoPoint = {
		latitude: 30,
		longitude: 95
	};
	chart.projection = new am4maps.projections.Miller();

	//기본 권역 static 설정
	this.changeZoomArea = function (num) {
		let latitude , longitude , zoomLevel
		if(num == 'RGTP000001'){
			latitude = 35.5593
			longitude = 126.8030
			zoomLevel = 25
		}else if(num == 'RGTP000002'){
			latitude = 35.41
			longitude = 125.8030
			zoomLevel = 10
		}else if(num == 'RGTP000003'){
			latitude = 13.7522
			longitude = 100.494
			zoomLevel = 10
		}else if(num == 'RGTP000004'){
			latitude = 15.1189
			longitude = 145.729
			zoomLevel = 25
		}else if(num == 'RGTP000005'){
			latitude = 43.13
			longitude = 131.9
			zoomLevel = 25
		}
		chart.zoomToGeoPoint({latitude: latitude,longitude: longitude}, zoomLevel , true);		
	}
    const labelsContainer = chart.createChild(am4core.Container);
    labelsContainer.isMeasured = false;
    labelsContainer.x = 80;
    labelsContainer.y = 27;
    labelsContainer.layout = "horizontal";
    labelsContainer.zIndex = 1;
    
    const originTitle = labelsContainer.createChild(am4core.Label);
    originTitle.text = "";
    originTitle.isMeasured = true;
    originTitle.fill = am4core.color("#cc0000");
    originTitle.fontSize = 15;
    originTitle.valign = "middle";
    originTitle.dy = 2;
   	originTitle.marginLeft = 15;

    const destinationTitle = labelsContainer.createChild(am4core.Label);
    destinationTitle.text = "";
    destinationTitle.isMeasured = true;
    destinationTitle.fill = am4core.color("#cc0000");
    destinationTitle.fontSize = 15;
    destinationTitle.valign = "middle";
    destinationTitle.dy = 2;
    destinationTitle.marginLeft = 15;

	//배경 바다색 정의
	chart.background.fill = am4core.color("#BFE3FF");
	chart.background.fillOpacity = 1;

    //The world 지도 데이터를 이용하여 지도를 그림
    let worldPolygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
    worldPolygonSeries.useGeodata = true;
    worldPolygonSeries.fillOpacity = 1;
    worldPolygonSeries.exclude = ["AQ"];    // Exclude Antractica 남극 대륙 제외 ISO2 코드('KR')

	// Configure series
	let polygonTemplate = worldPolygonSeries.mapPolygons.template;
	polygonTemplate.fill = am4core.color("#F8F8F8");
	polygonTemplate.fillOpacity = 1;
	
	// Create image series
	var ImageSeries = chart.series.push(new am4maps.MapImageSeries());
		
	// Create Icon
	var ImageTemplate = ImageSeries.mapImages.template;
	var marker = ImageTemplate.createChild(am4core.Image);
	marker.href = "/resources/images/icon/pin_destination.png";
	marker.width = 20;
	marker.height = 20;
	marker.nonScaling = true;
	marker.horizontalCenter = "middle";
	marker.verticalCenter = "bottom";
	
	//클릭 비활성화    
	ImageTemplate.cursorOverStyle = am4core.MouseCursorStyle.default;
	
	// Set property fields
	ImageTemplate.propertyFields.latitude = "latitude";
	ImageTemplate.propertyFields.longitude = "longitude";

    // 지도의 초기 데이터 주입
    if(mapNum.indexOf('target')>-1){
		//가는편의 공항을 그려줘야 선이 그려짐
		for(let i=0; i<departureAiportsMap.length; i++){
			if(departureAiportsMap[i].stationCode == $("#departureData").data("stationcode")){
				arrivalAiportsMap.push(departureAiportsMap[i])
				break;
			}
		}	    
    	ImageSeries.data = arrivalAiportsMap;
	}else{
		 ImageSeries.data = departureAiportsMap;
	}

    chart.events.on("ready", function () {
    	//조회된 도시 중 가장 첫번째 도시로 ZOOM
		zoomGeoPoint(ImageSeries.dataItems.getIndex(0));
    })
    
	function zoomGeoPoint(drawLineData) {	
	    var dataContext = drawLineData.dataContext;
	    chart.zoomToGeoPoint({ latitude: dataContext.latitude, longitude: dataContext.longitude }, 20.0, true);	
	}
	
	//라인 object 생성
	let lineSeries = chart.series.push(new am4maps.MapLineSeries());
	
	this.zoomIn = function(_this){		
		if($("#depAirportLayer").is(":visible")){
			let latitude = _this.find('button').eq(0).data('latitude')
			let longitude = _this.find('button').eq(0).data('longitude')	
			chart.zoomToGeoPoint({ latitude: latitude, longitude: longitude }, 35.0, true);
			_this.data('selected' , 'true');
		}		
		if($("#arrAirportLayer").is(":visible")){
			//도착지 정보
			let arrivalMapData;
			for(let i=0; i<arrivalAiportsMap.length; i++){
				if(arrivalAiportsMap[i].stationCode === _this.find('button').eq(0).data('stationcode')){
					arrivalMapData = arrivalAiportsMap[i]
					break;
				}
			}		
			
			let departureMapData = [];
			departureMapData.push($("#departureData").data("stationcode"));
			departureMapData.push($("#departureData").data("latitude"));
			departureMapData.push($("#departureData").data("longitude"));
			
			let drawLineData = {		
				departureMapData : departureMapData,
				arrivalMapData: arrivalMapData			
			};			
			airportMapLayer.showLines(drawLineData)			
		}
	}

    this.showLines = function(drawLineData){    
		//기존 LINE 삭제    
		lineSeries.mapLines.clear();

		const arrivalMapData = drawLineData.arrivalMapData;
        const departureMapData = drawLineData.departureMapData;

		$.ajax({
			url: searchUrl+'/'+ I18N.language +'/ibe/booking/selectFlyingTime.json',
			type: 'POST',
			data	: {
				departure : departureMapData[0],
				arrival : arrivalMapData.stationCode
			},    
			success: function (data) {
				//라인 색상
			    lineSeries.mapLines.template.stroke = am4core.color("#ff5500");
				
				//tooltip 배경색
				lineSeries.fill = am4core.color("#ff5500");
				lineSeries.mapLines.template.alwaysShowTooltip = true
			    lineSeries.mapLines.template.shortestDistance = false;  // If you'd like the lines to appear straight, use shortestDistance = false setting:
			    lineSeries.mapLines.template.strokeWidth = 3;
			    lineSeries.mapLines.template.nonScalingStroke = true;

			    //toolTip Text
				if(typeof data.data.FLIGHT_TM !="undefined"){
					lineSeries.mapLines.template.tooltipHTML = data.data.FLIGHT_TM.substring(0,2)+":"+data.data.FLIGHT_TM.substring(2,4)
					lineSeries.mapLines.template.tooltipPosition = "fixed"
				}else{
					lineSeries.mapLines.template.tooltipHTML = BIZ_COMMONS_SCRIPT.getI18n("0000000466.msg00058") //비행시간
					lineSeries.mapLines.template.tooltipPosition = "fixed"
				}
				//라인 그리기
				let line = lineSeries.mapLines.create();
				line.imagesToConnect = [departureMapData[0] , arrivalMapData.id];
				//선을 그었을때 그 중간값
				let zoomLatitude = (arrivalMapData.latitude+departureMapData[1])/2
				let zoomLongitude = (arrivalMapData.longitude+departureMapData[2])/2
				let zoomLevel = 20.0
				if(Math.abs(arrivalMapData.latitude-departureMapData[1]) > 20){
					zoomLevel = 8.0		
				}
        		chart.zoomToGeoPoint({latitude: zoomLatitude,longitude: zoomLongitude}, zoomLevel, true);       
			}
		});
	}
	
	this.clearOldLines = function(){
      lineSeries.mapLines.clear();
      lineSeries.toBack();
      worldPolygonSeries.toBack();
    }

    const graticuleSeries = chart.series.push(new am4maps.GraticuleSeries());  // 격자 모양 출력
    graticuleSeries.mapLines.template.line.strokeOpacity = 0.04;                // 격자의 투명도

	let selectedStationcode = "";
	let selectedMapButton;
	if($("#depAirportLayer").is(":visible") && typeof $("#departureData").data("stationcode") != "undefined"){
		selectedStationcode = $("#departureData").data("stationcode")
		selectedMapButton = $(".tab-swipe-wrapper").eq(0)
	}
	if($("#arrAirportLayer").is(":visible") && typeof $("#arrivalData").data("stationcode") != "undefined"){
		selectedStationcode = $("#arrivalData").data("stationcode")
		selectedMapButton = $(".tab-swipe-wrapper").eq(1)
	}
	if($("#depMultiAirportLayer").is(":visible") && typeof $("#multiDepartureData").data("stationcode") != "undefined"){
		selectedStationcode = $("#multiDepartureData").data("stationcode")
		selectedMapButton = $(".tab-swipe-wrapper").eq(2)
	}
	if($("#arrMultiAirportLayer").is(":visible") && typeof $("#multiArrivalData").data("stationcode") != "undefined"){
		selectedStationcode = $("#multiArrivalData").data("stationcode")
		selectedMapButton = $(".tab-swipe-wrapper").eq(3)
	}
	if(selectedStationcode !=""){
		for(let i=0; i<selectedMapButton.find('.tab-swipe-item').length; i++){
			if(selectedStationcode === selectedMapButton.find('.tab-swipe-item').eq(i).find('button').eq(0).data('stationcode')){
				selectedMapButton.find('.tab-swipe-item').eq(i).addClass('on')
			}else{
				selectedMapButton.find('.tab-swipe-item').eq(i).removeClass('on')
			}
		}
	}
}

//amchart 상단 , 하단 버튼 클릭
$.fn.mapInnerTab = function () {
	return this.each(function (i) {
		var flightMap = $(this);
	    var areaBtn = flightMap.find('.tab-top-btn');
	    var tabSwiper = flightMap.find('.tab-swipe');	    
	    var areaBtn02 = flightMap.find('.tab-swipe-item');
		//상단 버튼
		areaBtn.on('click', function (e) {
			e.preventDefault();
			areaBtn.removeClass('on');
			$(this).addClass('on');
			let selectedTopIdx = $(this).data('areacode')
			airportMapLayer.changeZoomArea(selectedTopIdx);
			let selectedAirportLayer;
			if($("#depAirportLayer").is(":visible")){
			  selectedAirportLayer = $("#depAirportLayer")
			}else{
				selectedAirportLayer = $("#arrAirportLayer")
			} 		
			for(let i=0; i<selectedAirportLayer.find('div.tab-swipe-wrapper').find('.btn-choose-city').length; i++){
				let $this = selectedAirportLayer.find('div.tab-swipe-wrapper').find('.btn-choose-city').eq(i)
				if($this.data('areacode') == selectedTopIdx){
			    	$this.parent().show();
				}else{
					$this.parent().hide();
			    }
			} 
		})
		//하단 버튼
		areaBtn02.on('click', function (e) {
			e.preventDefault();
			areaBtn02.removeClass('on');
			$(this).addClass('on');
		})
		// 하단 스와이프
		var tabSwipe = new Swiper(tabSwiper, {    
			slidesPerView: 'auto',
		});
	})
}

let setInitFlightDate = function(tripType, depDate , arrDate){
	var len = new Array();
	depInitFlight = new Object();
	var jsDepDate = depDate.replaceAll('-','');
	len[0] = 0;
	if(tripType != 'OW'){
		var jsArrDate = arrDate.replaceAll('-','');
		arrInitFlight = new Object();
		len[1] = 0;
	}

	//기준 시작일로부터 -3일 ~ +3일 체크 
	for(var t=0; t<len.length; t++){
		var pointDate;
		if(t == 0){
			pointDate = jsDepDate;
		}else{
			pointDate = jsArrDate;
		}
		var arr = new Array();
		for(var i=3; i>0; i--){
			var obj = new Object();
			var jsDate = dUtil.termDate('D', -(i), 'ymd', pointDate);
			var jsDateWeek = dUtil.dateWeekNameTime(jsDate,I18N.language);

			obj.date = jsDate;
			obj.dateWeek = jsDateWeek;
			obj.monthDay = jsDateWeek.split(' ')[0];
			obj.day = jsDateWeek.split(' ')[0].substring(5,10);
			obj.week = jsDateWeek.split(' ')[1];
			arr.push(obj);
		}
		for(var i=0; i<4; i++){
			var obj = new Object();
			var jsDate = dUtil.termDate('D', +(i), 'ymd', pointDate);
			var jsDateWeek = dUtil.dateWeekNameTime(jsDate,I18N.language);

			obj.date = jsDate;
			obj.dateWeek = jsDateWeek;
			obj.monthDay = jsDateWeek.split(' ')[0];
			obj.day = jsDateWeek.split(' ')[0].substring(5,10);
			obj.week = jsDateWeek.split(' ')[1];

			arr.push(obj);
		}
		if(t == 0){
			depInitFlight.schedule = arr;
		}else{
			arrInitFlight.schedule = arr;
		}
		if(tripType == 'OW'){
			t = 2;
		}
	}
}
let statusOfFlightNoBtnControl = function(){
	
	var check = true;
	$("[id^=inp3-]").each(function(){
		var id = $(this);
		if(id.val() == ""){
			check = false;
			return false;
		}	
	});
	if($("#depDate").text() == ""){
		check = false;
	}
	if(check){
		$("#btnFlightNoSearch").prop("disabled",false);
	}else{
		$("#btnFlightNoSearch").prop("disabled",true);
	}
}
let controlOtherEventDisabled = function(flag){
	if(flag){
		$("[id^=tripType1-]").each(function(){
			if(!$(this).is(":checked")){
				$(this).attr("disabled",true);
			}
		});
		$("[name=btnTitle]").attr("disabled",true);
	}else{
		$("[id^=tripType1-]").each(function(){
			if(!$(this).is(":checked")){
				$(this).attr("disabled",false);
			}
		});
		$("[name=btnTitle]").attr("disabled",false);
	}

}

let dateRangeChangeInit = function(){
	var customDeviceType;
	
	if(USER_DEVICE.isApp() || USER_DEVICE.isMobile()){
		customDeviceType = "mobile"
	}else{
		customDeviceType = typeof USER_DEVICE.getName() != "undefined" ? USER_DEVICE.getName().toLowerCase() : "";
		if(customDeviceType == "pc"){
			if($('body').attr("class").indexOf("isMobile") > -1){
				customDeviceType = "mobile";
			}
		}
	}
//   	datepicker.redrawShowMonthsFromMinDateToMaxDate(customDeviceType);
   	datepicker.responsive(customDeviceType);
}
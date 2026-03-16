//입력값 체크
var checkForm = function (num) {

	var middle_chk = false;
	var path = location.pathname;

	if (path.indexOf("/hkinvest/")>-1||path.indexOf("/kclotto/d03/")>-1||path.indexOf("/kclotto/d03_b/")>-1||path.indexOf("/kclotto/e01/")>-1) {
		middle_chk = true;
	}

	//이름 존재 유무
	if ( $("#name"+num).length > 0 ) {
		if($("#name"+num).val().replace(/ /g, "") == ""){
			alert("이름을 입력해 주세요.");
			$("#name"+num).focus();
			return false;
		}
	}
	//나이 존재 유무
	if ( $("#age"+num).length > 0 ) {
		if($("#age"+num).val().replace(/ /g, "") == ""){
			alert("나이를 입력해주세요.");
			$("#age"+num).focus();
			return false;
		}
	}
	//전화번호 11자리가 인푸트 1개로 표현된 페이지 유무
	if ( $("#tel"+num).length > 0 ) {
		if($("#tel"+num).val().replace(/ /g, "") == ""){
			alert("휴대폰번호를 입력해주세요.");
			$("#tel"+num).focus();
			return false;
		}

		if (middle_chk) {
			if($("#tel1").val().replace(/-/gi,"").substr(3,1)=="0"||$("#tel1").val().replace(/-/gi,"").substr(3,1)=="1") {
				alert("정확한 번호를 기입해주세요.");
				$("#tel"+num).focus();
				return false;
			}
		}
	}
	//전화번호 4자리가 인푸트 1개로 표현된 페이지 유무
	if ( $("#tel"+num+"-1").length > 0 ) {
		if($("#tel"+num+"-2").val().replace(/ /g, "") == ""){
			alert("휴대폰번호를 입력해주세요.");
			$("#tel"+num+"-2").focus();
			return false;
		}
		if($("#tel"+num+"-3").val().replace(/ /g, "") == ""){
			alert("휴대폰번호를 입력해주세요.");
			$("#tel"+num+"-3").focus();
			return false;
		}
		if($("#tel"+num+"-2").val().length < 4) {
			alert("전화번호을 4자리로 입력해주세요.");
			$("#tel"+num+"-2").focus();
			return false;
		}
		if($("#tel"+num+"-3").val().length < 4) {
			alert("전화번호을 4자리로 입력해주세요.");
			$("#tel"+num+"-3").focus();
			return false;
		}

		if (middle_chk) {
			if($("#tel"+num+"-2").val().substr(0,1)=="0"||$("#tel"+num+"-2").val().substr(0,1)=="1") {
				alert("정확한 번호를 기입해주세요.");
				$("#tel"+num+"-2").focus();
				return false;
			}
		}
	}
	//문의내용 존재 유무
	if ( $("#comment"+num).length > 0 ) {
		if($("#comment"+num).val().replace(/ /g, "") == ""){
			alert("문의내용을 입력해주세요.");
			$("#comment"+num).focus();
			return false;
		}
	}

	if(!$("#agree"+num+"-1").is(":checked")){
		alert("개인정보수집정책에 동의해주세요.");
		return false;
	}
	if ( $("#agree"+num+"-2").length > 0 ) {
		if(!$("#agree"+num+"-2").is(":checked")){
			alert("제3자 정보 제공에 동의해주세요.");
			return false;
		}
	}


//	 if ( $("#agree"+num+"-3").length > 0 ) {
//		if(!$("#agree"+num+"-3").is(":checked")){
//			alert("야간 문자수신에 동의해주세요.");
//			return false;
//		}
//	}
//	if ( $("#agree"+num+"-4").length > 0 ) {
//		if(!$("#agree"+num+"-4").is(":checked")){
//			alert("제3자 제공에 동의해주세요.");
//			return false;
//		}
//	} 
	return true;
}

//포커스 이동
$(function(){
	//기본 (연락처만)
	$("input").keyup(function(e){
		if( $(this).val().length==$(this).attr("maxlength") ){
			$(this).next("input").focus();
			if (  $(this).next("input").length == 0 ) {
				$(this).next().next("input").focus();
			}
			if( $(this).parents(".input_text_wrap").next().find("input[type='tel']") ){
				$(this).parents(".input_text_wrap").next().find("input[type='tel']").focus();
			}
			if( $(this).parents(".input_tel_wrap").next().find("input[type='tel']") ){
				$(this).parents(".input_tel_wrap").next().find("input[type='tel']").focus();
			}
		}
	})
	//이름1 존재 유무
	if ( $("#name1").length > 0 ) {
		//전화번호 4자리가 인푸트 1개로 표현된 페이지 유무
		if ( $("#tel1-1").length > 0 ) {
			$("input[name=name1]").keyup(function() {
				var idx = $(this).index("input[name=name1]");
				if ($(this).val().length == 5) {
					var NextInput = $("input[name=tel1-2]").eq(idx).focus();
				}
			})
			$("input[name=name2]").keyup(function() {
				var idx = $(this).index("input[name=name2]");
				if ($(this).val().length == 5) {
					var NextInput = $("input[name=tel2-2]").eq(idx).focus();
				}
			})
			$("input[name=name3]").keyup(function() {
				var idx = $(this).index("input[name=name3]");
				if ($(this).val().length == 5) {
					var NextInput = $("input[name=tel3-2]").eq(idx).focus();
				}
			})
			$("input[name=name4]").keyup(function() {
				var idx = $(this).index("input[name=name4]");
				if ($(this).val().length == 5) {
					var NextInput = $("input[name=tel4-2]").eq(idx).focus();
				}
			})
		}
		//전화번호 11자리가 인푸트 1개로 표현된 페이지 유무
		if ( $("#tel1").length > 0 ) {
			$("input[name=name1]").keyup(function() {
				var idx = $(this).index("input[name=name1]");
				if ($(this).val().length == 5) {
					var NextInput = $("input[name=tel1]").eq(idx).focus();
				}
			})
			$("input[name=name2]").keyup(function() {
				var idx = $(this).index("input[name=name2]");
				if ($(this).val().length == 5) {
					var NextInput = $("input[name=tel2]").eq(idx).focus();
				}
			})
			$("input[name=name3]").keyup(function() {
				var idx = $(this).index("input[name=name3]");
				if ($(this).val().length == 5) {
					var NextInput = $("input[name=tel3]").eq(idx).focus();
				}
			})
			$("input[name=name4]").keyup(function() {
				var idx = $(this).index("input[name=name4]");
				if ($(this).val().length == 5) {
					var NextInput = $("input[name=tel4]").eq(idx).focus();
				}
			})
		}
		//이메일 존재 유무
		if ( $("#email1").length > 0 ) {
			$("input[name=tel1-3]").keyup(function() {
				var idx = $(this).index("input[name=tel1-3]");
				if ($(this).val().length == 4) {
					var NextInput = $("input[name=email1]").eq(idx).focus();
				}
			})
			$("input[name=tel2-3]").keyup(function() {
				var idx = $(this).index("input[name=tel2-3]");
				if ($(this).val().length == 4) {
					var NextInput = $("input[name=email2]").eq(idx).focus();
				}
			})
			$("input[name=tel3-3]").keyup(function() {
				var idx = $(this).index("input[name=tel3-3]");
				if ($(this).val().length == 4) {
					var NextInput = $("input[name=email3]").eq(idx).focus();
				}
			})
			$("input[name=tel4-3]").keyup(function() {
				var idx = $(this).index("input[name=tel4-3]");
				if ($(this).val().length == 4) {
					var NextInput = $("input[name=email4]").eq(idx).focus();
				}
			})
		}
		//흡연기간
	if ( $("#cigar1-1").length > 0 ) {
			$("input[name=tel1-3]").keyup(function() {
				var idx = $(this).index("input[name=tel1-3]");
				if ($(this).val().length == 4) {
					var NextInput = $("input[name=cigar1-1]").eq(idx).focus();
				}
			})
			$("input[name=tel2-3]").keyup(function() {
				var idx = $(this).index("input[name=tel2-3]");
				if ($(this).val().length == 4) {
					var NextInput = $("input[name=cigar2-1]").eq(idx).focus();
				}
			})
			$("input[name=tel3-3]").keyup(function() {
				var idx = $(this).index("input[name=tel3-3]");
				if ($(this).val().length == 4) {
					var NextInput = $("input[name=cigar3-1]").eq(idx).focus();
				}
			})
			$("input[name=tel4-3]").keyup(function() {
				var idx = $(this).index("input[name=tel4-3]");
				if ($(this).val().length == 4) {
					var NextInput = $("input[name=cigar3-1]").eq(idx).focus();
				}
			})
		}
		//흡연량
		if ( $("#cigar1-2").length > 0 ) {
			$("input[name=cigar1-1]").keyup(function() {
				var idx = $(this).index("input[name=cigar1-1]");
				if ($(this).val().length == 2) {
					var NextInput = $("input[name=cigar1-2]").eq(idx).focus();
				}
			})
			$("input[name=cigar2-1]").keyup(function() {
				var idx = $(this).index("input[name=cigar2-1]");
				if ($(this).val().length == 2) {
					var NextInput = $("input[name=cigar2-2]").eq(idx).focus();
				}
			})
			$("input[name=cigar3-1]").keyup(function() {
				var idx = $(this).index("input[name=cigar3-1]");
				if ($(this).val().length == 2) {
					var NextInput = $("input[name=cigar3-2]").eq(idx).focus();
				}
			})
			$("input[name=cigar3-1]").keyup(function() {
				var idx = $(this).index("input[name=cigar3-1]");
				if ($(this).val().length == 2) {
					var NextInput = $("input[name=cigar3-2]").eq(idx).focus();
				}
			})
		}
		//키 존재 유무
		if ( $("#height1").length > 0 ) {
			$("input[name=tel1-3]").keyup(function() {
				var idx = $(this).index("input[name=tel1-3]");
				if ($(this).val().length == 4) {
					var NextInput = $("input[name=height1]").eq(idx).focus();
				}
			})
			$("input[name=tel2-3]").keyup(function() {
				var idx = $(this).index("input[name=tel2-3]");
				if ($(this).val().length == 4) {
					var NextInput = $("input[name=height2]").eq(idx).focus();
				}
			})
			$("input[name=tel3-3]").keyup(function() {
				var idx = $(this).index("input[name=tel3-3]");
				if ($(this).val().length == 4) {
					var NextInput = $("input[name=height3]").eq(idx).focus();
				}
			})
			$("input[name=tel4-3]").keyup(function() {
				var idx = $(this).index("input[name=tel4-3]");
				if ($(this).val().length == 4) {
					var NextInput = $("input[name=height4]").eq(idx).focus();
				}
			})
			//체중 존재 유무
			if ( $("#weight1").length > 0 ) {
				$("input[name=height1]").keyup(function() {
					var idx = $(this).index("input[name=height1]");
					if ($(this).val().length == 3) {
						var NextInput = $("input[name=weight1]").eq(idx).focus();
					}
				})
				$("input[name=height2]").keyup(function() {
					var idx = $(this).index("input[name=height2]");
					if ($(this).val().length == 3) {
						var NextInput = $("input[name=weight2]").eq(idx).focus();
					}
				})
				$("input[name=height3]").keyup(function() {
					var idx = $(this).index("input[name=height3]");
					if ($(this).val().length == 3) {
						var NextInput = $("input[name=weight3]").eq(idx).focus();
					}
				})
				$("input[name=height4]").keyup(function() {
					var idx = $(this).index("input[name=height4]");
					if ($(this).val().length == 3) {
						var NextInput = $("input[name=weight4]").eq(idx).focus();
					}
				})
			}
			//체중 존재 유무
			if ( $("#hope_weight1").length > 0 ) {
				$("input[name=weight1]").keyup(function() {
					var idx = $(this).index("input[name=weight1]");
					if ($(this).val().length == 3) {
						var NextInput = $("input[name=hope_weight1]").eq(idx).focus();
					}
				})
				$("input[name=weight2]").keyup(function() {
					var idx = $(this).index("input[name=weight2]");
					if ($(this).val().length == 3) {
						var NextInput = $("input[name=hope_weight2]").eq(idx).focus();
					}
				})
				$("input[name=weight3]").keyup(function() {
					var idx = $(this).index("input[name=weight3]");
					if ($(this).val().length == 3) {
						var NextInput = $("input[name=hope_weight3]").eq(idx).focus();
					}
				})
				$("input[name=weight4]").keyup(function() {
					var idx = $(this).index("input[name=weight4]");
					if ($(this).val().length == 3) {
						var NextInput = $("input[name=hope_weight4]").eq(idx).focus();
					}
				})
			}
		}
		//나이1 존재 유무
		if ( $("#age1").length > 0 ) {
			$("input[name=name1]").keyup(function() {
				var idx = $(this).index("input[name=name1]");
				if ($(this).val().length == 5) {
					var NextInput = $("input[name=age1]").eq(idx).focus();
				}
			})
			$("input[name=name2]").keyup(function() {
				var idx = $(this).index("input[name=name2]");
				if ($(this).val().length == 5) {
					var NextInput = $("input[name=age2]").eq(idx).focus();
				}
			})
			$("input[name=name3]").keyup(function() {
				var idx = $(this).index("input[name=name3]");
				if ($(this).val().length == 5) {
					var NextInput = $("input[name=age3]").eq(idx).focus();
				}
			})
			$("input[name=name4]").keyup(function() {
				var idx = $(this).index("input[name=name4]");
				if ($(this).val().length == 5) {
					var NextInput = $("input[name=age4]").eq(idx).focus();
				}
			})
			//전화번호 4자리가 인푸트 1개로 표현된 페이지 유무
			if ( $("#tel1-1").length > 0 ) {
				$("input[name=age1]").keyup(function() {
					var idx = $(this).index("input[name=age1]");
					if ($(this).val().length == 2) {
						var NextInput = $("input[name=tel1-2]").eq(idx).focus();
					}
				})
				$("input[name=age2]").keyup(function() {
					var idx = $(this).index("input[name=age2]");
					if ($(this).val().length == 2) {
						var NextInput = $("input[name=tel2-2]").eq(idx).focus();
					}
				})
				$("input[name=age3]").keyup(function() {
					var idx = $(this).index("input[name=age3]");
					if ($(this).val().length == 2) {
						var NextInput = $("input[name=tel3-2]").eq(idx).focus();
					}
				})
				$("input[name=age4]").keyup(function() {
					var idx = $(this).index("input[name=age4]");
					if ($(this).val().length == 2) {
						var NextInput = $("input[name=tel4-2]").eq(idx).focus();
					}
				})
			}
			//전화번호 11자리가 인푸트 1개로 표현된 페이지 유무
			if ( $("#tel1").length > 0 ) {
				$("input[name=age1]").keyup(function() {
					var idx = $(this).index("input[name=age1]");
					if ($(this).val().length == 2) {
						var NextInput = $("input[name=tel1]").eq(idx).focus();
					}
				})
				$("input[name=age2]").keyup(function() {
					var idx = $(this).index("input[name=age2]");
					if ($(this).val().length == 2) {
						var NextInput = $("input[name=tel2]").eq(idx).focus();
					}
				})
				$("input[name=age3]").keyup(function() {
					var idx = $(this).index("input[name=age3]");
					if ($(this).val().length == 2) {
						var NextInput = $("input[name=tel3]").eq(idx).focus();
					}
				})
				$("input[name=age4]").keyup(function() {
					var idx = $(this).index("input[name=age4]");
					if ($(this).val().length == 2) {
						var NextInput = $("input[name=tel4]").eq(idx).focus();
					}
				})
			}
		}
	}
})


//특수문자 제거
function specialCharRemove(obj) {
	var val = obj.value;
	var pattern = /[^(가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9)]/gi;
	if(pattern.test(val)){
		obj.value = val.replace(pattern,"");
	}
};


//한글만 입력
function onlyKorean(form_name) {
	for (var i = 0; i < form_name.value.length; i++) {
		var chr = form_name.value.charAt(i);
		if (chr.charCodeAt() < '129') {
			alert("한글로만 입력해 주세요");
			form_name.focus();
			form_name.value = "";
		}
	}
};
//숫자만 입력
function onlyNumber(event) {
	event = event || window.event;
	var keyID = (event.which)
		? event.which
		: event.keyCode;
	if ((keyID >= 48 && keyID <= 57) || (keyID >= 96 && keyID <= 105) || keyID == 8 || keyID == 46 || keyID == 37 || keyID == 39)
		return;
	 else
		return false;
};
//숫자만 입력
function removeChar(event) {
	event = event || window.event;
	var keyID = (event.which)
		? event.which
		: event.keyCode;
	if (keyID == 8 || keyID == 46 || keyID == 37 || keyID == 39)
		return;
	 else
		event.target.value = event
			.target
			.value
			.replace(/[^0-9]/g, "");
};
//이메일 유효성 검사
function mailcheck(field){
	var emailExp = /([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
   if(!emailExp.test(field.value)){
	alert("이메일 주소가 유효하지 않습니다.");
	field.focus();
   }
}
//날짜 스크립트
function toDate(yyyy, mm, dd) {
	var today = new Date();
	var year = today.getFullYear();
	var month = today.getMonth();
	var day = today.getDate();
	var resultDate = new Date(yyyy+year, month+mm, day+dd);
		year = resultDate.getFullYear();
		month = resultDate.getMonth() + 1;
		day = resultDate.getDate();
		if (month < 10)
			month = "0" + month;
		if (day < 10)
			day = "0" + day;
		return year + "-" + month + "-" + day;
}
$(function(){
	//전체 동의
	$("#agree_all1").click(function(){
		if($("#agree_all1").prop("checked")) {
			$("input[type=checkbox]").prop("checked",true);
		} else {
			$("input[type=checkbox]").prop("checked",false);
		}
	});
	$("#agree_all2").click(function(){
		if($("#agree_all2").prop("checked")) {
			$("input[type=checkbox]").prop("checked",true);
		} else {
			$("input[type=checkbox]").prop("checked",false);
		}
	});
	$("#agree_all3").click(function(){
		if($("#agree_all3").prop("checked")) {
			$("input[type=checkbox]").prop("checked",true);
		} else {
			$("input[type=checkbox]").prop("checked",false);
		}
	});
	$("#agree_all4").click(function(){
		if($("#agree_all4").prop("checked")) {
			$("input[type=checkbox]").prop("checked",true);
		} else {
			$("input[type=checkbox]").prop("checked",false);
		}
	});
});

//전화번호 11자리가 인푸트 1개로 표현된 페이지에 유효성 검사
$(function(){
	$(".tel-check").on('keydown', function(e){
		// 숫자만 입력받기
		var trans_num = $(this).val().replace(/-/gi,'');
		var k = e.keyCode;
		if(trans_num.length >= 11 && ((k >= 48 && k <=126) || (k >= 12592 && k <= 12687 || k==32 || k==229 || (k>=45032 && k<=55203)) ))
		{
			e.preventDefault();
		}
	}).on('blur', function(){ // 포커스를 잃었을때 실행합니다.
		if($(this).val() == '') return;

		// 기존 번호에서 - 를 삭제합니다.
		var trans_num = $(this).val().replace(/-/gi,'');

		// 입력값이 있을때만 실행합니다.
		if(trans_num != null && trans_num != '')
		{
			// 총 핸드폰 자리수는 11글자이거나, 11자여야 합니다.
			if(trans_num.length==11 || trans_num.length==11)
			{
				// 유효성 체크
				var regExp_ctn = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/;
				if(regExp_ctn.test(trans_num))
				{
					// 유효성 체크에 성공하면 하이픈을 넣고 값을 바꿔줍니다.
					trans_num = trans_num.replace(/^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?([0-9]{3,4})-?([0-9]{4})$/, "$1-$2-$3");
					$(this).val(trans_num);

					//번호 이상없이 입력했을 경우
					mode = "join";

					if( $('.intro_page').val() == "인트로18" ){
						var phoneArray = $(this).val().split('-');
						name = $(this).closest("ul").children("li").children('.nameclass').val();
					}
					else{
						var phoneArray = $(".tel-check").val().split('-');
						name = $('.nameclass').val();
					}
				}
				else
				{
					alert("유효하지 않은 전화번호 입니다.");
					$(this).val("");
					$(this).focus();
				}
			}
			else
			{
				alert("유효하지 않은 전화번호 입니다.");
				$(this).val("");
				$(this).focus();
			}
		}
	});
});

//링크 스크롤 이동 start
function go_link() {
	if ( $("#db_table").length > 0 ) {
		$("html, body").stop().animate({
			scrollTop: $("#db_table").offset().top
		});
	} else if ( $("#db_wrap").length > 0 ) {
		$("html, body").stop().animate({
			scrollTop: $("#db_wrap").offset().top
		});
	} else if ( $("#db").length > 0 ) {
		$("html, body").stop().animate({
			scrollTop: $("#db").offset().top
		});
	}
}
function go_link2() {
	if ( $("#db_table2").length > 0 ) {
		$("html, body").stop().animate({
			scrollTop: $("#db_table2").offset().top
		});
	} else if ( $("#db_wrap2").length > 0 ) {
		$("html, body").stop().animate({
			scrollTop: $("#db_wrap2").offset().top
		});
	} else if ( $("#db2").length > 0 ) {
		$("html, body").stop().animate({
			scrollTop: $("#db2").offset().top
		});
	}
}
//2019-08-28 ksb
function crm_number_val(k)
{
	var rt_val = '';
	if (k <'10')
	{
		rt_val = '0';
	}
	else if (k >= '10' && k < '20' )
	{
		rt_val = '1';
	}
	else if (k >= '20' && k < '30' )
	{
		rt_val = '2';
	}
	else if (k >= '30' && k < '40' )
	{
		rt_val = '3';
	}
	else if (k >= '40' && k < '50' )
	{
		rt_val = '4';
	}
	else if (k >= '50' && k < '60' )
	{
		rt_val = '5';
	}
	else if (k >= '60' && k < '70' )
	{
		rt_val = '6';
	}
	else if (k >= '70' && k < '80' )
	{
		rt_val = '7';
	}
	else if (k >= '80' && k < '90' )
	{
		rt_val = '8';
	}
	else{
		rt_val = null;
	}
	return rt_val;
}
//링크 스크롤 이동 end

//약관 start
function policy() {
	window.open("../policy", "a", "width=400, height=500, left=0, top=0");
}

function policy1() {
	window.open("../policy/index1.html", "a", "width=400, height=500, left=0, top=0");
}

function policy2() {
	window.open("../policy/index2.html", "a", "width=400, height=500, left=0, top=0");
}

function policy3() {
	window.open("../policy/index3.html", "a", "width=400, height=500, left=0, top=0");
}
function policy4() {
	window.open("../policy/index4.html", "a", "width=400, height=500, left=0, top=0");
}

function policy5() {
	window.open("../policy/index_sk.html", "a", "width=400, height=500, left=0, top=0");
}

//약관 end

//ok캐쉬백카드번호확인방법
function okcard() {
	window.open("../policy/index_okcard.html", "a", "width=400, height=500, left=0, top=0");
}

function getTimeStamp() {
	var d = new Date();
	var s =
		leadingZeros(d.getFullYear(), 4) + '-' +
		leadingZeros(d.getMonth() + 1, 2) + '-' +
		leadingZeros(d.getDate(), 2) + ' ' +

		leadingZeros(d.getHours(), 2) + ':' +
		leadingZeros(d.getMinutes(), 2) + ':' +
		leadingZeros(d.getSeconds(), 2);
	return s;
}

function leadingZeros(n, digits) {
	var zero = '';
	n = n.toString();

	if (n.length < digits) {
	for (i = 0; i < digits - n.length; i++)
		zero += '0';
	}
	return zero + n;
}



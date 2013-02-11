var currValue = 800;
var rStart = 0;
var rEnd = 0;
var rClick = 0;
var rDiff = 0;
var val1, val2, val3, val4 = "";

//screen resolution
var screenWidth = $(window).width();
var screenHeight = $(window).height();
var $wheel = {};
var wheelWidth = 0;
var wheelOffset = {};

opla = {
		type: 0, //type of input
		icon: {
			baby: 0,
			people: 0,
			help: 0,
			old65: false,
			handicap: false,
			under: false,
			over: false,
			update: function() {
				$('#type .icon').eq(opla.type).addClass('active');
				$.each(this, function(key, value) {
					if(typeof(value) === 'number' || typeof(value) === 'boolean') {
						opla.icon.updateIcon(key); 
					}
				});
				calculate();
			},
			updateIcon: function(icon) {
				if(icon === 'under' || icon === 'over'){
					
					var $icon = $('.icon.under-over');
					if(opla.icon[icon]){
						$icon.addClass(icon);
					} else {
						$icon.removeClass(icon);
					}
					if (opla.icon.under == false && opla.icon.over == false){
						$icon.removeClass('active')
					};
					
					//return false;
				};
		        var $icon = $('.icon.'+icon).html(opla.icon[icon]);
		        if(opla.icon[icon]){
		        	$icon.addClass('active');
		        } else {
		        	$icon.removeClass('active');
		        };
			},
			bind: function() {
		        //bruto/neto
		        $('#type .icon').click(function(){
		        	$('#type .icon').removeClass('active');
		        	opla.type = $(this).addClass('active').index();
                    $('#val1, #val2').css('fontSize', '160%').animate({
                        'fontSize': '130%'
                    });
                    $('#detail').removeClass().addClass('type' + opla.type);
		        	calculate(); //update
		       	});
			}
		},
		buttons: {
			bind: function() {
		        //navigation
				$('.button.setup, div.icons').click(function(){opla.show('setup')});
		        $('.button.main').click(function(){opla.show('main')});
		        $('.button.info').click(function(){opla.show('info')});
		        
		        //settings
		        $('.control.onoff').click(function() {
					var $self = $(this);
					var iconId = $self.parent().attr('id');
					$self.toggleClass('active');
					opla.icon[iconId] = $self.hasClass('active');
					opla.icon.update();
				});

		        $('.control.minus').click(function() {
		        	var $self = $(this);
		        	var iconId = $self.parent().attr('id');
		        	console.log(opla.icon[iconId]);
		        	if(opla.icon[iconId] > 0){
		        		opla.icon[iconId] --;
		        		opla.icon.update();
		        	}
		        });
		        $('.control.plus').click(function() {
		        	var $self = $(this);
		        	var iconId = $self.parent().attr('id');
		        	if(opla.icon[iconId] < 9){
		        		opla.icon[iconId] ++;
		        		opla.icon.update();
		        	}
		        });
		        
			}
		},
		holder: {
			left: 127,
			top: screenHeight - 148
		},
		init: function() {
			
		},
		renderCurr: function(id, val) {
			var val = parseFloat(val);
			$('#'+id).html(val.formatMoney(2, ',', '.', ' €'));
		},
		show: function(page) {
			if(page === 'main'){
				$('#app-frame').removeClass('other');
			}else {
				$('#app-frame').addClass('other');
			}
			$('.page').hide();
			$('#'+page).show();	
		}
};

//default settings
$(document).bind("mobileinit", function(){
	  $.mobile.autoInitializePage = false;
	  $('#holder').offset(opla.holder);
});


function rotate(r) {
	$("#holder").animate({
		path : new $.path.arc({
			center : [ opla.holder.left, opla.holder.top ],
			radius : 37,
			start : r,
			end : r,
			dir : -1
		})
	}, 0);

};
function calculate() {
	topInp = currValue;
	var olajsave = calcOlajsaveFull();
	izracun(olajsave,0);
};
var areaToCoornite = function(width, height, y, x) {
	// area to coordinates
	// width, height -> area dimension
	// y, x -> current point position in area

	var center_top = height - 105;
	var center_left = width / 2;
	var y = center_top - y;
	var x = x - center_left;

	return {
		y : y,
		x : x
	};
}
var xyToDeg = function(y, x) {
	// coordinates to degrease
	//return (Math.ceil(180 - (180 / Math.PI) * Math.atan2(y, x)))-90; //zamik
	
    var r = (Math.ceil((Math.atan2(y, x)+(Math.PI/2))*180/Math.PI)); //zamik
    if(r<0){
        r=360+r;
    }
    return r;

};
var putInput = function() {
	$('#top-inp').html('');
	$('#inp').focus().val('');
}

// calcualtion
var meja_znizanje_osnove_1 = 10622.06;
var meja_znizanje_osnove_2 = 12288.26;

var izracun = function (olajsave, boniteta) {
	var neto = 0, bruto_1 = 0, bruto_2 = 0, znesek;

	try {
		znesek = Math.ceil(currValue);
	} catch (ParseException) {
		znesek = 0.0;
	};
	
	switch (opla.type) {
	case 0:
		neto    = znesek;
		bruto_1 = getBrutoFromNeto(neto, boniteta, olajsave);
		bruto_2 = getStrosekFromBruto(bruto_1, boniteta);
        opla.renderCurr('top-inp', neto); //main -> bruto
        opla.renderCurr('val1', bruto_1); //neto
        opla.renderCurr('val2', bruto_2); //bruto str. delodajalca
        $('#detail').css('background-position','center center');
		break;
	case 1:
		bruto_1 = znesek;
		neto    = getNetoFromBruto(bruto_1,boniteta,olajsave);
	    bruto_2 = getStrosekFromBruto(bruto_1,boniteta);
        opla.renderCurr('val1', neto); //main -> bruto
        opla.renderCurr('top-inp', bruto_1); //neto
        opla.renderCurr('val2', bruto_2); //bruto str. delodajalca
        $('#detail').css('background-position','center top');
		break;
	case 2:
		bruto_2 = znesek;
	    bruto_1 = getBrutoFromStrosek(bruto_2,boniteta);
	    neto    = getNetoFromBruto(bruto_1,boniteta,olajsave);
        opla.renderCurr('val1', neto); //main -> bruto
        opla.renderCurr('val2', bruto_1); //neto
        opla.renderCurr('top-inp', bruto_2); //bruto str. delodajalca
        $('#detail').css('background-position','center bottom');
		break;
	default:
		break;
	};
	
	//update
	opla.renderCurr('val3', olajsave); //davčne olajšave
	opla.renderCurr('val4', boniteta); //stimulacije, bonitete
};

var calcOlajsaveFull = function() {		
	return calcOlajsave(opla.icon.under, opla.icon.over, opla.icon.old65, opla.icon.handicap, opla.icon.baby, opla.icon.people, opla.icon.help);
};

// #####################



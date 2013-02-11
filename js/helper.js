var mejaod = [0, 653.38, 1306.75];
var procent = [16, 27, 41];
var znesek = [0, 104.54, 280.95];

var mejado = [653.38, 1306.75, 999999999];
var meja = [653.38, 1306.75, 3600.69, 172926.05];

var olajsavaMALA_EUR = 262.07;
var olajsavaVELIKA_EUR = 90.90;
var SplosnaOlajsava = 269.04;

Number.prototype.formatMoney = function(c, d, t, v) {
	var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? ","
			: d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math
			.abs(+n || 0).toFixed(c))
			+ "", j = (j = i.length) > 3 ? j % 3 : 0;
	return s + (j ? i.substr(0, j) + t : "")
			+ i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t)
			+ (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "") + v;
};

var calcOlajsave = function(pod_malo_mejo, pod_veliko_mejo, nad_65_let, invalid_100, vzdrzevane_osebe_1, vzdrzevane_osebe_2, vzdrzevane_osebe_3) {
	// boolean pod_malo_mejo, boolean pod_veliko_mejo,boolean nad_65_let, boolean invalid_100,
	// double vzdrzevane_osebe_1, double vzdrzevane_osebe_2, double vzdrzevane_osebe_3
	var Po65 = 115.78;
	var Invalidi100 = 1438.49;
	var PosebnaNega = 719.29;
	var DrugiVzdrzClan = 198.51;
	var VrednostPolja = [];
	
	VrednostPolja[1] = 198.51;
	VrednostPolja[2] = 215.81;
	VrednostPolja[3] = 359.93;
	VrednostPolja[4] = 504.06;
	VrednostPolja[5] = 648.19;
	VrednostPolja[6] = 792.32;
    VrednostPolja[7] = 936.45;

	var olajsava = SplosnaOlajsava;

	// Nad 65 let
	if(nad_65_let){
		olajsava = olajsava + Po65;
	};
	
	// 100% invalid
	if(invalid_100){
		olajsava = olajsava + Invalidi100;
	};

	//Število vzdrževanih otrok:
	if(vzdrzevane_osebe_1>0){ // 1+ otrok
        var i=1;
        for (i=1;i<=vzdrzevane_osebe_1;i++){
          olajsava = olajsava + VrednostPolja[i];
        };
	};

	//Število vzdrževanih otrok, ki potrebujejo posebno nego
	if(vzdrzevane_osebe_3>0){
		olajsava = olajsava + vzdrzevane_osebe_3*PosebnaNega;
	}
		  
	//Število ostalih vzdrževanih družinskih članov
	if(vzdrzevane_osebe_2 > 0){
		olajsava = olajsava + vzdrzevane_osebe_2*DrugiVzdrzClan;
	}
	if(pod_malo_mejo){
		return olajsava + olajsavaMALA_EUR;
	} else if (pod_veliko_mejo) {
		return olajsava + olajsavaVELIKA_EUR;
	} else {
		return olajsava;
	}
};


//akontacija dohodnine, oad osnova
var getAD = function(oad) {
	var i, il, ad;

	il = 0;
	for (i=0;i<3;i++) {
	  if (oad>=mejaod[i]) {
	    il=i;
	  }  
	};  
	ad = ((oad-mejaod[il])*procent[il])/100+znesek[il];
	if (ad<0) {
	  ad=0;
	};
	return ad;
};
//bruto boniteta davčna olajšava
var getNetoFromBruto = function(b, bon, davo) {
	var n, pd, oad;
	
	pd=0.221*(b+bon);
	oad=b+bon-pd-davo;
	n=b-pd-getAD(oad); 
	n=(n*10)/10;
	return n; 
};
//bruto znesek stroškov
var getStrosekFromBruto = function(b, zs) {
	var s,pf;
	
	pf=getPrispevek()*(b+zs);
	s=b+pf;//+b; 
	return s;
};
var getBrutoFromStrosek = function(s, zs) {
	var b = 0;
  
	for (i=0;i<5;i++) {
		b=(s-getPrispevek()*zs)/(1+getPrispevek());  
		if (b<meja[i]) {      
			break;
		}
	};
 
	b=(b*10)/10;
	return b; 
};

//neto
var getBrutoFromNeto = function(neto, bon, davo) {
	var i, razlika, bruto, osnova, davek;
	var meja_raz = 0;
	var procent_raz = 0;
	var znesek_raz = 0;
	var fp=0.221;  
	var bruto = neto*(1+fp);
	 
	  
	for (i=0;i<10000;i++) {
	    /*osnova = bruto+bon-davo-(bruto*fp);*/
		osnova = bruto+bon-davo-(bruto+bon)*fp;
	    if (osnova<0) {
	      osnova = 0;
	    };
	    
	    if (osnova>mejaod[2]) {
	      meja_raz    = mejaod[2];
	      procent_raz = procent[2];
	      znesek_raz  = znesek[2];
	    } else if (osnova>mejaod[1]) {
	      meja_raz    = mejaod[1];
	      procent_raz = procent[1];
	      znesek_raz  = znesek[1];
	    } else if (osnova>mejaod[0]) {
	      meja_raz    = mejaod[0];
	      procent_raz = procent[0];
	      znesek_raz  = znesek[0];
	    }; 
	    
	    if (osnova==0) {
	      davek = 0;
	    } else {
	      davek = (osnova-meja_raz)*(procent_raz/100)+znesek_raz;
	    }; 
		
	   /* if (bruto>=n+bruto*fp+davek) {*/
	   if (bruto>neto+(bruto+bon)*fp+davek) {
	      /*razlika = bruto-(n+bruto*fp+davek);*/
		  razlika = bruto-(neto+(bruto+bon)*fp+davek);
	      if ((razlika>=-0.01) & (razlika<=0.01)) {
	        bruto=(bruto*10)/10;
	        if (bruto<0) {
	          bruto=0;
	        };  
	        return bruto;      
	      } else {
	        bruto = bruto-razlika/2;
	      };
	    } else if (bruto<neto+(bruto+bon)*fp+davek) {
	     /* razlika = bruto+(n+bruto*fp+davek); */
		  razlika = (neto+(bruto+bon)*fp+davek)-bruto;
	      if ((razlika>=-0.01) & (razlika<=0.01)) {
	        bruto=(bruto*10)/10;
	        if (bruto<0) {
	          bruto=0;
	        }  
	        return bruto;      
	      } else {
	        bruto = bruto+razlika/2;
	      };     
	    };
	  }; 
	  return 0;
};
var getPrispevek = function() {
	  return 0.161;
};
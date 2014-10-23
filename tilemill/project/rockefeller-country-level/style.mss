/* Color variables */
/* *************** */

@both: #4292C5; // dark
@seeking: #DEEBF7; // light
@providing: #9EC9E0; // middle

@grey: #7a7a7a;

/* Marker width variables */
/* ********************** */

@both0z2: 0;
@both10z2: 10;
@both50z2: 12.5;
@both100z2: 13.5;

@both0: 0;
@both10: 14;
@both50: 16.5;
@both100: 17.5;

/*
Map {
  background-color: #000;
}
*/

#data {
	marker-allow-overlap:true;
    marker-line-opacity:0;
    marker-opacity: 0.9;
    marker-fill: @both;
    marker-width: 20px;
}

#data1 {
	marker-allow-overlap:true;
    marker-line-opacity:0;
    marker-opacity: 0.9;
    marker-fill: @providing;
    marker-width: 26px;
}

#data2 {
	marker-allow-overlap:true;
    marker-line-opacity:0;
    marker-opacity: 0.9;
    marker-fill: @seeking;
    marker-width: 32px;
}
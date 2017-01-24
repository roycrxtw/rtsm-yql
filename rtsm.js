// author: Roy Lu.
// date: 20170110

const TIMEOUT = 3000;
const SITE = "http://1968.freeway.gov.tw/";
var retries = 4;
var queryRetries = 4;

var motorways = {
	// mid, nameTw, nameEn, direction(0:N-S, 1:E-W)
	"10010": {nameTw: "國道1號", nameEn: "M1 Motorway", direction: 0},
	"10019": {nameTw: "國1高架", nameEn: "M1 Elevated Motorway", direction: 0},
	"10020": {nameTw: "國道2號", nameEn: "M2 Motorway", direction: 1},
	"10030": {nameTw: "國道3號", nameEn: "M3 Motorway", direction: 0},
	"10031": {nameTw: "國道3甲", nameEn: "M3A Motorway", direction: 1},
	"10038": {nameTw: "港西聯外道路", nameEn: "PH2F", direction: 0},
	"10039": {nameTw: "南港聯絡道", nameEn: "Nangang Junction", direction: 0},
	"10040": {nameTw: "國道4號", nameEn: "M4 Motorway", direction: 1},
	"10050": {nameTw: "國道5號", nameEn: "M5 Motorway", direction: 0},
	"10060": {nameTw: "國道6號", nameEn: "M6 Motorway", direction: 1},
	"10080": {nameTw: "國道8號", nameEn: "M8 Motorway", direction: 1},
	"10100": {nameTw: "國道10號", nameEn: "M10 Motorway", direction: 1},
	"20620": {nameTw: "快速公路62號", nameEn: "PH62 Expressway", direction: 1},
	"20640": {nameTw: "快速公路64號", nameEn: "PH64 Expressway", direction: 1},
	"20660": {nameTw: "快速公路66號", nameEn: "PH66 Expressway", direction: 1},
	"20680": {nameTw: "快速公路68號", nameEn: "PH68 Expressway", direction: 1},
	"20720": {nameTw: "快速公路72號", nameEn: "PH72 Expressway", direction: 1},
	"20740": {nameTw: "快速公路74號", nameEn: "PH74 Expressway", direction: 1},
	"20760": {nameTw: "快速公路76號", nameEn: "PH76 Expressway", direction: 1},
	"20780": {nameTw: "快速公路78號", nameEn: "PH78 Expressway", direction: 1},
	"20820": {nameTw: "快速公路82號", nameEn: "PH82 Expressway", direction: 1},
	"20840": {nameTw: "快速公路84號", nameEn: "PH84 Expressway", direction: 1},
	"20860": {nameTw: "快速公路86號", nameEn: "PH86 Expressway", direction: 1},
	"20880": {nameTw: "快速公路88號", nameEn: "PH88 Expressway", direction: 1}
};

setJunctionMenus(10010);

function quickAccess(mid) {
	queryRetries = 4;
	switch (mid) {
		case 10010:
			doSubmit(10010, 0, 374400);
			break;
		case 10030:
			doSubmit(10030, 0, 431500);
			break;
		case 10050:
			doSubmit(10050, 0, 54300);
			break;
		default:
			doSumbit(10010, 0, 374400);
	}
}

/**
 * Do the actual job that query data from the official site.
 * This function will send a XMLHttpReqeust to the YQL service to query data
 * from the official site. And the return data will be sent to a callback
 * function setSpeedData() for further process.
 * 
 * @param {string} mid The motorway id
 * @param {string} jidA The id of junction-from
 * @param {string} jidB The id of junciton-to
 * @returns {undefined} void
 */
function doSubmit(mid, jidA, jidB) {
	// eg. http://1968.freeway.gov.tw/traffic/getsectraffic/fid/10050/from/15100/end/46500

	var d = new Date();
	var rnd = "t" + d.getMonth() + d.getDay() + d.getHours() + d.getMinutes();
	var targetUrl = SITE + "traffic/getsectraffic/fid/" + mid + "/from/" + jidA + "/end/" + jidB + "?r=" + rnd;
	var queryString = "SELECT * FROM html WHERE url=\"" + targetUrl + "\"";

	console.log("doSubmit().query=" + queryString);

	var url = "https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(queryString)
			+ "&format=json&callback=";
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.timeout = TIMEOUT;
	xhr.onload = function () {
		setSpeedData(mid, xhr);
	};
	xhr.ontimeout = function () {
		queryTimeoutHandler(mid, jidA, jidB);
	};
	xhr.send();

}

// Setup every args that doSumit needs.
function submit() {
	queryRetries = 4;
	var m = document.getElementById("menu-motorway");
	var mid = m.options[m.selectedIndex].value;

	var mja = document.getElementById("menu-junction-from");
	var jidA = mja.options[mja.selectedIndex].value;
	var junctionA = mja.options[mja.selectedIndex].text;

	var mjb = document.getElementById("menu-junction-to");
	var jidB = mjb.options[mjb.selectedIndex].value;
	var junctionB = mjb.options[mjb.selectedIndex].text;

	//console.log("submit(): mid=" + mid + ", junction from " + junctionA + "(" + jidA + "), to "
	//		+ junctionB + "(" + jidB + ").");

	doSubmit(mid, jidA, jidB);
}

/**
 * Set the menu of junctions by the data from official site.
 * @param {Object} xhr A XMLHttpRequest Object
 * @param {boolean} selectLast Ture if select the last item in default.
 * @returns {undefined}
 */
function setJunctionMenu(xhr, selectLast = false) {
	var text = xhr.responseText;	// Get the response text and
	var json = JSON.parse(text);	// parse it to JSON object.
	
	// Get raw options from original data.
	var rows = json.query.results.body.select.option;
	var element = "";
	var option = "";
	if (Array.isArray(rows)) {
		// create a select element
		for (var i = 0; i < rows.length; i++) {
			if (i === rows.length - 1 && selectLast === true) {
				option = "<option selected='selected' value=" + rows[i].value + ">" + rows[i].content + "</option>";
			} else {
				option = "<option value=" + rows[i].value + ">" + rows[i].content + "</option>";
			}
			element += option;
		}
	} else {		// Not an array
		if (i === rows.length - 1 && selectLast === true) {
			option = "<option selected='selected' value=" + rows.value + ">" + rows.content + "</option>";
		} else {
			option = "<option value=" + rows.value + ">" + rows.content + "</option>";
		}
		element += option;
	}

	if (!selectLast) {
		document.getElementById("menu-junction-from").innerHTML = element;
	} else {
		document.getElementById("menu-junction-to").innerHTML = element;
	}
}

/**
 * Set junction menus(from and to) by a given motorway id(mid)
 * @param {string} mid The motorway id, it's set by official site.
 * @returns {undefined} void
 */
function setJunctionMenus(mid) {
	if (!mid) {		// if not exist, use motorway id from menu.
		var m = document.getElementById("menu-motorway");
		mid = m.options[m.selectedIndex].value;
	}
	
	// Use XMLHttRequest to get junction menu from the Official site.
	var query = "select * from html where url=\"" + SITE + "common/getnodsecs/fid/" + mid + "?id=from_selt\"";
	var url = "https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query)
			+ "&format=json&callback=";
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.timeout = TIMEOUT;
	xhr.ontimeout = function () {
		menuTimeoutHandler(mid);
	};
	xhr.onerror = function () {
		alert("An error happened.");
	};
	xhr.onload = function () {
		setJunctionMenu(xhr, false);
	};
	xhr.send();

	// Get the junction-to menu
	query = "select * from html where url=\"" + SITE + "common/getnodsecs/fid/" + mid + "?lc=1&id=end_selt\"";
	url = "https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query)
			+ "&format=json&callback=";
	var xhr2 = new XMLHttpRequest();		// caution: Have to create another xhr object
	xhr2.open("GET", url, true);
	xhr2.timeout = TIMEOUT;
	xhr2.ontimeout = function () {
		menuTimeoutHandler(mid);
	};
	xhr2.onload = function () {
		setJunctionMenu(xhr2, true);
	};
	xhr2.onerror = function () {
		alert("An error happened.");
	};
	xhr2.send();
}

// #roy-todo: timeout handler
function menuTimeoutHandler(mid) {
	//console.log("menuTimeoutHandler");
	retries--;
	if (retries > 0) {
		setJunctionMenus(mid);
	} else {
		console.error("bye bye.");
	}
}

function queryTimeoutHandler(mid, jidA, jidB) {
	queryRetries--;
	if (queryRetries > 0) {
		doSubmit(mid, jidA, jidB);
	} else {
		console.error("Query timeout. Bye bye");
	}
}

/**
 * #roy-todo: Set motorway menu for TW an EN lang.
 * @returns {undefined}
 */
function setMotorwayMenu() {
	//#roy-todo
}

/**
 * Set up the speed data table in the main page.
 * 
 * This function will format the raw data into html layout.
 * @param {string} argName Junction name
 * @param {string} argSpeedA SpeedA, this direction will be set in
 *	initSpeedDataTable().
 * @param {string} argSpeedB SpeedB, this direction will be set in
 *	initSpeedDataTable().
 * @returns {undefined} void
 */
function printSpeedData(argName, argSpeedA, argSpeedB) {
	var name = "<div class='d-name'>" + argName + "</div>";
	var speedA = "<div class='d-speed' data-value='" + argSpeedA + "'>" + argSpeedA + "</div>";
	var speedB = "<div class='d-speed' data-value='" + argSpeedB + "'>" + argSpeedB + "</div>";
	var row = "<div class='d-row'>" + name + speedA + speedB + "</div>";

	document.getElementById("speedDataTable").innerHTML += row;
}

/**
 * Init the speed data table by motorway id(mid)
 * 
 * This function will search the motorways object and set the corresponding
 * information to the table by the given mid.
 * @param {string} mid Motorway ID.
 * @param {string} time The time string created by the YQL return result.
 * @returns {undefined} void
 */
function initSpeedDataTable(mid, time) {
	var table = document.getElementById("speedDataTable");
	table.innerHTML = "";

	// set page created time
	table.innerHTML += "<div class='time'>查詢時間:" + Date(time) + "</div>";

	if (mid === undefined) {
		console.error("setTableDirection(): mid is undefined.");
		table.innerHTML = "<div>請重新查詢. Please re-submit.</div>";
		return;
	}

	var row = "<div class='d-row'>";
	var nameElement = "<span class='d-name'>路段</span>";
	row += nameElement;
	if (motorways[mid].direction === 0) {		// 0: N-S direction, 1: E-W direction.
		row += "<span class='d-speed'>南向</span><span class='d-speed'>北向</span>";
	} else if (motorways[mid].direction === 1) {
		row += "<span class='d-speed'>東向</span><span class='d-speed'>西向</span>";
	} else {
		console.error("setTableDirection(): An error happened when set the direction.");
	}
	row += "</div>";

	table.innerHTML += row;
}

function setSpeedData(mid, result) {
	//console.log("setSpeedData()");
	var rText = result.responseText;
	//console.log("rText.length=" + rText.length + ", rText=" + rText);

	var json = JSON.parse(rText);
	initSpeedDataTable(mid, json.query.created);		// reset speed data table
	//console.log("Speed data result count=" + json.query.count);
	var data = json.query.results.body.content;
	//console.log("content(data)=" + data);

	// use regex to re-format the result content
	//var pattern2 = /\s*?\d+\s[\u4e00-\u9FFF]+\(\d+\)\s-\s[\u4e00-\u9FFF]+\(\d+\)\s\d+/g;
	var pattern = /\d+[\\r\\n\s]+[\u4e00-\u9FFF]+\([\d\.]+\)\s-\s[\u4e00-\u9FFF]+\([\d\.]+\)[\\r\\n\s]+\d+/g;

	var groups = data.match(pattern);

	//console.log("groups.length=" + groups.length);

	var speedA, speedB, sectionName;
	for (var i = 0; i < groups.length; i++) {
		var text = groups[i].replace(/[\s\\r\\n]/g, "");
		//console.log("groups[" + i + "].text=" + text);
		var patternA = /^\d+/;
		speedA = patternA.exec(text);
		var patternB = /\d+$/;
		speedB = patternB.exec(text);

		var patternSection = /[\u4e00-\u9FFF]+\([\d\.]+\)-[\u4e00-\u9FFF]+\([\d\.]+\)/;
		sectionName = patternSection.exec(text);

		printSpeedData(sectionName, speedA, speedB);
	}

	setSpeedColor();
	//console.log("Trying to show data table.");
	//document.querySelector("#speedDataTable").scrollIntoView({ behavior: 'smooth' });
	$("html body").animate({
		scrollTop: $("#speedDataTable").offset().top

	}, 1000);
	//window.location = "#speedDataTable";
}

function setSpeedColor() {
	Array.from(document.getElementsByClassName("d-speed")).forEach(function (item) {
		if (item.dataset.value > 80) {
			item.classList.add("speedConditionGood");
		} else if (item.dataset.value < 50) {
			item.classList.add("speedConditionBad");
		} else {
			item.classList.add("speedConditionMedium");
		}
	});
}

function showSelectedOption(e) {
	//console.log(e.target.options[e.target.selectedIndex].value);
}

// event listenters
document.getElementById("shortcut-m3").addEventListener("click", function () {
	quickAccess(10030);
});
document.getElementById("shortcut-m5").addEventListener("click", function () {
	quickAccess(10050);
});

// for test
document.getElementById("menu-junction-from").addEventListener("change", function () {
	showSelectedOption(event);
});
document.getElementById("menu-junction-to").addEventListener("change", function () {
	showSelectedOption(event);
});
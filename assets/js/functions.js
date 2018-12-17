var loginCallback;
var loggedIn = false;
var userID;
var userIndex = null;
var checkInJson;
var checkInCurrentPage = 1;
var checkInTotalPage;

var supportJson;
var supportCurrentPage = 1;
var supportTotalPage;

var chatCommentEntry;
var chatCommentCurrentPage = 1;

var claimJson;
var claimCurrentPage = 1;
var claimTotalPage;
var ncJson;

/* Local Notification */

function notification(id, title, message)
{
	window.plugin.notification.local.add(
	{
		id: id,
		title: title,
		message: message,
		autoCancel: true
	});
	window.plugin.notification.local.onclick = function(id, state, json)
	{
		pushPage('message-details');
	};
}


/* Login with username */

function login(username, password)
{
	window.localStorage.setItem("key", username);
	window.localStorage.setItem("key2", password);
	
	$('#login').addClass('loading');
	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/login.php',
		method: 'POST',
		cache: false,
		data:
		{
			username: username,
			password: password
		}
	})
	.done(function(response){
		var json = $.parseJSON(response);
		
		if(json.length > 1 && json[1].status == 'Active')
		{
		//alert(response);
			loggedIn = true;
			userID = json[1].username;
			userIndex = json[1].index;
			
			var html = '<div class="item clearfix"><img id="profile_pic" class="item-thum" src="assets/img/no_photo.png" onClick="profile_uploadPhoto()">';
			html += '<div class="item-desc"><div class="title">' + json[1].name + '</div><div class="text">Email: ' + json[1].email + '<br>Contact: ' + json[1].contact + '</div></div></div>';
			html += '<a class="button red col-2" onClick="onLogout()"><i class="icon ion-log-out"></i> Logout</a>';
			$('#profile .content').html(html);
			$('#profile .content').show();
			$('#profile').removeClass('loading');
			
			
			
			$('#login input').val('');
			if(loginCallback)
			{
				loginCallback();
				loginCallback = null;
			}
		}
		else
		{
			navigator.notification.alert('Incorrect username or password!', function()
			{
				pushPage('login', LTR);
			}, 'Error');
		}
		$('#login').removeClass('loading');
	})
	.fail(function(){
		navigator.notification.alert('Please check your internet connection and try again.', null, 'No internet connection');
		$('#login').removeClass('loading');
	});
}

function autoLogin(username, password)
{
	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/login.php',
		method: 'POST',
		cache: false,
		data:
		{
			username: username,
			password: password
		}
	})
	.done(function(response)
	{
		var json = $.parseJSON(response);
		
		if(json.length > 1 && json[1].status == 'Active')
		{
			loggedIn = true;
			userID = json[1].username;
			userIndex = json[1].index;
			
			var html = '<div class="item clearfix"><img id="profile_pic" class="item-thum" src="assets/img/no_photo.png" onClick="profile_uploadPhoto()">';
			html += '<div class="item-desc"><div class="title">' + json[1].name + '</div><div class="text">Email: ' + json[1].email + '<br>Contact: ' + json[1].contact + '</div></div></div>';
			html += '<a class="button red col-2" onClick="onLogout()"><i class="icon ion-log-out"></i> Logout</a>';
			$('#profile .content').html(html);
			$('#profile .content').show();
			$('#profile').removeClass('loading');
			
			
			
			$('#login input').val('');
			if(loginCallback)
			{
				loginCallback();
				loginCallback = null;
			}
		}
		else
		{
			navigator.notification.alert('Incorrect username or password!', function()
			{
				pushPage('login', LTR);
			}, 'Error');
		}
		$('#login').removeClass('loading');
		
	});
}


/* Register */

function register(fullName, mobile, email, password)
{
	$('#register').addClass('loading');
	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/register.php',
		method: 'POST',
		cache: false,
		data:
		{
			name: fullName,
			contact: mobile,
			email: email,
			username: email,
			password: password,
			photo: "-",
			status: "active"
		}
	})
	.done(function(response)
	{
		if($.trim(response) == '0')
		{
			$('#register input').val('');
			navigator.notification.alert('You have successfully registered!', function()
			{
				pushPage('login', LTR);
			}, 'Successful');
		}
		else
		{
			navigator.notification.alert('"' + email + '" has already been registered. Please login or try another email address.', null, 'Error');
		}
		$('#register').removeClass('loading');
	})
	.fail(function()
	{
		navigator.notification.alert('Please check your internet connection and try again.', null, 'No internet connection');
		$('#register').removeClass('loading');
	});
}


/* Logout */

function logout()
{
	window.localStorage.clear();
	clearUserInfo();
	loggedIn = false;
}


/* Show login, register buttons */

function clearUserInfo()
{
	var html = '<div class="mb-18">You are not logged in.</div>';
	html += '<a class="button fit mb-18" onClick="pushPage(\'login\', RTL)"><i class="icon ion-log-in"></i> Login</a>';
	

	$('#profile .content').html(html);
}


/* Check Login */
function isLogin(){
	if(!loggedIn){
		navigator.notification.alert('Please log in to your account first.', function()
		{
			pushPage('profile', LTR);
		}, 'User not found');
	}
}


/* Button click sound */

function clickSound(){
 	var audio = document.getElementById("audio");
     audio.play();
}

function btnPressed(btnId){
	$(btnId).addClass('active');
	setTimeout(function()
	{
		$(btnId).removeClass('active');
	}, 100);
}

/* -------------------------------------------------- Check In Page Functions -------------------------------------------------- */

// Take profile pic
function profile_uploadPhoto() {
    navigator.camera.getPicture (profile_cameraSuccess, profile_cameraFail, 
    { quality: 50,  
	  allowEdit: true,
      sourceType: navigator.camera.PictureSourceType.CAMERA,
      destinationType: destinationType.FILE_URI,
      encodingType: navigator.camera.EncodingType.PNG,
	  targetWidth: 600,
	  targetHeight: 600,
      correctOrientation: true,
      saveToPhotoAlbum: true
	});

    // A callback function when snapping picture is success.
    function profile_cameraSuccess (imageData) {
        var image = document.getElementById ('profile_pic');
			image.src =  imageData;
		$('#profile').addClass('loading');
		$('#profile .content').hide();
		
		//set upload options
		var options = new FileUploadOptions();
			options.fileKey="file";
			options.fileName=userIndex + "_" + imageData.substr(imageData.lastIndexOf('/')+1);
			options.mimeType="image/jpeg";
			
		var params = new Object();
			params.value1 = userIndex;
	 
			options.params = params;
			options.chunkedMode = false;
		  
		var ft = new FileTransfer();
			ft.upload(imageData, encodeURI ("http://apemalaysia.net/foxspeed/api/profile_upload.php"), profile_win, profile_fail, options);
			
		function profile_win(r) {
			$('#profile').removeClass('loading');
			$('#profile .content').show();
			navigator.notification.alert('Profile picture is updated.', null, 'Successful');
		}

		function profile_fail(error) {
			$('#profile').removeClass('loading');
			$('#profile .content').show();
			alert("An error has occurred: Code = " + error.code);
		}
    }

    // A callback function when snapping picture is fail.
    function profile_cameraFail (message) {
        alert ('Error occured: ' + message);
    }   
}   

/* -------------------------------------------------- Check In Page Functions -------------------------------------------------- */
 
// Find user location at checkin page 
function ci_findLocation() {
	var output = document.getElementById("ci_locationStatus");
		output.innerHTML ="Searching for location...";	
	
	navigator.geolocation.getCurrentPosition(ci_onSuccess, ci_onFail, {maximumAge: 0, timeout: 5000, enableHighAccuracy:true});
			
	function ci_onSuccess(position) {
		
		var latitude  = position.coords.latitude;
		var longitude = position.coords.longitude;
		//var timestamp = new Date (position.timestamp);
		
		window.ci_latitude = latitude;
		window.ci_longitude = longitude;
		//window.ci_timestamp = timestamp;	
	
		$('#ci_latitude').val(position.coords.latitude);
		$('#ci_longitude').val(position.coords.longitude);
		//$('#ci_timestamp').val(new Date (position.timestamp));
				
		var img = document.getElementById('ci_mapImg');
		var imgWidth = screen.width - 60;
		var imgHeight = Math.round(screen.width * 0.6);
		img.src = "http://maps.google.com/maps/api/staticmap?" + latitude + "," + longitude + "&zoom=15&size=" + imgWidth + "x" + imgHeight + "&maptype=roadmap&markers=" + latitude + "," + longitude+ "&key=AIzaSyAcCBmQZynBF68SvnFhdXW7sV-bRuHZcT0";
		img.style.display = 'block';
		
		output.innerHTML ="Location found";
	};
			
	function ci_onFail() {
		navigator.notification.alert('Unable to retrieve your location, please enable your GPS and try again.', null, 'GPS not found');
		var output = document.getElementById("ci_locationStatus");
		output.innerHTML ="Location not found";
	};			
}


// Clear content of checkin page 
function ci_clearContent(){
	window.ci_latitude = null;
	window.ci_longitude = null;
	//window.ci_timestamp = null;
	window.ci_company = null;
	window.ci_description = null;
	$('#ci_latitude').val(null);
	$('#ci_longitude').val(null);
	//$('#ci_timestamp').val(null);
	$('#ci_company').val(null);
	$('#ci_description').val(null);
	var output = document.getElementById("ci_locationStatus");
		output.innerHTML = null;
	var img = document.getElementById('ci_mapImg');
		img.style.display = 'none';
}


// Submit checkin function
function ci_submit(){
	
	if(!loggedIn){
		alert("Please login first");
		return false;
	}
	
	if(window.ci_latitude == null){
		alert("Please Check in first");
		return false; 
	}
	
	window.ci_company = document.getElementById("ci_company").value;
	var cboxes = document.getElementsByName('job[]');
    var len = cboxes.length;
	var ci_job = "";
    for (var i=0; i<len; i++) 
	{
       ci_job = ci_job+','+cboxes[i].value;
    }
	//(ci_job);
	window.ci_description = document.getElementById("ci_description").value;
	
	if(window.ci_company == ""){
		alert("Please Enter Company Name");
		return false;
	}
	
	if(window.ci_description == ""){
		alert("Please enter description");
		return false;
	}
	
	$('#checkin').addClass('loading');
	$('#checkin .content').hide();
	
	$.ajax(
	{
		
		url: 'http://apemalaysia.net/foxspeed/api/attendance_log.php?lang='+ ci_latitude +'&long='+ ci_longitude +'&company='+ ci_company +'&user='+ userIndex + '&description='+ ci_description+ '&job='+ ci_job,
		data:
		{

		}
	})
	.done(function(data)
	{
		ci_clearContent();
		$('#notes').html('');
		if($.trim(data) == '0')
			alert("Check in successfully");
		else
			alert("Check in failed");
	})
	.fail(function()
	{
		$('#notes').html('');
		alert("Please check your internet connection and try again.");
		
	});
	
	$('#checkin').removeClass('loading');
	$('#checkin .content').show();
}


/* -------------------------------------------------- Check In History Page Functions -------------------------------------------------- */

// check how many pages function
function mci_checkPage()
{
	if(!loggedIn){
		navigator.notification.alert('Please log in to your account first.', function()
				{
					pushPage('profile', LTR);
				}, 'User not found');
		return;
	}

	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/attendance_page_count.php',
		method: 'POST',
		cache: false,
		data:
		{
			user: userIndex
		}
	})
	.done(function(response)
	{
		var json = $.parseJSON(response);
		if(json.length > 1)
		{
			checkInTotalPage = json[1].Entry;
		}
		else
		{
			navigator.notification.alert('No history found.', function()
			{
				pushPage('home', LTR);
			}, 'Error');
		}
	});
}


// Load check in history function
function mci_load()
{

	$('#mycheckin').addClass('loading');
	
	var from;
	var to;
	from = (checkInCurrentPage - 1) * 10;
	to = from + 10;
	
	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/attendance_search.php',
		method: 'POST',
		cache: false,
		data:
		{
			user: userIndex,
			from: from,
			to: to
		}
	})
	.done(function(response)
	{
		checkInJson = $.parseJSON(response);
		if(checkInJson.length > 1)
		{
			
			for(var i = 1; i < checkInJson.length; i++){
				if(i == 1) var html = '<div class="item clearfix" onclick="clickSound(); mci_showCheckinDetails('+ i +')"><img class="item-thum" src="assets/img/checkin.png">';
				else html += '<div class="item clearfix" onclick="clickSound(); mci_showCheckinDetails('+ i +')"><img class="item-thum" src="assets/img/checkin.png">';
				html += '<div class="item-desc"><div class="title">' + checkInJson[i].company + '</div><div class="text">' + checkInJson[i].date_time.italics() + '</div><div class="text">' + checkInJson[i].description.substring(0, 50) + '...</div></div><div class="item-info"></div></div>';
			}
			
			if(checkInTotalPage > 10){
				html += '<select id="mci_page" onchange="mci_pageNavigation()">';
				var page = 1;
				for(var i = checkInTotalPage; i > 0; i -=10){
					if(page == checkInCurrentPage){
					html += '<option value="' + page + '" selected>' + 'Page ' + page + '</option>';
					}
					else html += '<option value="' + page + '">' + 'Page ' + page + '</option>';
					page++;
				}
				html += '</select>';
			}
			$('#mycheckin .content').html(html);
		}
		else
		{
			
		}
		$('#mycheckin').removeClass('loading');
	})
	.fail(function()
	{
		navigator.notification.alert('Please check your internet connection and try again.', null, 'No internet connection');
		$('#mycheckin').removeClass('loading');
	});
}

// Load myAppointment
function myapp()
{

	$('#namecard').addClass('loading');
	
	var from;
	var to;
	from = (checkInCurrentPage - 1) * 10;
	to = from + 10;
	
	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/myappointment.php',
		method: 'POST',
		cache: false,
		data:
		{
			user: userIndex,
			from: from,
			to: to
		}
	})
	.done(function(response)
	{
	$('#namecard').removeClass('loading');
		appJson = $.parseJSON(response);
		//alert(appJson[1].company);
		if(appJson.length > 1)
		{
			
			for(var i = 0; i < appJson.length; i++)
			{
				for(var i = 1; i < appJson.length; i++){
				if(i == 1) var html = '<div class="item clearfix" onclick="clickSound();app_info('+ "'"+appJson[i].company_name+"'" +','+ "'"+appJson[i].index+"'" +'); pushPage('+ "'checkin', RTL" +');"><img width="20" height="15" class="item-thum" src="assets/img/checkin.png">';
				else html += '<div class="item clearfix" onclick="clickSound(); app_info('+ "'"+appJson[i].company_name+"'" +','+ "'"+appJson[i].index+"'" +'); pushPage('+ "'checkin', RTL" +');"><img width="20" height="15" class="item-thum" src="assets/img/checkin.png">';
				html += '<div class="item-desc"><div class="title">' + appJson[i].company_name + '</div><div class="text">' + appJson[i].app_date +" "+ appJson[i].app_time +'</div><div class="text"><br>' + appJson[i].note.substring(0, 50) + '</div><div class="text"><br>' + appJson[i].job_sheet + '</div></div><div class="item-info"></div></div>';
			}
			
			$('#namecard .content').html(html);
			$('#namecard .content').show();
				
		}
			
			
			
		}
		else
		{
			
		}
		
	})
	.fail(function()
	{
		navigator.notification.alert('Please check your internet connection and try again.', null, 'No internet connection');
		$('#mycheckin').removeClass('loading');
	});
}

function app_info(com,comID)
{
	
	//alert(comID);
	
	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/job_sheet.php?id='+comID,
		method: 'POST',
		cache: false,
		data:
		{
			
		}
	})
	.done(function(response)
	{
	$('#jobSheet .content').html(response);
		//appJson = $.parseJSON(response);
		
		
		if(appJson.length > 1)
		{
			
			for(var i = 1; i < appJson.length; i++)
			{
				for(var i = 1; i < appJson.length; i++){
				if(i == 1) var html = '<div class="item clearfix" onclick="clickSound();app_info('+ "'"+appJson[i].company_name+"'" +','+ "'"+appJson[i].index+"'" +'); pushPage('+ "'checkin', RTL" +');"><img width="20" height="15" class="item-thum" src="assets/img/checkin.png">';
				else html += '<div class="item clearfix" onclick="clickSound(); app_info('+ "'"+appJson[i].company_name+"'" +'); pushPage('+ "'checkin', RTL" +');"><img width="20" height="15" class="item-thum" src="assets/img/checkin.png">';
				html += '<div class="item-desc"><div class="title">' + appJson[i].company_name + '</div><div class="text">' + appJson[i].app_date +" "+ appJson[i].app_time +'</div><div class="text"><br>' + appJson[i].note.substring(0, 50) + '</div><div class="text"><br>' + appJson[i].job_sheet + '</div></div><div class="item-info"></div></div>';
			}
			
			
			
				
		}
			
			
			
		}
		else
		{
			
		}
		
	})
	.fail(function()
	{
		navigator.notification.alert('Please check your internet connection and try again.', null, 'No internet connection');
		$('#mycheckin').removeClass('loading');
	});
			
	
	//var html = '<input style="transform: scale(0.5);" type="checkbox" name="item" value="1" />s';
    //html += '<input style="transform: scale(0.5);" type="checkbox" name="item" value="2" />s';
	//$('#jobSheet .content').html(html);
	
	var ci_company = document.getElementById("ci_company")
	ci_company.value = com;
	
}

// Navigate to other page function
function mci_pageNavigation(){
	var pageSelected = document.getElementById("mci_page")
	checkInCurrentPage = pageSelected.options[pageSelected.options.selectedIndex].value;
	mci_load();
}


// Show detail of check in history function
function mci_showCheckinDetails(index){
	//alert(index);
	$('#checkin-details').addClass('loading');
	var html = '<div class="mb-10" align="center"><img style="display:none;" id="cid_mapImg"  width="500" height="" src=""/></div>';
	html += '<b class="mb-10">' + checkInJson[index].company + '</b>';
	html += '<div>Latitude:   ' + checkInJson[index].lang + '</div>';
	html += '<div>Longitude:  ' + checkInJson[index].long + '</div>';
	html += '<div>Date:       ' + checkInJson[index].date_time.substring(0, 10) + '</div>';
	html += '<div class="mb-10">Time:       ' + checkInJson[index].date_time.substring(11, 20) + '</div>';
	html += '<div><b>Description:</b></div>';
	html += '<p>' + checkInJson[index].description + '</p>';
	$('#checkin-details .content').html(html);
	$('#checkin-details .content').show();
	pushPage('checkin-details');
	
	var imgWidth = screen.width - 60;
	var imgHeight = Math.round(screen.width * 0.6);
	var img = document.getElementById('cid_mapImg');
	img.src = "http://maps.google.com/maps/api/staticmap?" + checkInJson[index].lang + "," + checkInJson[index].long + "&zoom=15&size=" + imgWidth + "x" + imgHeight + "&maptype=roadmap&markers=" + checkInJson[index].lang + "," + checkInJson[index].long + "&key=AIzaSyAcCBmQZynBF68SvnFhdXW7sV-bRuHZcT0";																								
	img.style.display = 'block';
		
	
		$('#checkin-details').removeClass('loading');

}


/* -------------------------------------------------- Name Card Page Functions -------------------------------------------------- */

var pictureSource;   
var destinationType;
document.addEventListener ("deviceready", onDeviceReady, false);

    //This function is executed when PhoneGap loading completed.
    function onDeviceReady () {
        pictureSource=navigator.camera.PictureSourceType;
        destinationType=navigator.camera.DestinationType;
    }



// Snap picture and show it on screen function
function nc_snapPicture () {
	
    navigator.camera.getPicture (nc_cameraSuccess, nc_cameraFail, 
    { quality: 50,  
      sourceType: navigator.camera.PictureSourceType.CAMERA,
      destinationType: destinationType.FILE_URI,
      encodingType: navigator.camera.EncodingType.PNG,
	  targetWidth: 800,
      correctOrientation: true,
      saveToPhotoAlbum: true
	});

    // A callback function when snapping picture is success.
    function nc_cameraSuccess (imageData) {
        var image = document.getElementById ('nc_picture');
        //alert("path : " + imageData);
        image.src =  imageData;
    }

    // A callback function when snapping picture is fail.
    function nc_cameraFail (message) {
        alert ('Error occured: ' + message);
    }
}
    

// Get photo from library function	   
function nc_getPhoto(source) {
      // Retrieve image file location from specified source
	navigator.camera.getPicture(onPhotoURISuccess, onPhotoURIFail, 
	{ quality: 50,
      destinationType: destinationType.FILE_URI,
      sourceType: source });
		
	function onPhotoURISuccess(imageURI) {
      var libraryImage = document.getElementById('nc_picture');
      //libraryImage.style.display = 'block';
      libraryImage.src = imageURI;
	}
	
	function onPhotoURIFail(message) {
		alert('Failed because: ' + message);
	}
}


// Upload photo to server function    
function nc_uploadPhoto() {
	
	if(!loggedIn){
		navigator.notification.alert('Please log in to your account first.', function()
				{
					pushPage('profile', LTR);
				}, 'User not found');
		return;
	}
    
	//selected photo URI is in the src attribute (we set this on getPhoto)
    var imageURI = document.getElementById('nc_picture').getAttribute("src");
    
	if (!imageURI) {
		navigator.notification.alert('Please take a photo first.', null, 'Photo not found');
        return;
    }
	
	window.nc_name = document.getElementById("nc_name").value;
	
	if(nc_name == ""){
		navigator.notification.alert('Please enter the full name.', function()
		{
			$('#namecard #nc_name').focus();
		}, 'Missing info');
		return;
	}
	
	window.nc_position = document.getElementById("nc_position").value;
	
	if(nc_position == ""){
		navigator.notification.alert('Please enter position of the person.', function()
		{
			$('#namecard #nc_position').focus();
		}, 'Missing info');
		return;
	}
	
	window.nc_company = document.getElementById("nc_company").value;
	
	if(nc_company == ""){
		navigator.notification.alert('Please enter company name.', function()
		{
			$('#namecard #nc_company').focus();
		}, 'Missing info');
		return;
	}
	
    $('#addnamecard').addClass('loading');
	$('#addnamecard .content').hide();
	
    //set upload options
	var options = new FileUploadOptions();
        options.fileKey="file";
        options.fileName=userIndex + "_" + imageURI.substr(imageURI.lastIndexOf('/')+1);
        options.mimeType="image/jpeg";
        
	//alert("1 imageURI upload "+ imageURI);

    var params = new Object();
        params.value1 = userIndex;
        params.value2 = nc_name;
        params.value3 = nc_position;
        params.value4 = nc_company;
 
        options.params = params;
        options.chunkedMode = false;
      
    var ft = new FileTransfer();
        ft.upload(imageURI, encodeURI ("http://apemalaysia.net/foxspeed/api/nc_upload.php"), win, fail, options);
}
	
    function win(r) {
		$('#addnamecard').removeClass('loading');
		$('#addnamecard .content').show();
		navigator.notification.alert('Name card has been uploaded.', null, 'Successful');
        console.log("Code = " + r.responseCode);
        console.log("Response = " + r.response);
        console.log("Sent = " + r.bytesSent);
		var image = document.getElementById ('nc_picture');
        image.src =  "assets/img/camera.png";
		window.nc_name = null;
		window.nc_position = null;
		window.nc_company = null;
		$('#nc_name').val(null);
		$('#nc_position').val(null);
		$('#nc_company').val(null);
    }

    function fail(error) {
		$('#addnamecard').removeClass('loading');
		$('#addnamecard .content').show();
        navigator.notification.alert('An error has occurred, please try again.', null, 'Error');
		//alert("An error has occurred: Code = " + error.code);
        console.log("upload error source " + error.source);
        console.log("upload error target " + error.target);
	}
	
	

	
/* -------------------------------------------------- My Name Card Page Functions -------------------------------------------------- */

// search name card in database function
function mnc_load()
{
	if(!loggedIn){
		navigator.notification.alert('Please log in to your account first.', function()
				{
					pushPage('profile', LTR);
				}, 'User not found');
		return;
	}

	window.nc_search = document.getElementById("nc_search").value;
	$('#mynamecard').addClass('loading');
	
	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/nc_search.php',
		method: 'POST',
		cache: false,
		data:
		{
			user: userIndex,
			search: nc_search
		}
	})
	.done(function(response)
	{
		ncJson = $.parseJSON(response);
		if(ncJson.length > 1)
		{
			for(var i = 1; i < ncJson.length; i++){
				if(i == 1) var html = '<div class="mb-10"><input placeholder="Search Full Name / Company Name" name="nc_search" id="nc_search" type="text" onchange="mnc_load()"/></div>';
				html += '<div class="item clearfix" onclick="clickSound(); mnc_showNameCardDetails('+ i +')"><img class="item-thum" src="assets/img/namecard.png">';
				html += '<div class="item-desc"><div class="title">' + ncJson[i].name + '</div><div class="text">' + ncJson[i].position.italics() + '</div><div class="text">' + ncJson[i].company + '</div></div><div class="item-info"></div></div>';
			}
		$('#mynamecard .content').html(html);
		$('#nc_search').val(nc_search);
		}
		else
		{
			var html = '<div class="mb-18"><input placeholder="Search Full Name / Company Name" name="nc_search" id="nc_search" type="text" onchange="mnc_load()"/></div>';
				html += '<div class="item clearfix" style="text-align:center"><b>No results</b></div>';
			
			$('#mynamecard .content').html(html);
			$('#nc_search').val(nc_search);
		}
		$('#mynamecard').removeClass('loading');
	})
	.fail(function()
	{
		navigator.notification.alert('Please check your internet connection and try again.', null, 'No internet connection');
		$('#mynamecard').removeClass('loading');
	});
}


// Show detail of name card function
function mnc_showNameCardDetails(index){
	$('#namecard-details').addClass('loading');
	var html = '<div class="mb-10" align="center"><img style="display:none" id="mnc_img" width="100%" height="" src=""/></div>';
	html += '<b class="mb-10">' + ncJson[index].name + '</b>';
	html += '<div>Position:   ' + ncJson[index].position + '</div>';
	html += '<div>Company:  ' + ncJson[index].company + '</div>';
	$('#namecard-details .content').html(html);
	$('#namecard-details .content').hide();
	pushPage('namecard-details');
	var imgWidth = screen.width - 60;
	var imgHeight = Math.round(screen.width * 0.6);
	var img = document.getElementById('mnc_img');
		img.src = "http://apemalaysia.net/foxspeed/api/nc_upload/" + ncJson[index].photo;																										
		img.style.display = 'block';
	
	
	$(img).load(function(){
        $('#namecard-details .content').show();
		$('#namecard-details').removeClass('loading');
    });
}

	
/* -------------------------------------------------- Claim Page Functions -------------------------------------------------- */

// Snap picture and show it on screen function
function cl_snapPicture () {
    navigator.camera.getPicture (cl_cameraSuccess, cl_cameraFail, 
    { quality: 50,  
      sourceType: navigator.camera.PictureSourceType.CAMERA,
      destinationType: destinationType.FILE_URI,
      encodingType: navigator.camera.EncodingType.PNG,
	  targetWidth: 800,
      correctOrientation: true,
      saveToPhotoAlbum: true
	});

    // A callback function when snapping picture is success.
    function cl_cameraSuccess (imageData) {
        var image = document.getElementById ('cl_picture');
        //alert("path : " + imageData);
        image.src =  imageData;
    }

    // A callback function when snapping picture is fail.
    function cl_cameraFail (message) {
        alert ('Error occured: ' + message);
    }
}
    

// Get photo from library function	
function cl_getPhoto(source) {
      // Retrieve image file location from specified source
	navigator.camera.getPicture(cl_onPhotoURISuccess, cl_onPhotoURIFail, 
	{ quality: 50,
      destinationType: destinationType.FILE_URI,
      sourceType: source });
		
	function cl_onPhotoURISuccess(imageURI) {
      var libraryImage = document.getElementById('cl_picture');
      //libraryImage.style.display = 'block';
      libraryImage.src = imageURI;
	}
	
	function cl_onPhotoURIFail(message) {
		alert('Failed because: ' + message);
	}
}


// Upload photo to server function    
function cl_uploadPhoto() {

	if(!loggedIn){
		navigator.notification.alert('Please log in to your account first.', function()
				{
					pushPage('profile', LTR);
				}, 'User not found');
		return;
	}
   
    //selected photo URI is in the src attribute (we set this on getPhoto)
    var imageURI = document.getElementById('cl_picture').getAttribute("src");
        
    //alert("imageURI "+ imageURI);
    if (!imageURI) {
        navigator.notification.alert('Please take a photo first.', null, 'Photo not found');
        return;
    }
	
	window.cl_amount = document.getElementById("cl_amount").value;
	
	if(cl_amount == ""){
		navigator.notification.alert('Please enter claim amount.', function()
		{
			$('#claim #cl_amount').focus();
		}, 'Missing info');
		return;
	}
	
	var categorySelected = document.getElementById("cl_category");
	window.cl_category = categorySelected.options[categorySelected.options.selectedIndex].value;
	
	if(cl_category == ""){
		navigator.notification.alert('Please select a claim category.', null, 'Missing info');
		return;
	}
	
	window.cl_description = document.getElementById("cl_description").value;
	
	if(cl_description == ""){
		navigator.notification.alert('Please enter claim description.', function()
		{
			$('#claim #cl_description').focus();
		}, 'Missing info');
		return;
	}

	$('#addclaim').addClass('loading');
	$('#addclaim .content').hide();
	
    //set upload options
	var options = new FileUploadOptions();
        options.fileKey="file";
        options.fileName=userIndex + "_" + imageURI.substr(imageURI.lastIndexOf('/')+1);
        options.mimeType="image/jpeg";
        
	//alert("1 imageURI upload "+ imageURI);

    var params = new Object();
        params.value1 = userIndex;
        params.value2 = cl_amount;
		params.value3 = cl_category;
		params.value4 = cl_description;
 
        options.params = params;
        options.chunkedMode = false;
      
    var ft = new FileTransfer();
        ft.upload(imageURI, encodeURI ("http://apemalaysia.net/foxspeed/api/cl_upload.php"), cl_win, cl_fail, options);
    }
	
    function cl_win(r) {
		$('#addclaim').removeClass('loading');
		$('#addclaim .content').show();
		navigator.notification.alert('Claim has been uploaded.', null, 'Successful');
        console.log("Code = " + r.responseCode);
        console.log("Response = " + r.response);
        console.log("Sent = " + r.bytesSent);
		var image = document.getElementById ('cl_picture');
        image.src =  "assets/img/camera.png";
		window.cl_amount = null;
		window.cl_description = null;
		$('#cl_amount').val(null);
		$('#cl_description').val(null);
    }

    function cl_fail(error) {
		$('#addclaim').removeClass('loading');
		$('#addclaim .content').show();
        alert("An error has occurred: Code = " + error.code);
        console.log("upload error source " + error.source);
        console.log("upload error target " + error.target);
	}

	
/* -------------------------------------------------- My Claim Page Functions -------------------------------------------------- */

// check how many pages function
function mcl_checkPage()
{
	if(!loggedIn){
		navigator.notification.alert('Please log in to your account first.', function()
				{
					pushPage('profile', LTR);
				}, 'User not found');
		return;
	}

	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/cl_page_count.php',
		method: 'POST',
		cache: false,
		data:
		{
			user: userIndex
		}
	})
	.done(function(response)
	{
		var json = $.parseJSON(response);
		if(json.length > 1)
		{
			claimTotalPage = json[1].Entry;
		}
		else
		{
			navigator.notification.alert('No claim found.', function()
			{
				pushPage('claim', LTR);
			}, 'Error');
		}
	});
}

// Load my claim function
function mcl_load()
{

	$('#myclaim').addClass('loading');
	
	var from;
	var to;
	from = (claimCurrentPage - 1) * 10;
	to = from + 10;

	window.mcl_fromDate = document.getElementById("mcl_fromDate").value;
	window.mcl_toDate = document.getElementById("mcl_toDate").value;
	
	$.ajax(
	
	{
		url: 'http://apemalaysia.net/foxspeed/api/cl_search.php',
		method: 'POST',
		cache: false,
		data:
		{
			user: userIndex,
			fromdate: mcl_fromDate,
			todate: mcl_toDate
		}
	})
	.done(function(response)
	{
		claimJson = $.parseJSON(response);
		if(claimJson.length > 1)
		{	
			var	html ='<div><table><tr><td>From:</td><td><input placeholder="Start Date" name="fromDate" id="mcl_fromDate" type="text" disabled/><td><td><a class="button fit" id="mcl_btn_from" onClick="clickSound(); datePick(' + "'" + '#mcl_fromDate' + "'" + ')"><i class="icon ion-ios-calendar-outline"></i></a></td></tr>';
				html +='<tr><td>To:</td><td><input placeholder="End Date" name="toDate" id="mcl_toDate" type="text" disabled/><td><td><a class="button fit" id="mcl_btn_to" onClick="clickSound(); datePick(' + "'" + '#mcl_toDate' + "'" + ')"><i class="icon ion-ios-calendar-outline"></i></a></td><tr></table></div>';
				html +='<div><table width="50%"><tr><td><a class="button fit" id="mcl_btn_search" onClick="clickSound(); mcl_load()"><i class="icon ion-ios-search-strong"></i> Search</a></td></tr></table></div>';
				html +='<br>';
			
			for(var i = 1; i < claimJson.length; i++){
				if(i == 1)
				{
					if(claimJson[i].status == "Ongoing") html += '<div class="item clearfix" onclick="clickSound(); mcl_showClaimDetails('+ i +')"><img class="item-thum" src="assets/img/claim.png">';
					else html += '<div class="item clearfix completed" onclick="clickSound(); mcl_showClaimDetails('+ i +')"><img class="item-thum" src="assets/img/claim.png">';
				}
				else 
				{
					if(claimJson[i].status == "Ongoing") html += '<div class="item clearfix" onclick="clickSound(); mcl_showClaimDetails('+ i +')"><img class="item-thum" src="assets/img/claim.png">';
					else html += '<div class="item clearfix completed" onclick="clickSound(); mcl_showClaimDetails('+ i +')"><img class="item-thum" src="assets/img/claim.png">';
				}
				html += '<div class="item-desc" ><div class="title">' + claimJson[i].category + '</div><div class="text">' + claimJson[i].date_time.italics() + '</div><div class="text"><b>RM ' + claimJson[i].amount + '</b></div></div><div class="item-info"></div></div>';
			}
			/*
			if(claimTotalPage > 10){
				html += '<select id="mcl_page" onchange="mcl_pageNavigation()">';
				var page = 1;
				for(var i = claimTotalPage; i > 0; i -=10){
					if(page == claimCurrentPage){
					html += '<option value="' + page + '" selected>' + 'Page ' + page + '</option>';
					}
					else html += '<option value="' + page + '">' + 'Page ' + page + '</option>';
					page++;
				}
				html += '</select>';
			}
			*/
			
			$('#myclaim .content').html(html);
			$('#mcl_fromDate').val(window.mcl_fromDate);
			$('#mcl_toDate').val(window.mcl_toDate);
		}
		else
		{
			
		}
		$('#myclaim').removeClass('loading');
	})
	.fail(function()
	{
		navigator.notification.alert('Please check your internet connection and try again.', null, 'No internet connection');
		$('#myclaim').removeClass('loading');
	});
}

//
function mcl_clear(){
	$('#mcl_fromDate').val("");
	$('#mcl_toDate').val("");
}

// Navigate to other page function
function mcl_pageNavigation(){
	var pageSelected = document.getElementById("mcl_page")
	claimCurrentPage = pageSelected.options[pageSelected.options.selectedIndex].value;
	mcl_load();
}

// Show detail of claim function
function mcl_showClaimDetails(index){
	
	$('#claim-details').addClass('loading');
	var html = '<div class="mb-10" align="center"><img style="display:none;" id="cld_claimImg"  width="100%" height="" src=""/></div>';
	html += '<b class="mb-10">' + claimJson[index].category + '</b>';
	html += '<div>Amount: <b>RM    ' + claimJson[index].amount + '</b></div>';
	html += '<div>Status: ' + claimJson[index].status + '</div>';
	html += '<div>Date:       ' + claimJson[index].date_time.substring(0, 10) + '</div>';
	html += '<div class="mb-10">Time:       ' + claimJson[index].date_time.substring(11, 20) + '</div>';
	html += '<div><b>Description:</b></div>';
	html += '<p>' + claimJson[index].description + '</p>';
	$('#claim-details .content').html(html);
	$('#claim-details .content').hide();
	pushPage('claim-details');
	
	var img = document.getElementById('cld_claimImg');
		img.src = "http://apemalaysia.net/foxspeed/api/cl_upload/" + claimJson[index].photo;
		img.style.display = 'block';
	
	$(img).load(function(){
        $('#claim-details .content').show();
		$('#claim-details').removeClass('loading');
    });
	
}


/* -------------------------------------------------- Other Functions -------------------------------------------------- */

function datePick(dateId){
	datePicker.show({
		date: new Date(),
		mode: 'date',
		allowFutureDates: false
	}, function(date){  
		var dateString = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
		$(dateId).val(dateString);
		if(dateId == '#mcl_fromDate') window.mcl_fromDate = dataString;
		if(dateId == '#mcl_toDate') window.mcl_toDate = dataString;
	});
}


/* ------------------------------------------------- Support ---------------------------------------------------------- */

function support_checkPage()
{
	if(!loggedIn){
		navigator.notification.alert('Please log in to your account first.', function()
				{
					pushPage('profile', LTR);
				}, 'User not found');
		return;
	}

	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/support.php',
		method: 'POST',
		cache: false,
		data:
		{
			user: userIndex
		}
	})
	.done(function(response)
	{
		var json = $.parseJSON(response);
		if(json.length > 1)
		{
			supportTotalPage = json[1].Entry;
		}
		else
		{
			navigator.notification.alert('No history found.', function()
			{
				pushPage('home', LTR);
			}, 'Error');
		}
	});
}

function support_load(){
	$('#mysupport').addClass('loading');
	
	var from;
	var to;
	from = (supportCurrentPage - 1) * 10;
	to = from + 10;
	
	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/support_count.php',
		method: 'POST',
		cache: false,
		data:
		{
			user: userIndex,
			from: from,
			to: to
		}
	})
	.done(function(response)
	{
		supportJson = $.parseJSON(response);
		if(supportJson.length > 1)
		{
			
			for(var i = 1; i < supportJson.length; i++){
				if(i == 1) var html = '<div class="item clearfix" onclick="pushPage('+"'problemDetails'"+'); supportDetails('+i+'); clickSound();">';
				else html += '<div class="item clearfix" onclick="pushPage('+"'problemDetails'"+'); supportDetails('+i+'); clickSound(); ">';
				html += '<div class="item-desc"><div class="title">' + supportJson[i].company_name + '</div><div class="title">' + supportJson[i].title + '</div><div class="text">' + supportJson[i].date.italics() + ' ' + supportJson[i].time.italics() + '</div><div class="text">' + supportJson[i].details.substring(0, 50) + '...</div></div><div class="item-info"></div></div>';
			}
			
			if(supportTotalPage > 10){
				html += '<select id="support_page" onchange="support_pageNavigation()">';
				var page = 1;
				for(var i = supportTotalPage; i > 0; i -=10){
					if(page == supportCurrentPage){
					html += '<option value="' + page + '" selected>' + 'Page ' + page + '</option>';
					}
					else html += '<option value="' + page + '">' + 'Page ' + page + '</option>';
					page++;
				}
				html += '</select>';
			}
			$('#mysupport .content').html(html);
		}
		else
		{
			
		}
		$('#mysupport').removeClass('loading');
	})
	.fail(function()
	{
		navigator.notification.alert('Please check your internet connection and try again.', null, 'No internet connection');
		$('#mysupport').removeClass('loading');
	});
}

function support_pageNavigation(){
	var pageSelected = document.getElementById("support_page")
	supportCurrentPage = pageSelected.options[pageSelected.options.selectedIndex].value;
	support_load();
	$('#mysupport').addClass('loading');
	$('#mysupport' .content).hide()
}
/*
function supportDetails(index){
	//alert(index);
	$('#problemDetails').addClass('loading');
	var html = '<div class="item clearfix">';
	html += '<img class="item-thum" src="http://apemalaysia.net/foxspeed/api/">';
	html += '<div class="item-desc"><div class="title">' + supportJson[index].company_name + '</div>';
	html += '<div class="timestamp">Date: ' + supportJson[index].date.substring(0, 10) + ' ' + supportJson[index].time.substring(0, 10) + '</div>';
	html += '<div class="text">' + supportJson[index].details + '</div></div></div></div>';
	html += '<hr>'
	html += '<textarea maxlength="1000" name="chat_comment" id="chat_comment" placeholder="Type your comment here."></textarea>';
	html += '<a ><button class="fit mb-10" onClick="playMP3()"><i class="icon ion-ios-paperplane"></i> Send</button></a>';
				
	$('#problemDetails .content').html(html);
	$('#problemDetails .content').show();
	pushPage('problemDetails');

	$('#problemDetails').removeClass('loading');
}*/

function supportDetails(index){
	chatCommentCurrentPage = 1;
	$('#problemDetails').addClass('loading');
	$('#problemDetails .content').hide();
	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/chat_comment_counter.php',
		method: 'post',
		cache: false,
		data:
		{
			user: supportJson[index].index
		}
	})
	.done(function(response)
	{
		var json = $.parseJSON(response);
		chatCommentEntry = json[1].total;
		support_onDetails(index);
	})
	.fail(function(){
		navigator.notification.alert('Please check your internet connection and try again.', function()
		{
			popPage();
		}, 'No internet connection');
		$('#problemDetails').removeClass('loading');
		$('#problemDetails .content').show();
	});
}

function support_onDetails(index){
	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/chat_comment.php?',
		method: 'post',
		cache: false,
		data:
		{
			page: chatCommentCurrentPage, 
			user: supportJson[index].index
		}
	})
	.done(function(response){
		var json = $.parseJSON(response);
		
		var html = '<div class="item clearfix">';
			if(supportJson[index].thumb) html += '<img class="item-thum" src="http://apemalaysia.net/foxspeed/uploads/problem/'+supportJson[index].thumb+'">';
			else html += '<img class="item-thum" src="http://apemalaysia.net/foxspeed/uploads/problem/'+supportJson[index].thumb+'">>';
			html += ' <div class="item-desc"><div class="title">' + supportJson[index].company_name + '</div><div class="date">' + supportJson[index].date.substring(0, 10) + ' ' + supportJson[index].time.substring(0, 10) + '</div><div class="mt-10"><b>Details:</b><br> ' + supportJson[index].details + '</div></div> </div>';
				
			html += '<textarea maxlength="1000" name="chat_comment" id="chat_comment" placeholder="Type your comment here."></textarea>';
			html += '<a ><button class="fit mb-10" onClick="chat_sendComment(' + index + '); clickSound();"><i class="icon ion-ios-paperplane"></i> Send</button></a>';
				
		//$('#namecard-details').addClass('loading');		
				
		for(var i = 1; i < json.length; i++){
			 html += '<div class="item clearfix"><div class="item-comment"><div class="text">' + json[i].comment + '</div></div></div>';
			//html += '<div class ="title">' + json[i].name + ' (' + json[i].unit_no + ')</div><div class="date">'+ json[i].date_time +'</div>';
			//html += '';			
		} 
		
		if(chatCommentEntry > 20){
			html += '<select id="chat_comment_page" onchange="chat_commentPageNavigation(' + index + ')">';
			var page = 1;
			for(var i = chatCommentEntry; i > 0; i -= 20){
				if(page == chatCommentCurrentPage){
					html += '<option value="' + page + '" selected>' + 'Page ' + page + '</option>';
				}
				else html += '<option value="' + page + '">' + 'Page ' + page + '</option>';
				page++;
			}
			html += '</select>';
		}
		
		$('#problemDetails .content').html(html);
		$('#problemDetails').removeClass('loading');
		$('#problemDetails .content').show();
	})
	.fail(function(){
		navigator.notification.alert('Please check your internet connection and try again.', function()
		{
			popPage();
		}, 'No internet connection');
		$('#problemDetails').removeClass('loading');
		$('#problemDetails .content').show();
	});

}

function chat_commentPageNavigation(index)
{
	var pageSelected = document.getElementById("chat_comment_page")
	chatCommentCurrentPage = pageSelected.options[pageSelected.options.selectedIndex].value;
	support_onDetails(index);
	$('#problemDetails').addClass('loading');
	$('#problemDetails .content').hide();
}


function chat_sendComment(index){

	window.comment = document.getElementById("chat_comment").value;
	
	if(comment == " "){
		navigator.notification.alert('Please enter your comment first.', function()
		{
			$('#problemDetails #chat_comment').focus();
		}, 'Missing info');
		return; 
	}

	$('#problemDetails').addClass('loading');
	$('#problemDetails .content').hide();
	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/chat_comment_add.php',
		method: 'post',
		cache: false,
		data:
		{
			user: supportJson[index].index,
			comment: comment
		}
	})
	.done(function(data)
	{
		
		$('#chat_comment').html('');
		//if($.trim(data) == '0') navigator.notification.alert('Your comment has been posted.', null, 'Successful');
		//else navigator.notification.alert('Comment posting was denied by server, please contact administrator about this issue.', null, 'Error');
		supportDetails(index);
		$('#problemDetails').removeClass('loading');
		$('#problemDetails .content').show(); 
	})
	.fail(function()
	{
		navigator.notification.alert('Please check your internet connection and try again.', null, 'No internet connection');
		$('#problemDetails').removeClass('loading');
		$('#problemDetails .content').show();
	});
}

/* ----------------------- post pic -----------------------------*/
function company_pic(){

	navigator.notification.confirm
	(
		'Do you want to capture a photo or upload a photo?',
		function(buttonIndex)
		{
			if(buttonIndex == 1) com_postAddPic();
			if(buttonIndex == 2) com_postGetPhoto();
		},
		'Photo Option',
		['Capture', 'Upload']
	);
}

function com_postAddPic() {
	
    navigator.camera.getPicture (chat_cameraSuccess, chat_cameraFail, 
    { quality: 30,  
      sourceType: navigator.camera.PictureSourceType.CAMERA,
      destinationType: navigator.camera.DestinationType.FILE_URI,
      encodingType: navigator.camera.EncodingType.PNG,
	  targetWidth: 800,
      correctOrientation: true
      //saveToPhotoAlbum: true
	});

    // A callback function when snapping picture is success.
    function chat_cameraSuccess (imageData) {
        var image = document.getElementById ('company_post_picture');
        //alert("path : " + imageData);
        image.src =  imageData;
    }

    // A callback function when snapping picture is fail.
    function chat_cameraFail (message) {
        //alert ('Error occured: ' + message);
    }
}

function com_postGetPhoto() {
      // Retrieve image file location from specified source
	navigator.camera.getPicture(chat_onPhotoURISuccess, chat_onPhotoURIFail, 
	{ quality: 30,
      destinationType: navigator.camera.DestinationType.FILE_URI,
	  encodingType: navigator.camera.EncodingType.PNG,
	  targetWidth: 800,
      correctOrientation: true,
      sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY });
		
	function chat_onPhotoURISuccess(imageURI) {
      var libraryImage = document.getElementById('company_post_picture');
      //libraryImage.style.display = 'block';
      libraryImage.src = imageURI;
	}
	
	function chat_onPhotoURIFail(message) {
		//alert('Failed because: ' + message);
	}
}

function company_postService()
{	
	if(!loggedIn){
		navigator.notification.alert('Please log in to your account first.', function()
				{
					pushPage('profile', LTR);
				}, 'User not found');
		return;
	}

	window.company = document.getElementById("cp_name").value;

	if(company == ""){
		navigator.notification.alert('Please enter the full name.', function()
		{
			$('#request_problem #cp_name').focus();
		}, 'Missing info');
		return;
	}
	
	window.title = document.getElementById("cp_tittle").value;
	
	if(title == ""){
		navigator.notification.alert('Please enter problem title.', function()
		{
			$('#request_problem #cp_tittle').focus();
		}, 'Missing info');
		return;
	}
	
	window.description = document.getElementById("cp_description").value;
	
	if(description == ""){
		navigator.notification.alert('Please enter problem description.', function()
		{
			$('#request_problem #cp_description').focus();
		}, 'Missing info');
		return;
	}
	
	var imageURI = document.getElementById('company_post_picture').getAttribute("src");
    
	if (imageURI == "assets/img/camera.png") {
		com_postChat_noimage();
        return;
    } 
	
	$('#request_problem').addClass('loading');
	$('#request_problem .content').hide();
	
	var date_time = new Date();
	
    //set upload options
	var options = new FileUploadOptions();
        options.fileKey="file";
       	options.fileName=userIndex + "_" + date_time.getFullYear() + "-" + date_time.getMonth() + "-" + date_time.getDate() + "_" + date_time.getHours() + "-" + date_time.getMinutes() + "-" + date_time.getSeconds() + ".jpg";
        options.mimeType="image/jpeg";
        
	//alert("1 imageURI upload "+ imageURI);

    var params = new Object();
        params.value1 = company;
        params.value2 = title;
        params.value3 = description;
        params.value4 = userIndex;
 
       	options.params = params;
        options.chunkedMode = false;
    var ft = new FileTransfer();
        ft.upload(imageURI, encodeURI ("http://apemalaysia.net/foxspeed/api/company_post.php"), win, fail, options);

    function win(r) {
		$('#request_problem').removeClass('loading');
		$('#request_problem .content').show();
		navigator.notification.alert('You have successfully posted the problem.', null, 'Successful');
		console.log("Code = " + r.responseCode);
    	console.log("Response = " + r.response);
    	console.log("Sent = " + r.bytesSent);
		var image = document.getElementById ('company_post_picture');
        image.src =  "assets/img/camera.png";
        window.company = null;
		window.title = null;
		window.description = null;
		$('#cp_name').val(null);
		$('#cp_tittle').val(null);
		$('#cp_description').val(null);

    }

	function fail(error) {
		$('#request_problem').removeClass('loading');
		$('#request_problem .content').show();
	    navigator.notification.alert('An error has occurred, please try again.', null, 'Error');
	}	
			
}



function com_postChat_noimage()
{
	window.company = document.getElementById("cp_name").value;

	if(company == ""){
		navigator.notification.alert('Please enter the full name.', function()
		{
			$('#request_problem #cp_name').focus();
		}, 'Missing info');
		return;
	}
	
	window.title = document.getElementById("cp_tittle").value;
	
	if(title == ""){
		navigator.notification.alert('Please enter problem title.', function()
		{
			$('#request_problem #cp_tittle').focus();
		}, 'Missing info');
		return;
	}
	
	window.description = document.getElementById("cp_description").value;
	
	if(description == ""){
		navigator.notification.alert('Please enter problem description.', function()
		{
			$('#request_problem #cp_description').focus();
		}, 'Missing info');
		return;
	}
	
	$('#request_problem').addClass('loading');
	$('#request_problem .content').hide();
	$.ajax(
	{
		url: 'http://apemalaysia.net/foxspeed/api/post_noimage.php',
		method: 'post',
		cache: false,
		data:
		{
			user:userIndex,
			company: company,
			title: title,
			description:description
		}
	})
	.done(function(response)
	{
		if($.trim(response) == '0')
		{
			$('#request_problem').removeClass('loading');
			$('#request_problem .content').show();
			navigator.notification.alert('You have successfully posted the complain.', null, 'Successful');
			var image = document.getElementById ('company_post_picture');
			image.src =  "assets/img/camera.png";
			window.company = null;
			window.title = null;
			window.description = null;
			$('#cp_name').val(null);
			$('#cp_tittle').val(null);
			$('#cp_description').val(null);
		}
		else
		{
			navigator.notification.alert('An error has occur, please try again later', null, 'Error');
			$('#request_problem').removeClass('loading');
			$('#request_problem .content').show();
		}
	})
	.fail(function(){
		navigator.notification.alert('Please check your internet connection and try again.', null, 'No internet connection');
		$('#request_problem').removeClass('loading');
		$('#request_problem .content').show();
	});
}


lucide.createIcons();

let get = function(id) { return document.getElementById(id); };

let detectDevice = async function() {
    let ua = navigator.userAgent;
    let name = "Unknown Browser";

    if (ua.includes('Firefox/')) {
        let m = ua.match(/Firefox\/([\d.]+)/);
        name = "Mozilla Firefox " + (m ? m[1] : '');
    } else if (ua.includes('SamsungBrowser/')) {
        let m = ua.match(/SamsungBrowser\/([\d.]+)/);
        name = "Samsung Internet " + (m ? m[1] : '');
    } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
        let m = ua.match(/Version\/([\d.]+)/);
        name = "Apple Safari " + (m ? m[1] : '');
    } else if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        try {
            let data = await navigator.userAgentData.getHighEntropyValues(['fullVersionList']);
            let list = data.fullVersionList || [];
            let real = list.filter(function(b) { return !b.brand.includes('Not') && !b.brand.includes('Brand'); });
            
            let isB = navigator.brave && await navigator.brave.isBrave().catch(function(){return false});
            if (isB) {
                let cr = real.find(function(b){ return b.brand === 'Chromium' || b.brand === 'Google Chrome'; });
                let ver = cr ? cr.version : (ua.match(/Chrome\/([\d]+)/) || [])[1] || '';
                name = "Brave (Chromium " + ver + ")";
            } else {
                let targets = ["Microsoft Edge", "Opera", "Google Chrome", "Chromium"];
                for (let i = 0; i < targets.length; i++) {
                    let entry = real.find(function(b){ return b.brand === targets[i]; });
                    if (entry) {
                        name = targets[i] + " " + entry.version;
                        break;
                    }
                }
            }
        } catch (e) {}
    }

    if (name === "Unknown Browser") {
        let isB = navigator.brave && await navigator.brave.isBrave().catch(function(){return false});
        if (isB) {
            let m = ua.match(/Chrome\/([\d]+)/);
            name = "Brave (Chromium " + (m ? m[1] : '') + ")";
        } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
            let m = ua.match(/(OPR|Opera)\/([\d.]+)/);
            name = "Opera " + (m ? m[2] : '');
        } else if (ua.includes('Edg/') || ua.includes('EdgA/')) {
            let m = ua.match(/Edg[A]?\/([\d.]+)/);
            name = "Microsoft Edge " + (m ? m[1] : '');
        } else if (ua.includes('Chrome/')) {
            let m = ua.match(/Chrome\/([\d.]+)/);
            name = "Google Chrome " + (m ? m[1] : '');
        }
    }

    let osName = "Unknown OS";
    let pf = navigator.platform;
    if (/Android/.test(ua)) {
        let m = ua.match(/Android ([\d.]+)/);
        osName = m ? "Android " + m[1] : "Android";
    } else if (/iPhone|iPad|iPod/.test(ua)) {
        let m = ua.match(/OS ([\d_]+) like Mac/);
        osName = "iOS " + (m ? m[1].replace(/_/g, '.') : '');
    } else if (/Windows NT/.test(ua)) {
        let m = ua.match(/Windows NT ([\d.]+)/);
        let winObj = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista' };
        osName = "Windows " + (m ? (winObj[m[1]] || m[1]) : '');
    } else if (/Macintosh|MacIntel|MacPPC/.test(ua)) {
        let m = ua.match(/Mac OS X ([\d_]+)/);
        osName = "macOS " + (m ? m[1].replace(/_/g, '.') : '');
    } else if (/Linux/.test(ua) || /Linux/.test(pf)) {
        osName = "Linux";
    }

    get('val-browser').innerHTML = name;
    get('val-os').innerHTML = osName;
};

let loadRestData = function() {
    let dpr = window.devicePixelRatio || 1;
    let w = Math.round(screen.width * dpr);
    let h = Math.round(screen.height * dpr);
    let scl = Math.round(dpr * 100);
    get('val-screen').innerHTML = w + " × " + h + " px (" + scl + "% scaling)";

    try {
        let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let opt = { timeZone: tz, timeZoneName: 'shortOffset' };
        let parts = new Intl.DateTimeFormat('en', opt).formatToParts(new Date());
        let off = parts.find(function(p){ return p.type === 'timeZoneName'; });
        get('val-time').innerHTML = tz + " (" + (off ? off.value : 'UTC') + ")";
    } catch (e) {
        let offst = new Date().getTimezoneOffset();
        let hs = Math.abs(Math.floor(offst / 60)).toString().padStart(2, '0');
        let ms = Math.abs(offst % 60).toString().padStart(2, '0');
        let sg = offst <= 0 ? '+' : '-';
        get('val-time').innerHTML = "UTC" + sg + hs + ":" + ms;
    }

    let lang = navigator.language || navigator.userLanguage;
    get('val-lang').innerHTML = navigator.languages ? navigator.languages.join(', ') : lang;

    fetch('http://ip-api.com/json/?fields=status,message,country,regionName,city,isp,org,query')
        .then(function(res){ return res.json(); })
        .then(function(data){
            if (data.status === 'success') {
                get('val-ip').innerHTML = data.query;
                get('val-loc').innerHTML = [data.city, data.regionName, data.country].filter(Boolean).join(', ');
                let netText = (data.isp && data.org && data.isp !== data.org) ? data.isp + " (" + data.org + ")" : (data.isp || data.org);
                get('val-isp').innerHTML = netText;
            } else {
                throw new Error(data.message);
            }
        })
        .catch(function(){
            fetch('https://ipapi.co/json/')
                .then(function(res){ return res.json(); })
                .then(function(data){
                    get('val-ip').innerHTML = data.ip;
                    get('val-loc').innerHTML = [data.city, data.region, data.country_name].filter(Boolean).join(', ');
                    get('val-isp').innerHTML = data.org;
                })
                .catch(function(){
                    get('val-ip').innerHTML = "Error";
                    get('val-loc').innerHTML = "Error";
                    get('val-isp').innerHTML = "Error";
                });
        });
};

let checkSinglePerm = function(nameStr, idStr) {
    if (navigator.permissions) {
        navigator.permissions.query({ name: nameStr }).then(function(res) {
            let el = get(idStr);
            el.innerHTML = res.state;
            el.className = "status status-" + res.state;
            res.onchange = function() {
                el.innerHTML = res.state;
                el.className = "status status-" + res.state;
            };
        }).catch(function() {});
    }
};

let setupClock = function() {
    setInterval(function() {
        if(get('nav-time')) get('nav-time').innerHTML = new Date().toLocaleTimeString();
    }, 1000);
};

let setupLocBtn = function() {
    get('btn-loc').onclick = function() {
        let btn = get('btn-loc');
        let errBox = get('err-loc');
        let resBox = get('res-loc');

        errBox.style.display = "none";
        resBox.style.display = "none";
        btn.innerHTML = "Detecting...";
        btn.disabled = true;

        navigator.geolocation.getCurrentPosition(function(pos) {
            showLoc(pos);
            btn.innerHTML = "Get Location";
            btn.disabled = false;
        }, function(err) {
            if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
                btn.innerHTML = "Retrying location...";
                navigator.geolocation.getCurrentPosition(function(pos2) {
                    showLoc(pos2);
                    btn.innerHTML = "Get Location";
                    btn.disabled = false;
                }, function(err2) {
                    showLocErr(err2);
                    btn.innerHTML = "Get Location";
                    btn.disabled = false;
                }, { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 });
            } else {
                showLocErr(err);
                btn.innerHTML = "Get Location";
                btn.disabled = false;
            }
        }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
    };
};

let mapObj = null;
let markerObj = null;

window.initMap = function() {};

let showLoc = function(pos) {
    let lat = pos.coords.latitude;
    let lon = pos.coords.longitude;
    get('val-lat').innerHTML = lat.toFixed(6);
    get('val-lon').innerHTML = lon.toFixed(6);
    get('val-acc').innerHTML = pos.coords.accuracy != null ? "±" + pos.coords.accuracy.toFixed(2) + " m" : "N/A";
    get('val-alt').innerHTML = pos.coords.altitude != null ? pos.coords.altitude.toFixed(2) + " m" : "N/A";
    get('map-coords').innerHTML = lat.toFixed(4) + ", " + lon.toFixed(4);
    get('res-loc').style.display = "block";

    let gEl = get('gmap');
    if (gEl) {
        gEl.style.display = "block";
        let locObj = { lat: lat, lng: lon };
        if (window.google && window.google.maps) {
            if (!mapObj) {
                mapObj = new google.maps.Map(gEl, {
                    center: locObj,
                    zoom: 15,
                    mapTypeControl: false,
                    streetViewControl: false
                });
                markerObj = new google.maps.Marker({
                    position: locObj,
                    map: mapObj
                });
            } else {
                mapObj.setCenter(locObj);
                markerObj.setPosition(locObj);
            }
            
            let geocoder = new google.maps.Geocoder();
            get('map-coords').innerHTML = "Looking up address...";
            geocoder.geocode({ location: locObj }, function(results, status) {
                if (status === "OK" && results[0]) {
                    get('map-coords').innerHTML = results[0].formatted_address;
                } else {
                    get('map-coords').innerHTML = lat.toFixed(4) + ", " + lon.toFixed(4);
                }
            });
        } else {
            gEl.innerHTML = "<p style='padding:20px;color:red;'>Google Maps not loaded. Check your API key in index.html.</p>";
        }
    }
};

let showLocErr = function(err) {
    let msg = "Error";
    if (err.code === err.PERMISSION_DENIED) msg = "Permission denied.";
    if (err.code === err.POSITION_UNAVAILABLE) msg = "Location unavailable.";
    if (err.code === err.TIMEOUT) msg = "Timeout.";
    get('err-loc').innerHTML = msg;
    get('err-loc').style.display = "block";
};


detectDevice();
loadRestData();
setupClock();
setupLocBtn();
let initGoogleMapsScript = function() {
    let script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + ENV.GOOGLE_MAPS_API_KEY + "&callback=initMap";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
};

initGoogleMapsScript();
checkSinglePerm('geolocation', 'perm-loc');
checkSinglePerm('camera', 'perm-cam');
checkSinglePerm('microphone', 'perm-mic');
checkSinglePerm('notifications', 'perm-notif');
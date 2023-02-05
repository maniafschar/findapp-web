import { communication } from './communication';
import { global } from './global';
import { intro } from './intro';
import { pageHome } from './pageHome';
import { pageInfo } from './pageInfo';
import { formFunc, ui } from './ui';
import { user } from './user';

export { geoData };

class geoData {
	static angle = -1;
	static currentStreet = '';
	static currentStreetNonManual = '';
	static currentTown = 'München';
	static currentTownNonManual = geoData.currentTown;
	static headingID = null;
	static id = null;
	static initDeviceOrientation = null;
	static lastSave = 0;
	static latlon = { lat: 48.13684, lon: 11.57685 };
	static localizationAsked = false;
	static localized = false;
	static manual = false;
	static rad = 0.017453292519943295;

	static deviceOrientationHandler(event) {
		var alpha;
		if (event.trueHeading)
			alpha = -event.trueHeading;
		else if (event.magneticHeading)
			alpha = -event.magneticHeading;
		else if (event.webkitCompassHeading)
			alpha = -event.webkitCompassHeading;
		else if (event.absolute) {
			alpha = event.alpha;
			if (!window.chrome)
				alpha = alpha - 270;
		}
		if (alpha) {
			alpha = (alpha + 360) % 360;
			geoData.updateCompass(parseFloat(alpha.toFixed(1)));
		}
	}
	static getAngel(p1, p2) {
		return (360 + Math.atan2(p2.lon - p1.lon, p2.lat - p1.lat) * 180 / Math.PI) % 360;
	}
	static getDistance(lat1, lon1, lat2, lon2) {
		var R = 6371;
		var a = 0.5 - Math.cos((lat2 - lat1) * Math.PI / 180) / 2 +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
			(1 - Math.cos((lon2 - lon1) * Math.PI / 180)) / 2;
		return R * 2 * Math.asin(Math.sqrt(a));
	}
	static headingClear() {
		if (geoData.headingID) {
			navigator.compass.clearWatch(geoData.headingID);
			geoData.headingID = null;
		}
	}
	static headingWatch() {
		if (global.isBrowser()) {
			// only http hack, not relevant for app
			if (window.DeviceOrientationEvent && typeof (window.DeviceOrientationEvent.requestPermission) == 'function') {
				var initializedDespiteItBorthers = false;
				if (initializedDespiteItBorthers)
					window.DeviceOrientationEvent.requestPermission().then(function (response) {
						if (response == 'granted')
							ui.on(window, window.DeviceOrientationAbsoluteEvent ? 'DeviceOrientationAbsoluteEvent' : 'deviceorientation', geoData.deviceOrientationHandler);
					});
			} else
				ui.on(window, window.DeviceOrientationAbsoluteEvent ? 'DeviceOrientationAbsoluteEvent' : 'deviceorientation', geoData.deviceOrientationHandler);
		} else if (!geoData.headingID && navigator.compass)
			geoData.headingID = navigator.compass.watchHeading(geoData.deviceOrientationHandler, null);
	}
	static init() {
		if (geoData.id)
			geoData.pause();
		if (global.isBrowser())
			geoData.init2('granted');
		else {
			cordova.plugins.diagnostic.isLocationAuthorized(function (status) {
				if (status || global.getOS() == 'ios')
					geoData.init2('granted');
				else if (!geoData.localizationAsked) {
					if (ui.cssValue('popup', 'display') == 'none') {
						geoData.localizationAsked = true;
						ui.navigation.openPopup(ui.l('attention'), ui.l('locations.permission') + '<br/><br/><buttontext onclick="geoData.requestLocationAuthorization()" class="bgColor">' + ui.l('locations.permissionButton') + '</buttontext>');
					} else
						setTimeout(geoData.init, 2000);
				}
			});
		}
	}
	static init2(status) {
		if (status && status.toLowerCase().indexOf('denied') < 0) {
			geoData.id = navigator.geolocation.watchPosition(function (p) {
				if (p.coords && p.coords.latitude)
					geoData.save({
						latitude: p.coords.latitude,
						longitude: p.coords.longitude,
						altitude: p.coords.altitude,
						heading: p.coords.heading,
						speed: p.coords.speed,
						accuracy: p.coords.accuracy
					});
			}, null, { timeout: 10000, maximumAge: 10000, enableHighAccuracy: true });
		}
	}
	static initManual(data) {
		geoData.localized = true;
		geoData.manual = true;
		geoData.latlon.lat = data.lat;
		geoData.latlon.lon = data.lon;
		geoData.currentStreet = data.street;
		geoData.currentTown = data.town;
	}
	static openLocationPicker(event, noSelection) {
		event.preventDefault();
		event.stopPropagation();
		var e = formFunc.getDraft('locationPicker');
		if (e && !noSelection) {
			if (ui.q('locationPicker').style.display == 'none') {
				var s = '';
				for (var i = e.length - 1; i >= 0; i--)
					s += '<label onclick="geoData.set(' + JSON.stringify(e) + ')">' + e[i].town + '</label>';
				s += '<label onclick="geoData.openLocationPicker(event,true)">' + ui.l('home.locationPickerTitle') + '</label>';
				var e = ui.q('locationPicker');
				e.innerHTML = s;
				e.removeAttribute('h');
				e.style.top = ui.navigation.getActiveID() == 'home' ? ui.q('homeHeader svg').clientHeight + 'px' : '';
			}
			ui.toggleHeight('locationPicker');
		} else if (user.contact)
			communication.loadMap('geoData.openLocationPickerDialog');
		else
			intro.openHint({ desc: 'position', pos: '10%,5em', size: '80%,auto' });
	}
	static openLocationPickerDialog() {
		ui.navigation.openPopup(ui.l('home.locationPickerTitle'),
			'<mapPicker></mapPicker><br/>' +
			(geoData.manual ? '<buttontext class="bgColor" onclick="geoData.resetLocationPicker()">' + ui.l('home.locationPickerReset') + '</buttontext>' : '') +
			'<buttontext class="bgColor" onclick="geoData.saveLocationPicker()">' + ui.l('ready') + '</buttontext>', null, null,
			function () {
				setTimeout(function () {
					if (ui.q('locationPicker').style.display != 'none')
						ui.toggleHeight('locationPicker');
					pageHome.map = new google.maps.Map(ui.q('mapPicker'), { mapTypeId: google.maps.MapTypeId.ROADMAP, disableDefaultUI: true, maxZoom: 12, center: new google.maps.LatLng(geoData.latlon.lat, geoData.latlon.lon), zoom: 9 });
				}, 500);
			});
	}
	static pause() {
		if (geoData.id) {
			navigator.geolocation.clearWatch(geoData.id);
			geoData.id = null;
		}
	}
	static requestLocationAuthorization() {
		ui.navigation.hidePopup();
		cordova.plugins.diagnostic.requestLocationAuthorization(geoData.init2, null, cordova.plugins.diagnostic.locationAuthorizationMode.WHEN_IN_USE);
	}
	static resetLocationPicker() {
		geoData.manual = false;
		geoData.currentStreet = geoData.currentStreetNonManual;
		geoData.currentTown = geoData.currentTownNonManual;
		pageInfo.updateLocalisation();
		pageHome.updateLocalisation();
		geoData.init();
		ui.navigation.hidePopup();
	}
	static save(position, exec) {
		var d = geoData.getDistance(geoData.latlon.lat, geoData.latlon.lon, position.latitude, position.longitude);
		if (position.manual || !geoData.manual) {
			geoData.latlon.lat = position.latitude;
			geoData.latlon.lon = position.longitude;
		}
		if (position.manual)
			geoData.manual = true;
		if (user.contact && user.contact.id && new Date().getTime() - geoData.lastSave > 5000 &&
			(!geoData.localized || d > 0.05 && !geoData.manual || position.manual)) {
			communication.ajax({
				url: global.server + 'action/position',
				progressBar: false,
				method: 'POST',
				body: position,
				responseType: 'json',
				error(r) {
					geoData.currentStreet = r.status + ' ' + r.responseText;
					pageInfo.updateLocalisation();
					pageHome.updateLocalisation();
				},
				success(r) {
					if (r) {
						geoData.lastSave = new Date().getTime();
						if (!position.manual) {
							geoData.currentTownNonManual = r.town;
							geoData.currentStreetNonManual = r.street;
						}
						if (position.manual) {
							var e = formFunc.getDraft('locationPicker') || [];
							e.push({ lat: position.latitude, lon: position.longitude, town: r.town, street: r.street });
							if (e.length > 10)
								e.splice(0, e.length - 10);
							formFunc.saveDraft('locationPicker', e);
						}
						geoData.set(r);
						if (exec)
							exec.call();
					}
				}
			});
		}
		geoData.localized = true;
		geoData.updateCompass();
	}
	static saveLocationPicker() {
		geoData.save({ latitude: pageHome.map.getCenter().lat(), longitude: pageHome.map.getCenter().lng(), manual: true }, function () { pageHome.init(true); });
		ui.navigation.hidePopup();
	}
	static set(e) {
		if (e.lat) {
			geoData.latlon.lat = e.lat;
			geoData.latlon.lon = e.lon;
		}
		geoData.currentTown = e.town;
		geoData.currentStreet = e.street;
		pageInfo.updateLocalisation();
		pageHome.updateLocalisation();
	}
	static updateCompass(angle) {
		if (!angle)
			angle = geoData.angle;
		if (angle >= 0) {
			geoData.angle = angle;
			var e = ui.qa('detailCompass > span');
			for (var i = 0; i < e.length; i++)
				ui.css(e[i], 'transform', 'rotate(' + (parseFloat(e[i].getAttribute('a')) + geoData.angle) + 'deg)');
		}
	}
}
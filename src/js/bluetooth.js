import { communication } from './communication';
import { global } from './global';
import { intro } from './intro';
import { pageInfo } from './pageInfo';
import { ui } from './ui';
import { user } from './user';

export { bluetooth };

class bluetooth {
	static state = null;
	static UUID_SERVICE = 'e8a98f86-f973-442b-a099-b0b2d2c4f20e';
	static UUID_RX = 'a682b873-22a7-402b-b2ef-8cb432a7c3b1';
	static UUID_TX = '32a9cb83-00f9-4714-b130-4d0c1d30e363';

	static decode(a) {
		a = new Uint8Array(a);
		var s = '';
		for (var i = 0; i < a.length; i++)
			s += String.fromCharCode(a[i]);
		return decodeURIComponent(s);
	}
	static encode(s) {
		var utf8 = encodeURIComponent(s);
		var a = new Uint8Array(utf8.length);
		for (var i = 0; i < utf8.length; i++)
			a[i] = utf8.charCodeAt(i);
		return a.buffer;
	}
	static registerDevice(device) {
		if (user.contact && user.contact.findMe && device && device.id) {
			if (window.localStorage.getItem('findMeIDs') && window.localStorage.getItem('findMeIDs').indexOf('|' + device.id + '|') < 0) {
				window.localStorage.setItem('findMeIDs', window.localStorage.getItem('findMeIDs') + device.id + '|');
				ble.connect(device.id, function () {
					ble.write(device.id, bluetooth.UUID_SERVICE, bluetooth.UUID_TX, bluetooth.encode(user.contact.id), function () {
						ble.disconnect(device.id, null, function (e) {
							communication.sendError('ble disconnect: ' + JSON.stringify(e));
						});
					}, function (e) {
						communication.sendError('ble write: ' + JSON.stringify(e));
					});
				}, function (e) {
					communication.sendError('ble connect: ' + JSON.stringify(e));
				});
			}
		}
	}
	static requestAuthorization() {
		if (global.isBrowser())
			return;
		if (!user.contact.findMe) {
			bluetooth.stop();
			return;
		}
		var isRunning = window.localStorage.getItem('findMeIDs');
		bluetooth.reset();
		if (isRunning)
			return;
		var notification = function () {
			cordova.plugins.backgroundMode.enable();
			cordova.plugins.backgroundMode.on('failure', function (e) {
				communication.sendError('ble background mode: ' + JSON.stringify(e));
			});
			ble.startStateNotifications(function (state) {
				bluetooth.state = state;
				if (state == 'on') {
					if (ui.q('popupContent') && ui.q('popupContent').innerHTML.indexOf(ui.l('findMe.bluetoothDeactivated')) > -1)
						ui.navigation.hidePopup();
					Promise.all([
						blePeripheral.createService(bluetooth.UUID_SERVICE),
						blePeripheral.addCharacteristic(bluetooth.UUID_SERVICE, bluetooth.UUID_TX, blePeripheral.properties.WRITE, blePeripheral.permissions.WRITEABLE),
						blePeripheral.addCharacteristic(bluetooth.UUID_SERVICE, bluetooth.UUID_RX, blePeripheral.properties.READ | blePeripheral.properties.NOTIFY, blePeripheral.permissions.READABLE),
						blePeripheral.publishService(bluetooth.UUID_SERVICE),
						blePeripheral.startAdvertising(bluetooth.UUID_SERVICE, 'spontifyme'),
						blePeripheral.onWriteRequest(function (json) {
							if (user.contact && user.contact.findMe) {
								var id = bluetooth.decode(json.value);
								if (id)
									communication.ajax({
										url: global.server + 'db/one',
										method: 'POST',
										body: {
											classname: 'ContactBluetooth',
											values: { contactId2: id }
										}
									});
							}
						})
					]).then(
						function () { },
						function (e) {
							if (e.indexOf('Advertising has already started') < 0) {
								bluetooth.stop();
								communication.sendError('ble peripheral: ' + JSON.stringify(e));
							}
						}
					);
					ble.startScan([bluetooth.UUID_SERVICE], bluetooth.registerDevice, function (e) {
						communication.sendError('ble scan: ' + JSON.stringify(e));
					});
				} else if (user.contact.findMe)
					ui.navigation.openPopup(ui.l('attention'), ui.l('findMe.bluetoothDeactivated'));
			})
		};
		if (cordova.plugins.diagnostic.requestBluetoothAuthorization) {
			try {
				cordova.plugins.diagnostic.requestBluetoothAuthorization(notification);
			} catch (e) {
				ui.navigation.openPopup(ui.l('attention'), ui.l('findMe.bluetoothDeactivated'));
			}
		} else
			notification.call();
	}
	static reset() {
		if (!global.isBrowser())
			window.localStorage.setItem('findMeIDs', '|');
	}
	static toggle() {
		if (global.isBrowser())
			intro.openHint({ desc: 'bluetoothDescriptionBrowser', pos: '-0.5em,-4em', size: '80%,auto' });
		else if (window.localStorage.getItem('findMeIDs')) {
			user.save({ findMe: false });
			bluetooth.stop();
		} else {
			user.save({ findMe: true });
			bluetooth.requestAuthorization();
			if (bluetooth.state != 'on')
				ui.navigation.openPopup(ui.l('attention'), ui.l('findMe.bluetoothDeactivated'));
		}
	}
	static stop() {
		if (!global.isBrowser())
			ble.stopScan();
		window.localStorage.removeItem('findMeIDs');
	}
}
/*
 * Class representing the Jetpack only 
 * Prepare the editor, save, update
 */
var Jetpack = new Class({
	Extends: Capability,
	type: 'jetpack',
	options: {
		description_el: {element: 'jetpack_description'},
		try_in_browser_el: 'try_in_browser'
	},
	/*
	 * Method: initialize
	 * @attribute object options: 
	 * 	
	 * initialize Version and inside of that chosen FDEditor
	 * assign actions to the buttons
	 */
	initialize: function(options) {
		this.setOptions(options);
		if (!this.options.version.manifest) {
			this.options.version.manifest = this.generateInitialManifest();
			// TODO: REFACTOR: this is actually a hack!
			$('version_manifest').set('text', this.options.version.manifest);
		}
		this.parent(this.options);
	},
	/*
	 * Method: initializeVersion
	 * assigns JetVersion to this.version
	 */
	initializeVersion: function() {
		this.version = new JetVersion(this.options.version);
	},
	/*
	 * Method: updateFromDOM
	 * get all jetpack editable fields from DOM and set parameters in model
	 */
	updateFromDOM: function() {
		this.parent();
	},
	getManifestData: function() {
		return {
			name: this.options.slug,
			fullName: this.options.name,
			description: this.options.description,
			author: this.options.creator
		}
	},
	generateManifest: function() {
		var data = $H(this.getManifestData());
		data.extend(this.version.getManifestData());
		return JSON.encode(data);
	},
	generateInitialManifest: function() {
		var data = $H(this.getManifestData());
		data.extend({
			contributors: [], // author strings
			// url: '',
			// license: '',
			version: '0.0.0',
			dependencies: [], // names of the packages it relies on
			// lib: 'lib',
			// tests: 'tests',
			// packages: 'packages',
			main: 'main' // main.js needs to be produced
		});
		return JSON.encode(data)
					.replace(/",/g,'",\n')
					.replace(/],/g,'],\n')
					.replace(/{/g,'{\n')
					.replace(/}/g,'\n}');
	}
});

/*
 * Class representing the Version only 
 * Prepare the editor, save, update
 */
var JetVersion = new Class({
	Extends: CapVersion, 
	type: 'jetpack',
	options: {
		//manifest: null,
		//published: null,
		manifest_el: {
			element: 'version_manifest',
			type: 'json',
			reindentOnLoad: true
		}
		//switch_manifest_id: ''
	},
	/*
	 * Method: initialize
	 * instantiate FDEditor
	 */
	initialize: function(options) {
		this.setOptions(options);
		this.parent(options);
		this.data.version_manifest = this.options.manifest;
	},
	/*
	 * Method: generateManifest
	 * If no manifest.json prepared means this is the first version ever
	 * Prepare manifest on the data provided
	 */
	generateManifest: function() {
		var data = $H(fd.getItem().getManifestData() );
		data.extend(this.getManifestData());
		return JSON.encode(data);
	},
	getManifestData: function() {
		return {
			contributors: [], // author strings
			// url: '',
			// license: '',
			version: '{name}.{counter}'.substitute(this.options),
			dependencies: [], // names of the packages it relies on
			// lib: 'lib',
			// tests: 'tests',
			// packages: 'packages',
			main: 'main' // main.js needs to be produced
		}
	},

	/*
	 * Method: instantiateEditors
	 */
	instantiateEditors: function() {
		this.parent();
		this.manifest_el = new FDEditor(this.options.manifest_el).hide();
		fd.editors.push(this.manifest_el);
	},
	/*	
	 * Method: listenToJetpackEvents
	 */
	listenToEvents: function() {
		this.parent();
		this.manifest_el.addEvent('change', this.boundAfterDataChanged);
		this.manifest_el.addEvent('change', function() {
			if (this.switch_manifest_el) {
				this.switch_manifest_el.getParent('li').addClass('UI_File_Modified');
			}
		}.bind(this));
	},
	/*
	 * Method: initializeEditorSwitches
	 */
	initializeEditorSwitches: function() {
		this.parent();
		this.switch_manifest_el = $(this.options.switch_manifest_id);
		if (this.switch_manifest_el) {
			this.switch_manifest_el.addEvent('click', this.switchToManifest.bind(this));
		}
	},
	/*
	 * Method: switchToManifest
	 */
	switchToManifest: function(e) {
		e.preventDefault();
		fd.hideEditors();
		this.manifest_el.show();
	},
	/*
	 * Method: updateFromDOM
	 * get all version editable fields from DOM and set parameters in model
	 */
	updateFromDOM: function() {
		this.parent();
		this.data.version_manifest = this.manifest_el.getContent();
	}
});

/*
 * Extending Flightdeck with Editor functionality
 */

FlightDeck = Class.refactor(FlightDeck,{

	initialize: function(options) {
		this.setOptions(options);
		this.sidebar = new Sidebar();
		var tabs = this.tabs = new FlightDeck.TabBar('editor-tabs', {
			arrows: false,
			onTabDown: function(tab) {
				if (!tab.hasClass('selected')) {
					tab.retrieve('tab:instance').file.onSelect();
				}
			},
			onCloseDown: function(tabClose) {
				var tabEl = tabClose.getParent('.tab');
				var nextTab = tabEl.hasClass('selected') ?
					tabEl.getPrevious('.tab.') || tabEl.getNext('.tab') :
					$(tabs).getElement('.tab.selected');
				if(nextTab) {
					var tab = tabEl.retrieve('tab:instance'),
						that = this,
						file = tab.file;
						
					function closeTab() {
						tab.destroy();
						that.fireEvent('tabDown', nextTab);
					}
					
					if(file.changed) {
						fd.showQuestion({
							title: 'Lose unsaved changes?',
							message: 'The tab "'+file.getShortName()+'" that you are trying to close has unsaved changes.',
							buttons: [
								{
									'type': 'reset',
									'text': 'Cancel',
									'class': 'close'
								},
								{
									'type': 'submit',
									'text': 'Close Tab',
									'id': 'close_tab_btn',
									'default': true,
									'irreversible': true,
									'callback': function() {
										closeTab();
										//do this after editor changes instances, cause editor
										//dumps content when it changes
										setTimeout(function() {
											file.content = file.original_content;
											file.setChanged(false);
											fd.edited--;
											if(!fd.edited) {
												fd.fireEvent('reset');
											}
										}, 1);
									}
								}
							]
						});
					} else {
						closeTab();
					}
				}
				
			}
		});
		this.previous(options);

		this.edited = 0;
		window.addEvent('beforeunload', function(e) {
			if (fd.edited && !fd.saving) {
				e.stop();
				e.returnValue = "You've got unsaved changes.";
			} else {
			}
		});
		this.enableMenuButtons();
		this.addEvent('change', this.onChanged);
		this.addEvent('save', this.onSaved);
		this.addEvent('reset', this.onReset);
	},

	onChanged: function() {
        $log('FD: INFO: document changed - onbeforeunload warning is on and save button is lit.');
        $$('li.Icon_save').addClass('Icon_save_changes');
		this.edited++;
	},

	onSaved: function() {
        //any save specific logic?
		this.fireEvent('reset');
	},
	
	onReset: function() {
		$log('FD: INFO: document saved - onbeforeunload warning is off and save button is not lit.');
        $$('li.Icon_save').removeClass('Icon_save_changes');
		this.edited = 0;
	},

	/*
	 * Method: getItem
	 */
	getItem: function() {
		return this.item;
	},

	/*
	 * Method: enableMenuButtons
	 * Switch on menu buttons, check if possible
	 */
	enableMenuButtons: function() {
		$$('.' + this.options.menu_el + ' li.disabled').each(function(menuItem){
			var switch_on = true;
			if (switch_on) {
				menuItem.removeClass('disabled');
			}
		}, this);
	}
});

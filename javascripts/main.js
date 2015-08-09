var storage = localStorage;

var model = {
	currentNote: null,
	notes: [],
	init: function() {
		var notes = JSON.parse(storage.getItem("notes"));
		if (!notes) {
			var exampleNoteTitle = "Example Note";
			var exampleNoteText = "This is an example note, use the right controlls to EDIT or DELETE"
			+ " this note or use the left controlls to ADD anotother note"
			+ " have fun :)";
			var note = model.createNote(exampleNoteTitle, exampleNoteText);
			model.addNote(note);
			storage.setItem("notes", JSON.stringify(model.notes));
		} else {
			this.notes = notes;
		}	
	},
	createNote: function(title, text) {
		return {
			title: title,
			text: text
		}
	},
	addNote: function(note) {
		this.notes.unshift(note);
		storage.setItem("notes", JSON.stringify(model.notes))
	}
};
var controller = {
	init: function() {
		model.init();
		view.init();

		this.bindEvents();		
	},
	bindEvents: function() {
		for(var i = 0; i < model.notes.length; i++) {
			var $sidebarElement = document.getElementById(i);
			$sidebarElement.addEventListener("click", function() {
				var id = parseInt(this.id);
				view.updateDisplayNote(id);
			});
		}
	}
};
var view = {
	$noteTite: null,
	$noteText: null,
	$sidebar: null,
	init: function() {
		this.$noteTitle = document.querySelector(".display header h2"); 
		this.$noteText = document.querySelector(".display article");
		this.$sidebar = document.querySelector(".notes ul");

		this.updateDisplayNotes();
		this.updateSidebarNotes(); 
	},
	updateDisplayNotes: function() {
		this.$noteTitle.innerHTML = model.notes[0].title;
		this.$noteText.innerHTML = model.notes[0].text;
	},
	updateDisplayNote: function(noteId) {
		this.$noteTitle.innerHTML = model.notes[noteId].title;
		this.$noteText.innerHTML = model.notes[noteId].text;
	},
	updateSidebarNotes: function() {
		this.$sidebar.innerHTML = "";
		for(var i = 0; i < model.notes.length; i++) {
			var listItem = document.createElement("li");
			var title = model.notes[i].title;

			listItem.id = i;
			listItem.innerHTML = title;

			this.$sidebar.appendChild(listItem);
		}
	}
};

controller.init();
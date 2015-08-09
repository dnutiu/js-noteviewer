var storage = localStorage;

var model = {
	currentNote: null,
	notes: [],
	init: function() {
		var notes = JSON.parse(storage.getItem("notes"));
		this.currentNote = storage.getItem("currentNote")

		if (!notes) {
			var exampleNoteTitle = "Example Note";
			var exampleNoteText = "This is an example note, use the right controlls to EDIT or DELETE"
			+ " this note or use the left controlls to ADD anotother note"
			+ " have fun :)";
			var note = model.createNote(exampleNoteTitle, exampleNoteText);
			model.addNote(note);
			this.update();
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
		this.update();
	},
	update: function() {
		storage.setItem("notes", JSON.stringify(model.notes))
	}
};

var controller = {
	editMode: false,
	error: false,
	init: function() {
		model.init();
		view.init();

		this.bindEvents();		
	},
	bindEvents: function() {
		var $add = document.getElementById("add");
		var $edit = document.getElementById("edit");
		var $delete = document.getElementById("delete");
		var $close = document.getElementById("close");
		var self = this;

		this.bindNoteEvents();

		$close.addEventListener("click", function() {
			if (self.editMode) {
				view.toggleEditMode($add, "Add");
			}
			view.refresh();
			controller.bindNoteEvents();			
		});

		$add.addEventListener("click", function() {
			if (self.editMode) {
				self.createNote();
			}
			if (!self.error) {
				view.toggleEditMode(this, "Add");
			}
		});

		$delete.addEventListener("click", function() {
			var notes = model.notes;
			var index = model.currentNote;
			
			notes = notes.splice(index, 1);
			
			model.update();
			view.refresh();
			controller.bindNoteEvents();
		});
		//edit
	},
	bindNoteEvents: function() {
		var self = this;
		for(var i = 0; i < model.notes.length; i++) {
			var $sidebarElement = document.getElementById(i);
			$sidebarElement.addEventListener("click", function() {
				var id = parseInt(this.id);
				model.currentNote = id;
				storage.setItem("currentNote", id);

				view.selectNote(this);
				view.updateDisplayNote(id);
			});
		}
	},
	clearError: function() {
		this.error = false;
		view.outputError("");
	},
	createNote: function() {
		var title = document.getElementById('noteTitle').value; 
		var text = document.getElementById('noteText').value;
		var note;

		if (title.length > 3) {
			view.outputError("")
			this.error = false;

			note = model.createNote(title, text);
			model.addNote(note);

			view.refresh();
			controller.bindEvents();			
		} else {
			view.outputError("Title must contain 3 or more characters!")
			this.error = true;
		}
	}
};

var view = {
	$noteTite: null,
	$noteText: null,
	$sidebar: null,
	$noteList: null,
	$display: null,
	init: function() {
		this.$noteTitle = document.querySelector(".display header h2"); 
		this.$noteText = document.querySelector(".display article");
		this.$sidebar = document.querySelector(".notes ul");
		this.$display = document.getElementsByTagName("section")[0];


		this.updateSidebarNotes(); 

		this.$noteList = this.$sidebar.getElementsByTagName("li");

		this.updateDisplayNotes();
	},
	clearInputs: function() {
		document.getElementById('noteTitle').value = ""; 
		document.getElementById('noteText').value = "";
	},
	refresh: function() {
		this.clearInputs();
		this.updateSidebarNotes();
		this.updateDisplayNotes();
		controller.clearError();
	},
	unselectNotes: function() {
		var $noteList = this.$noteList;
		for (var i = 0; i < $noteList.length; i++) {
			$noteList[i].className = "";
		}
	},
	selectNote: function(listItem) {
		this.unselectNotes();
		listItem.className = "selected";
	},
	outputError: function(message) {
		var $error = document.getElementsByClassName("error")[0];
		$error.innerHTML = message;
	},
	updateDisplayNotes: function() {
		var currentNote = model.currentNote;

		if (currentNote) {
			this.updateDisplayNote(currentNote);
			view.selectNote(this.$noteList[currentNote]);
		} else {
			this.updateDisplayNote(0);
			view.selectNote(this.$noteList[0]);
		}
	},
	toggleEditMode: function(btn, text) {
		var edit = controller.editMode;
		var classList = this.$display.classList;
		if(edit) {
			classList.remove("editMode");
			controller.editMode = false;
			btn.innerHTML = text;
		} else {
			classList.add("editMode");
			controller.editMode = true;
			btn.innerHTML = "Save";
		}
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
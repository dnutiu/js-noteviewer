"use strict";
var storage = localStorage;

var model = {
	currentNote: null,
	notes: [],
	init: function() {
		var notes = JSON.parse(storage.getItem("notes"));
		this.currentNote = storage.getItem("currentNote");

		if (!notes || notes.length == 0) {
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
		};
	},
	addNote: function(note) {
		this.notes.unshift(note);
		this.currentNote = this.notes.length - 1;
		this.update();
	},
	updateNote: function(title, text) {
		this.notes[this.currentNote].title = title;
		this.notes[this.currentNote].text = text;
	},
	update: function() {
		storage.setItem("notes", JSON.stringify(model.notes));
		storage.setItem("currentNote", model.currentNote);
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
		//var $delete = document.getElementById("delete");
		var $close = document.getElementById("close");
		var self = this;

		this.bindNoteEvents();

		$close.addEventListener("click", function() {
			if (self.editMode) {
				view.toggleEditMode($add, "Add");
				$edit.innerHTML = "Edit";
			}
			view.refresh();
			controller.bindNoteEvents();			
		});

		$add.addEventListener("click", function() {
			if (self.editMode) {
				self.createNote();
				$close.click();
			}
			if (!self.error) {
				view.toggleEditMode(this, "Add");
			}
		});

		//broken
		/*
		$delete.addEventListener("click", function(e) {
			e.stopImmediatePropagation();
			console.log("B " + model.currentNote);

			model.notes.splice(model.currentNote, 1);
			model.currentNote = model.currentNote - 1 >= 0 ? 
								((model.currentNote + 1) % model.notes.length) : null;			

			view.refresh();
			controller.bindNoteEvents();			
			model.update();

			console.log("A " + model.currentNote);					
		});
		*/
		//edit
		$edit.addEventListener("click", function() {
			if (self.editMode) {
				self.editNote();
				$close.click();
			}
			if (!self.error) {
				view.editNote();
				view.toggleEditMode(this, "Edit");
			}
		});
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
	editNote: function() {
		var title = document.getElementById('noteTitle').value; 
		var text = document.getElementById('noteText').value;
		if (title.length > 1 && text.length > 1) {
			model.updateNote(title, text);
			model.update();
		}	
	},
	createNote: function() {
		var title = document.getElementById('noteTitle').value; 
		var text = document.getElementById('noteText').value;
		var note;

		if (title.length >= 3) {
			view.outputError("")
			this.error = false;

			note = model.createNote(title, text);
			model.addNote(note);

			//view.selectNoteByIndex(model.currentNote);
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
	editNote: function() {
		var title = model.notes[model.currentNote].title;
		var text = model.notes[model.currentNote].text;

		document.getElementById('noteTitle').value = title; 
		document.getElementById('noteText').value = text;
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
	selectNoteByIndex: function(index) {
		//broken
		var item = this.$noteList[index];
		this.unselectNotes();
		item.className = "selected";
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
			//this.updateDisplayNote(0);
			//view.selectNote(this.$noteList[0]);
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
		if (model.currentNote) {
			this.$noteTitle.innerHTML = model.notes[noteId].title;
			this.$noteText.innerHTML = model.notes[noteId].text;
		}
	},
	updateSidebarNotes: function() {
		if (model.currentNote) {
			this.$sidebar.innerHTML = "";
			for(var i = 0; i < model.notes.length; i++) {
				var listItem = document.createElement("li");
				var title = model.notes[i].title;

				listItem.id = i;
				listItem.innerHTML = title;

				this.$sidebar.appendChild(listItem);
			}
		}
	}
};

controller.init();
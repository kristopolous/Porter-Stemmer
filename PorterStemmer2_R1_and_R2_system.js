var 
  // Define a vowel as one of
  //  a   e   i   o   u   y
  vowel = "[aeiouy]",          

  // [implicit] define a non-vowel
  non_vowel = "[^aeiouy]",          

  func,

  R1_exception = new RegExp("^(?=gener|commun|arsen)(.*)$", "g"),
  R1_and_R2 = new RegExp(vowel + non_vowel + "(.*)$", "g");

function Word(init) {
  this.word = init;
}

Word.prototype.toString = function() {
  return this.word;
}

Word.prototype.decompose = function() {
  // If the words begins gener, commun or arsen, 
  // set R1 to be the remainder of the word.
  R1_exception.lastIndex = R1_and_R2.lastIndex = 0;
  var match = R1_exception.exec(this.word) || R1_and_R2.exec(this.word);

  this._R1 = match[1];
  this._R1_index = this.word.length - this._R1.length;

  R1_and_R2.lastIndex = 0;
  match = R1_and_R2.exec(this._R1);
  this._R2 = match[1];
  this._R2_index = this.word.length - this._R2.length;

  return this;
}

Word.prototype.recompose = function() {
  return this.word = [
    this.word.substr(0, this._R1_index),
    this._R1.substr(0, this._R2_index - this._R1_index),
    this._R2
  ].join("");
}

Word.prototype.R1 = function() {
  return this.decompose()._R1;
}

Word.prototype.R2 = function() {
  return this.decompose()._R2;
}

Word.prototype.R1_match = function(regex) {
  var ret = this.decompose()._R1.match(regex);

  if(ret !== null) {
    ret.index += this._R1_index;
    ret.input = this.word;
  }

  return ret;
}


Word.prototype.R2_match = function(regex) {
  var ret = this.decompose()._R2.match(regex);

  if(ret !== null) {
    ret.index += this._R2_index;
    ret.input = this.word;
  }

  return ret;
}

Word.prototype.R1_replace = function(a, b) {
  this._R1 = this.decompose()._R1.replace(a, b);
  return this.recompose();
}

Word.prototype.R2_replace = function(a, b) {
  this._R2 = this.decompose()._R2.replace(a, b);
  return this.recompose();
}

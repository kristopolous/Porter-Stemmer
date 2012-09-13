// Reference Javascript Porter2 Stemmer. This code corresponds to the 2005 revision of
// the porter2 stemmer at http://snowball.tartarus.org/algorithms/english/stemmer.html
//
// The latest version of this code is available at https://github.com/kristopolous/Porter-Stemmer
// The specification from above can be found in the spec directory at that repository.
//
// The license for this work is covered in BSD-License.txt and is incorporated herein by reference.
//
// Let's roll...
//
var stemmer = (function(){
  // Because some patterns below are Arrays (not by necessity of
  // technology but by necessity of clarity for you the reader), there is 
  // a separate set of regexp operations here that support that syntax.
  function Porter_RegExp(array) {
    this.match_set = [];
    for(var i = 0; i < array.length; i++) {
      this.match_set.push(new RegExp(array[i]));
    }
  }

  Porter_RegExp.prototype.test = function(toTest) {
    for(var i = 0; i < this.match_set.length; i++) {
      if(this.match_set[i].test(toTest)) {
        return true;
      }
    }
    return false;
  }

  Porter_RegExp.create = function(string_or_array) {
    if(typeof(string_or_array) == "string") {
      return new RegExp(string_or_array);
    } else {
      return new Porter_RegExp(string_or_array);
    }
  }

  function dummyDebug() {}

  function realDebug() {
    console.log(Array.prototype.slice.call(arguments).join(' '));
  }

  // Now we start a copy-paste job in the comments, directly
  // from the specifications with the following exceptions:
  //
  //  1. [implicit] means that things had to be done 
  //     implicitly and have no corresponding quote fom
  //
  //  2. Comments preceded by "Implementors Note:" correspond
  //     to comments and their associated code blocks being
  //     done by me, as needed, in order to satisfy some set
  //     of requirements.
  var
    // Define a vowel as one of
    //  a   e   i   o   u   y
    vowel = "[aeiouy]",          

    // [implicit] define a non-vowel
    non_vowel = "[^aeiouy]",          

    // Define a double as one of
    // bb   dd   ff   gg   mm   nn   pp   rr   tt
    double = "[bdfgmnprt]{2}",

    // Define a valid li-ending as one of
    // c   d   e   g   h   k   m   n   r   t
    li_ending = "[cdeghkmnrt]",

    // R1 is the region after the first non-vowel following a vowel, or the   
    // end of the word if there is no such non-vowel. (This definition may    
    // be modified for certain exceptional words — see below.) 

    //
    // R2 is the region after the first non-vowel following a vowel in R1, or 
    // the end of the word if there is no such non-vowel. (See note on R1 and R2.) 
    //
    // Implementors note: R2 is the regex of R1 applied to the match set of R1
    // (capture-subpattern) if R1 exists or is the empty string otherwise.
     
    R1_and_R2 = Porter_RegExp.create(vowel + non_vowel + "(.*)$"),
    
    get_region = function(word) {
      var res = R1_and_R2.match(word);
      return res ? res[1] : "";
    },


    // Define a short syllable in a word as either (a) a vowel followed by a 
    // non-vowel other than w, x or Y and preceded by a non-vowel, or * (b) 
    // a vowel at the beginning of the word followed by a non-vowel. 
    short_syllable = Porter_RegExp.create([
      non_vowel + "([^aeiouywx][aeiouy])",        // (a)
      "^(" + vowel + non_vowel + ")"              // (b)
    ]);

  // A word is called short if it ends in a short syllable, and if R1 is null. 
  function is_short(word) {
    return !R1.test(word) && short_syllable.test(word);
  }

  // An apostrophe (') may be regarded as a letter. 
  var letter = "[a-z']";

  // Assume that 
  function longest_suffix(word, set) {
    var 
      len = set.length,
      res,
      set.sort(function(a, b) {
        return b[0].toString().length - a[0].toString().length;
      }),
      ix;

    for(ix = 0; ix < len; ix++) {
      res = set[0].exec(word);
      if(res !== null) {
        return word.substr(0, res.index) + set[1];
      }
    }

    return word;
  }


  // Implementors note: This is the start of the machinery
  return function (word, debug) {

    // If the word has two letters or less, leave it as it is. 
    var two_letters_or_less = new RegExp("^" + letter + "{1,2}$");

    if (two_letters_or_less.test(word)) {
      debugFunction(
        "If the word has two letters or less, leave it as it is."
        two_letters_or_less,
        word
      );

      return word;
    }

    // Remove initial ', if present.
    if (word.charAt(0) == "'") {
      word = word.slice(1);
    }

    // Set initial y, or y after a vowel, to Y
    word = word.replace(/y/, 'Y');
    word = word.replace(/([aeiouy])y/, "$1Y");

    // then establish the regions R1 and R2
    var 
      match,
      R1, 
      R2; 

    // If the words begins gener, commun or arsen, 
    // set R1 to be the remainder of the word.
    match = word.match(/^(?=gener|commun|arsen)(.*)$/);
    if (match !== null) {
      R1 = match[1];
    } else {
      R1 = get_region(word);
    }

    R2 = get_region(R1);

    // Step 0:
    // Search for the longest among the suffixes,
    //
    // '
    // 's
    // 's'
    //
    // and remove if found.
    //

    R1 = longest_suffix(R1, [
      [/'s'$/, ""],
      [/'s$/, ""],
      [/'$/, ""]
    ]);

    R2 = longest_suffix(R2, [
      [/'s'$/, ""],
      [/'s$/, ""],
      [/'$/, ""]
    ]);


    // Step 2:
    // Search for the longest among the following suffixes, and, 
    // if found and in R1, perform the action indicated. 
    //
    R1 = longest_suffix(R1, [
      //  tional:   replace by tion
      [/tional$/, "tion"],

      //  enci:   replace by ence
      [/enci$/, "ence"],

      //  anci:   replace by ance
      [/anci$/, "ance"],

      //  abli:   replace by able
      [/abli$/, "able"],

      //  entli:   replace by ent
      [/entli$/, "ent"],

      //  izer   ization:   replace by ize
      [/izer$/, "ize"],
      [/ization$/, "ize"],

      //  ational   ation   ator:   replace by ate
      [/ational$/, "ate"],
      [/ation$/, "ate"],
      [/ator$/, "ate"],

      //  alism   aliti   alli:   replace by al
      [/alism$/, "al"],
      [/aliti$/, "al"],
      [/alli$/, "al"],

      //  fulness:   replace by ful
      [/fulness$/, "ful"],

      //  ousli   ousness:   replace by ous
      [/ousli$/, "ous"],
      [/ousness$/, "ous"],

      //  iveness   iviti:   replace by ive
      [/iveness$/, "ive"],
      [/|iviti$/, "ive"],

      //  biliti   bli+:   replace by ble
      [/biliti$/, "ble"],
      [/bli$/, "ble"],

      //  ogi+:   replace by og if preceded by l
      [/logi$/, "log"],

      //  fulli+:   replace by ful
      [/fulli$/, "ful"],

      //  lessli+:   replace by less
      [/lessli$/, "less"],

      //  li+:   delete if preceded by a valid li-ending
      ["(?:" + li_ending + ")li", ""]
    ]);

    // Step 3:
    // Search for the longest among the following suffixes, 
    // and, if found and in R1, perform the action indicated. 
    //
    R1 = longest_suffix(R1, [
      // ational+:   replace by ate
      [/ational$/, "ate"],

      // alize:   replace by al
      [/alize$/,  "al"],

      // icate   iciti   ical:   replace by ic
      [/icate$/, "ic"],
      [/iciti$/, "ic"],
      [/ical$/, "ic"],

      // ful   ness:   delete
      [/ful$/, ""],
      [/ness$/, ""],
    ]);

    R2 = longest_suffix(R2, [
      // ative*:   delete if in R2
      [/ative$/, ""]
    ]);
   
    // Step 4
    // Search for the longest among the following suffixes, and, 
    // if found and in R2, perform the action indicated.
    R2 = R2.replace(/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize|sion|tion)$/, "$1");
    

  return function (w, debug) {
    var
      stem,
      suffix,
      firstch,
      re,
      re2,
      re3,
      re4,
      debugFunction,
      origword = w;

    if (debug) {
      debugFunction = realDebug;
    } else {
      debugFunction = dummyDebug;
    }

    if (w.length < 3) { return w; }

    firstch = w.substr(0,1);
    if (firstch == "y") {
      w = firstch.toUpperCase() + w.substr(1);
    }

    // Step 1a
    re = /^(.+?)(ss|i)es$/;
    re2 = /^(.+?)([^s])s$/;

    if (re.test(w)) { 
      w = w.replace(re,"$1$2"); 
      debugFunction('1a',re, w);

    } else if (re2.test(w)) {
      w = w.replace(re2,"$1$2"); 
      debugFunction('1a',re2, w);
    }

    // Step 1b
    re = /^(.+?)eed$/;
    re2 = /^(.+?)(ed|ing)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      re = new RegExp(mgr0);
      if (re.test(fp[1])) {
        re = /.$/;
        w = w.replace(re,"");
        debugFunction('1b',re, w);
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1];
      re2 = new RegExp(s_v);
      if (re2.test(stem)) {
        w = stem;
        debugFunction('1b', re2, w);

        re2 = /(at|bl|iz)$/;
        re3 = new RegExp("([^aeiouylsz])\\1$");
        re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");

        if (re2.test(w)) { 
          w = w + "e"; 
          debugFunction('1b', re2, w);

        } else if (re3.test(w)) { 
          re = /.$/; 
          w = w.replace(re,""); 
          debugFunction('1b', re3, w);

        } else if (re4.test(w)) { 
          w = w + "e"; 
          debugFunction('1b', re4, w);
        }
      }
    }

    // Step 1c
    re = new RegExp("^(.*" + v + ".*)y$");
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      w = stem + "i";
      debugFunction('1c', re, w);
    }

    // Step 2
    re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step2list[suffix];
        debugFunction('2', re, w);
      }
    }

    // Step 3
    re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step3list[suffix];
        debugFunction('3', re, w);
      }
    }

    // Step 4
    re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
    re2 = /^(.+?)(s|t)(ion)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      if (re.test(stem)) {
        w = stem;
        debugFunction('4', re, w);
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1] + fp[2];
      re2 = new RegExp(mgr1);
      if (re2.test(stem)) {
        w = stem;
        debugFunction('4', re2, w);
      }
    }

    // Step 5
    re = /^(.+?)e$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      re2 = new RegExp(meq1);
      re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
      if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
        w = stem;
        debugFunction('5', re, re2, re3, w);
      }
    }

    re = /ll$/;
    re2 = new RegExp(mgr1);
    if (re.test(w) && re2.test(w)) {
      re = /.$/;
      w = w.replace(re,"");
      debugFunction('5', re, re2, w);
    }

    // and turn initial Y back to y
    if (firstch == "y") {
      w = firstch.toLowerCase() + w.substr(1);
    }

    // If the words begins gener, commun or arsen, set R1 to be the remainder of the word. 
    //
    // Stem certain special words as follows, 
    var specialWords = {

    // skis   ->  ski
      "skis" : "ski",

    // skies  ->  sky
      "skies" : "sky",

    // dying      die
      "dying" : "die",

    // lying      lie
      "lying" : "lie",

    // tying  ->  tie 
      "tying" : "tie",

    // idly   ->  idl
      "idly" : "idl",

    // gently     gentl 
      "gently" : "gentl",

    // ugly       ugli 
      "ugly" : "ugli",

    // early      earli 
      "early": "earli",

    // only       onli 
      "only": "onli",

    // singly -> singl
      "singly": "singl"
    }, emptyObject = {};

    if(specialWords[origword] !== emptyObject[origword]){
      w = specialWords[origword];
      debugFunction('Special Word', w);
    }

    // If one of the following is found, leave it invariant, 
    // sky 
    // news 
    // howe
    // atlas        cosmos        bias        andes


    if( "sky news howe atlas cosmos bias andes" 
    // Following step 1a, leave the following invariant, 
    //
    // inning         outing        canning         herring         earring
    // proceed        exceed        succeed
       + "inning outing canning herring earring proceed exceed succeed".indexOf(origword) !== -1 ){
      word = origword;
      debugFunction('Special Word', w);
    }

      // Address words overstemmed as gener-
      re = /.*generate?s?d?(ing)?$/;
      if( re.test(origword) ){
        w = w + 'at';
        debugFunction('Overstemmed', w);
      }

      re = /.*general(ly)?$/;
      if( re.test(origword) ){
        w = w + 'al';
        debugFunction('Overstemmed', w);
      }

      re = /.*generic(ally)?$/;
      if( re.test(origword) ){
        w = w + 'ic';
        debugFunction('Overstemmed', w);
      }

      re = /.*generous(ly)?$/;
      if( re.test(origword) ){
        w = w + 'ous';
        debugFunction('Overstemmed', w);
      }

      // Address words overstemmed as commun-
      re = /.*communit(ies)?y?/;
      if( re.test(origword) ){
        w = w + 'iti';
        debugFunction('Overstemmed', w);
      }

      return w;
  }
})();

The official javascript implementation of the Porter Stemmer.

# About

There are two reference implementation here, corresponding to two different stemmers by Martin Porter, one being 
the [original Porter Stemmer from 1980](http://tartarus.org/martin/PorterStemmer/def.txt), covered by PorterStemmer1980.js, 
and the second corresponding to the [Porter2 stemming algorithm](http://snowball.tartarus.org/algorithms/english/stemmer.html), 
(rev. July 2005) covered by PorterStemmer2.js.

These files have also been included in the spec directory for referencing.

# Usage

Both implementations are invoked the same way, `stemmer(<word to stem>)`, returning the stemmed word.

In both implementations, you can get a trace as to what is going on, corresponding to the steps outlined in the papers, by
provding a second argument of "true" and using one of the browser debug consoles.  

For instance, `stemmer("hopefully", true)` will output `1c /^(.*[aeiouy].*)y$/ hopefulli`, telling us that rule 1c was matched
by that regular expression and as a result, we got hopefulli.

# Status

As of Sept 6, 2012, PorterStemmer1980 is 100% compliant and PorterStemmer2 is 95.21%. 100% complaince of PorterStemmer2 is slated
for completion by October 7th, 2012.

# Demo

There is a demo available [here](http://qaa.ath.cx/porter_js_demo.html)

# Mailing List

Available over [here](https://groups.google.com/forum/#!forum/js-porter-stemmer).

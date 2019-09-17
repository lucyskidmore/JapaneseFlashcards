'use strict';

const constants = require('./constants');
const vocabDictMain = constants.vocabDictMain;
const vocabDictLength = vocabDictMain.length;
const Util = require('util.js');

var switchLang = function(text) {
  if (text){
    return "<prosody volume ='x-loud'><voice name='Mizuki'><lang xml:lang='ja-JP'>" + text + "</lang></voice></prosody>"
  }
}

var addtoLeitner = function(leitnerDecks, vocabListUserIndex, sessionNumber, masteredWords) {
    
    for (var i = vocabListUserIndex; (i < vocabListUserIndex+5) || (i === vocabDictLength-1); i++) {
        var randomSplice = leitnerDecks[0].length * Math.random() << 0;
        leitnerDecks[0].splice(randomSplice, 0, i);
        }
    for (var word in masteredWords) {
        randomSplice = leitnerDecks[0].length * Math.random() << 0;
        if (Math.ceil(Math.exp(masteredWords[word])) === sessionNumber) {
            leitnerDecks[0].splice(randomSplice, 0, word)
        }
    }
    return leitnerDecks;
};


var checkDeck = function(leitnerIndex, deckQueue, handlerInput, leitnerDecks) {
    //checking current leitner deck to see if it contains any flashcards
    //recursive check until a non-empty deck is found
    var currentLeitnerDeck = deckQueue[leitnerIndex];
    var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      
    if (leitnerDecks[currentLeitnerDeck].length === 0) {
        if (leitnerIndex === deckQueue.length-1) {
            return null;
        } else {
            leitnerIndex = leitnerIndex + 1;
            return checkDeck(leitnerIndex, deckQueue, handlerInput, leitnerDecks);
        }
    } else {
    sessionAttributes['leitnerIndex'] = leitnerIndex;
    sessionAttributes['currentLeitnerDeck'] = currentLeitnerDeck;
    return currentLeitnerDeck;
    }
};

var shuffle = function(array) { //https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
};

var getDeckQueue = function(deckFreq) {
    //creates the randomised deck queue for practice session
        
    var decks = [0, 1, 2];  
    var deckQueue = [];
      
 	for (var i in decks) {
 		for (var j = 0; j < deckFreq[i]; j++) {
 			deckQueue.push(Number(i));
   	    }
   	 }
   	 
 	//getting random order and starting with deck 1	 
 	deckQueue = shuffle(deckQueue);
 	deckQueue.unshift(0);
     	
    return deckQueue;
};


module.exports = {
  
    practiceVocab : function(handlerInput, leitnerDecks) {
        //generates cue for cue-target pair practice
          
        //get session attributes 
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        var leitnerIndex = sessionAttributes.leitnerIndex;
        var deckQueue = sessionAttributes.deckQueue;
        var vocabListUserIndex = sessionAttributes.vocabListUserIndex;
        
        var cue = "";
        
        var currentLeitnerDeck = checkDeck(leitnerIndex, deckQueue, handlerInput, leitnerDecks);
        
        if (currentLeitnerDeck === null) {
            if (sessionAttributes.vocabListUserIndex === vocabDictLength-5) {
                cue = "You've mastered all 100 words, well done." +
                " If you want to practice them again, say 'restart'." +
                " If not, say, 'exit'."
            } else {
                cue = "You've learnt 5 new words, great job!' " +
                " If you want to keep learning, say, 'continue'. " +
                " If not, say, 'exit'.";
            }
            sessionAttributes.leitnerDecks = leitnerDecks;
        } else {
            var vocabDictIndex = leitnerDecks[currentLeitnerDeck][0];
            cue = switchLang(vocabDictMain[vocabDictIndex][1]);
            var answer = vocabDictMain[vocabDictIndex][0];
        }
        
        sessionAttributes['currentAnswer'] = answer;
        sessionAttributes['currentQuestion'] = cue;
      
        return cue;
    },
  
    PracticeIntentHandler : {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'practiceIntent';
        },
        handle(handlerInput) {
          
            //getting session attributes 
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            var vocabListUserIndex = sessionAttributes.vocabListUserIndex;
            var sessionNumber = sessionAttributes.sessionNumber;
            var masteredWords = sessionAttributes.masteredWords; 
            
            if (sessionAttributes.newUser === true) {
                var leitnerDecks =  [[],[],[]];
                sessionAttributes.newUser = false;
            } else {
                leitnerDecks = sessionAttributes.leitnerDecks;
                if (vocabListUserIndex <= 90) {
                    vocabListUserIndex += 5;
                }
            }
            
            leitnerDecks = addtoLeitner(leitnerDecks, vocabListUserIndex, sessionNumber, masteredWords);
            
            //setting session attributes 
            sessionAttributes.leitnerDecks = leitnerDecks;
            sessionAttributes.deckQueue = getDeckQueue([4, 2, 1]);
            sessionAttributes.leitnerIndex = 0;
            sessionAttributes.vocabListUserIndex = vocabListUserIndex;
            
            var speechText = "Ok, let's begin. "
          
            speechText += module.exports.practiceVocab(handlerInput, leitnerDecks);
            
            var repromptText = "The Japanese word is " + sessionAttributes.currentQuestion + 
            "If you want to know the English meaning, you can say, 'reveal' ";
            
            sessionAttributes['repromptText'] = repromptText;
            
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(repromptText)
                .getResponse();
        }
    },

    RestartPracticeHandler : {
        canHandle(handlerInput) {
              return handlerInput.requestEnvelope.request.type === 'IntentRequest'
                  && handlerInput.requestEnvelope.request.intent.name === 'restartPracticeIntent';
        },
        handle(handlerInput) {
            //get session attributes 
            const attributesManager = handlerInput.attributesManager;
            const sessionAttributes = attributesManager.getSessionAttributes();
            var sessionNumber = sessionAttributes.sessionNumber
            var masteredWords = sessionAttributes.masteredWords
            var vocabListUserIndex = sessionAttributes.vocabListUserIndex;
            var vocabDictMain = sessionAttributes.vocabDictMain;
            var leitnerDecks = sessionAttributes.leitnerDecks;
            
            if (vocabListUserIndex === 5) {
                vocabListUserIndex = 0; 
                sessionNumber = 1;
                masteredWords = {};
            } else {
                vocabListUserIndex +=5;
            }
            
            leitnerDecks = addtoLeitner(leitnerDecks, vocabListUserIndex, sessionNumber, masteredWords);
            
            //setting session attributes 
            sessionAttributes.deckQueue = getDeckQueue([4, 2, 1]);
            sessionAttributes.leitnerIndex = 0;
            sessionAttributes.vocabListUserIndex = vocabListUserIndex;
            sessionAttributes.sessionNumber = sessionNumber;
            sessionAttributes.masteredWords = masteredWords;
            sessionAttributes.leitnerDecks = leitnerDecks;
            
            const speechText = "Ok, let's keep practicing! " +
            module.exports.practiceVocab(handlerInput, leitnerDecks);
            
            const repromptText = "The Japanese word is " + sessionAttributes.currentQuestion;
            sessionAttributes.repromptText = repromptText;
    
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(repromptText)
                .getResponse();
        }
    }
};

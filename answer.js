'use strict';

const constants = require('./constants');
const vocabDict = constants.vocabDict;
const answerDict = constants.answerDict;
const practice = require('./practice');
const practiceVocab = practice.practiceVocab;

var addMastered = function(masteredWords, word) {
    if (word in masteredWords) {
        masteredWords[word] += 1;        
    } else {
        masteredWords[word] = 1;
    }
}

var moveCard = function(answer, question, currentLeitnerDeck, result, leitnerDecks, masteredWords) {
    
    //moves cue-target pairs up and down leitner deck 
    var currentDeckList = leitnerDecks[currentLeitnerDeck];
    var previousDeckList = leitnerDecks[currentLeitnerDeck-1];
    var nextDeckList = leitnerDecks[currentLeitnerDeck+1];

    if (result === 'correct') {
        //correct items from final deck removed completely
        //and added to mastered list 
        if (currentLeitnerDeck === 2) {
            var word = currentDeckList[0]
            addMastered(masteredWords, word);
            currentDeckList.splice(0, 1);
        } else {
            //otherwise promoted to next deck 
            nextDeckList.push(currentDeckList[0]);
            currentDeckList.splice(0, 1);
        }
    } else {
      //incorrect items from deck 0 placed at bottom of pile 
        if (currentLeitnerDeck === 0) {
            currentDeckList.push(currentDeckList[0]);
            currentDeckList.splice(0, 1);
        } else {
            //otherwise demoted to previous deck 
            previousDeckList.push(currentDeckList[0]);
            currentDeckList.splice(0, 1);
        }
    }
    return leitnerDecks;
}; 
    
module.exports = {

    AnswerIntentHandler : {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'answerIntent';
        },
        handle(handlerInput) {
              
            //getting session attributes 
            const attributesManager = handlerInput.attributesManager;
            const sessionAttributes = attributesManager.getSessionAttributes();
            var correctAnswer = sessionAttributes.currentAnswer;
            const question = sessionAttributes.currentQuestion;
            const currentLeitnerDeck = sessionAttributes.currentLeitnerDeck;
            var leitnerDecks = sessionAttributes.leitnerDecks;
            var masteredWords = sessionAttributes.masteredWords;
            var sessionNumber = sessionAttributes.sessionNumber;
              
            var userAnswer = ""; 
            var speechText = "";
            var repromptText = "";
              

            userAnswer = handlerInput.requestEnvelope.request.intent.slots.answer.value;
            if (userAnswer === correctAnswer) {
                speechText = answerDict['correct'][answerDict['correct'].length * Math.random() << 0]
                //if user's answer is correct, move the flashcard up a deck 
                leitnerDecks = moveCard(correctAnswer, question, currentLeitnerDeck, 'correct', leitnerDecks, masteredWords);
            } else {
                
                speechText = answerDict['incorrect'][answerDict['incorrect'].length * Math.random() << 0] + 
                "The answer is " + correctAnswer + ", ";
                //if user's answer is incorrect, move the flashcard down a deck 
                leitnerDecks = moveCard(correctAnswer, question, currentLeitnerDeck, 'incorrect', leitnerDecks, masteredWords);
            }
            sessionAttributes.leitnerDecks = leitnerDecks;
            speechText += practiceVocab(handlerInput, leitnerDecks);
            repromptText += practiceVocab(handlerInput, leitnerDecks);
      
            
            //set session attributes 
            sessionAttributes.repromptText = repromptText;
            sessionAttributes.masteredWords = masteredWords;
                
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(repromptText)
                .getResponse();
        }
    }
};